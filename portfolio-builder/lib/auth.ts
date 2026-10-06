import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { AccountError, emailSchema, enforceRateLimit, findAccount } from './account-security';
import { verifyPassword } from './passwords';

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, req) {
      const email = emailSchema.safeParse(credentials?.email);
      if (!email.success || !credentials?.password || credentials.password.length > 128) return null;
      try {
        const headers = req.headers ?? {};
        const clientIp = String(headers['x-vercel-forwarded-for'] ?? headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim();
        await enforceRateLimit('login-ip', clientIp, 100);
        await enforceRateLimit('login-email', email.data, 20);
        const user = await findAccount(email.data);
        const valid = await verifyPassword(credentials.password, user?.passwordHash);
        if (!user || !user.passwordHash || !user.emailVerified || !valid) return null;
        return { id: user.id, email: user.email, name: user.name, authVersion: user.authVersion };
      } catch (error) {
        if (error instanceof AccountError && error.status === 429) throw new Error('TooManyAttempts');
        const code = typeof error === 'object' && error !== null
          ? ('code' in error ? error.code : 'errorCode' in error ? error.errorCode : undefined) : undefined;
        console.error('[auth] Account database sign-in failed', { code, name: error instanceof Error ? error.name : 'UnknownError' });
        throw new Error(code === 'P2021' || code === 'P2022' ? 'DatabaseNotReady' : 'DatabaseSignInFailed');
      }
    },
  })],
  session: { strategy: 'jwt' }, pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.authVersion = (user as { authVersion?: number }).authVersion; }
      // Reject old demo sessions, and revoke prior sessions after a password reset.
      if (typeof token.id !== 'string' || typeof token.authVersion !== 'number') return {};
      const account = await prisma.user.findUnique({ where: { id: token.id }, select: {
        authVersion: true, passwordHash: true, emailVerified: true,
      } });
      if (!account?.passwordHash || !account.emailVerified || account.authVersion !== token.authVersion) return {};
      return token;
    },
    async session({ session, token }) {
      if (typeof token.id !== 'string' || typeof token.authVersion !== 'number') {
        return { ...session, user: undefined, expires: new Date(0).toISOString() };
      }
      return session;
    },
  },
};
