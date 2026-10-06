import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const prefix = 'scrypt-v1';
const dummyHash = `${prefix}$${'00'.repeat(16)}$${'00'.repeat(32)}`;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 32, options, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt);
  return `${prefix}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  const validFormat = typeof stored === 'string' && /^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(stored);
  const [, salt, expected] = (validFormat ? stored : dummyHash).split('$');
  const actual = await derive(password, Buffer.from(salt, 'hex'));
  return timingSafeEqual(actual, Buffer.from(expected, 'hex')) && validFormat;
}
