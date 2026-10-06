import { createHash, createHmac, randomInt } from 'node:crypto';
import { z } from 'zod';
import { Resend } from 'resend';
import { prisma } from './prisma';
import { hashPassword } from './passwords';

export class AccountError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
const purposeSchema = z.enum(['register', 'reset']);
export const requestCodeSchema = z.object({ email: emailSchema, purpose: purposeSchema });
export const completeAccountSchema = requestCodeSchema.extend({
  code: z.string().regex(/^\d{8}$/),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(1).max(100).optional(),
});
const windowMs = 15 * 60 * 1000;

export async function enforceRateLimit(scope: string, identifier: string, limit: number): Promise<void> {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const digest = createHash('sha256').update(identifier).digest('hex');
  // A database counter works across Vercel instances. Upsert increments atomically.
  await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  const result = await prisma.authRateLimit.upsert({
    where: { id: `${scope}:${digest}:${bucket}` },
    create: { id: `${scope}:${digest}:${bucket}`, count: 1, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { count: { increment: 1 } },
  });
  if (result.count > limit) throw new AccountError('Too many attempts. Please try again in 15 minutes.', 429);
}

function codeHash(email: string, purpose: string, code: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new AccountError('Account security is not configured. Please contact the site owner.', 503);
  return createHmac('sha256', secret).update(JSON.stringify([email, purpose, code])).digest('hex');
}

export async function findAccount(email: string) {
  const users = await prisma.user.findMany({ where: { email: { equals: email, mode: 'insensitive' } }, take: 2 });
  // Never guess which account owns a legacy email differing only by case.
  if (users.length > 1) throw new AccountError('This account needs help from the site owner.', 409);
  return users[0] ?? null;
}

export async function requestAccountCode(input: z.infer<typeof requestCodeSchema>, clientIp: string) {
  const sender = process.env.AUTH_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !sender || !process.env.NEXTAUTH_SECRET) {
    throw new AccountError('Email verification is not configured. Please contact the site owner.', 503);
  }
  await enforceRateLimit('send-ip', clientIp, 20);
  await enforceRateLimit('send-email', input.email, 3);
  const user = await findAccount(input.email);
  // Return the same response regardless of whether the account exists.
  if ((input.purpose === 'reset' && !user) || (input.purpose === 'register' && user?.passwordHash)) return;
  const code = randomInt(0, 100000000).toString().padStart(8, '0');
  const tokenHash = codeHash(input.email, input.purpose, code);
  const id = `${input.purpose}:${input.email}`;
  await prisma.authChallenge.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.authChallenge.upsert({
    where: { id },
    create: { id, email: input.email, purpose: input.purpose, tokenHash, expiresAt: new Date(Date.now() + windowMs) },
    update: { tokenHash, expiresAt: new Date(Date.now() + windowMs) },
  });
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: sender,
    to: input.email,
    subject: input.purpose === 'register' ? 'Verify your Portfolio Builder account' : 'Set your Portfolio Builder password',
    text: `Your Portfolio Builder verification code is: ${code}\n\nIt expires in 15 minutes. If you did not request this, you can ignore this email.`,
  });
  if (result.error || !result.data?.id) {
    await prisma.authChallenge.deleteMany({ where: { id, tokenHash } });
    throw new AccountError('Unable to send the verification email. Please try again later.', 503);
  }
}

export async function completeAccount(input: z.infer<typeof completeAccountSchema>, clientIp: string) {
  await enforceRateLimit('verify-ip', clientIp, 30);
  await enforceRateLimit('verify-email', input.email, 5);
  const tokenHash = codeHash(input.email, input.purpose, input.code);
  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction(async tx => {
    // Consume the code atomically. Concurrent requests cannot reuse it.
    const consumed = await tx.authChallenge.deleteMany({
      where: { id: `${input.purpose}:${input.email}`, tokenHash, expiresAt: { gt: new Date() } },
    });
    if (consumed.count !== 1) throw new AccountError('The code is invalid or expired. Request a new code.', 400);
    const users = await tx.user.findMany({ where: { email: { equals: input.email, mode: 'insensitive' } }, take: 2 });
    const user = users[0];
    if (users.length > 1 || (input.purpose === 'register' && user?.passwordHash) || (input.purpose === 'reset' && !user)) {
      throw new AccountError('Unable to complete this request. Use the password reset option for an existing account.', 400);
    }
    if (user) {
      await tx.user.update({ where: { id: user.id }, data: {
        passwordHash, emailVerified: new Date(), authVersion: { increment: 1 },
        ...(input.name ? { name: input.name } : {}),
      } });
    } else {
      await tx.user.create({ data: {
        email: input.email, name: input.name ?? input.email.split('@')[0],
        passwordHash, emailVerified: new Date(), authVersion: 1,
      } });
    }
    // Invalidate other outstanding registration/reset codes for this account.
    await tx.authChallenge.deleteMany({ where: { email: input.email } });
  });
}
