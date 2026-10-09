import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
export class PasswordBusyError extends Error {}
let active = 0;
const derive = async (password: string, salt: string): Promise<Buffer> => {
  if (active >= 1)
    throw new PasswordBusyError(
      'Password verification is busy. Please retry shortly.',
    );
  active += 1;
  try {
    return await new Promise<Buffer>((resolve, reject) =>
      scrypt(
        password,
        salt,
        64,
        { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 },
        (error, key) => (error ? reject(error) : resolve(key)),
      ),
    );
  } finally {
    active -= 1;
  }
};
export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `scrypt:131072:8:1:${salt}:${key.toString('hex')}`;
};
export const verifyPassword = async (password: string, stored: string) => {
  const parts = stored.split(':');
  if (parts.length !== 6 || parts.slice(0, 4).join(':') !== 'scrypt:131072:8:1')
    return false;
  const expected = Buffer.from(parts[5], 'hex');
  const actual = await derive(password, parts[4]);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
export const dummyPasswordHash =
  'scrypt:131072:8:1:00000000000000000000000000000000:' + '00'.repeat(64);
