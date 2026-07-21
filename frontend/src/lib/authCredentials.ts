import crypto from 'node:crypto';

const keyLength = 32;

export async function verifyPassword(password: string, encoded: string) {
  const [scheme, costText, blockSizeText, parallelText, saltText, digestText, extra] = encoded.split('$');
  if (scheme !== 'scrypt' || extra || !saltText || !digestText) return false;
  const N = Number(costText); const r = Number(blockSizeText); const p = Number(parallelText);
  if (N !== 16384 || r !== 8 || p !== 1 || password.length < 8 || password.length > 200) return false;
  try {
    const derived = await new Promise<Buffer>((resolve, reject) => crypto.scrypt(password, Buffer.from(saltText, 'base64url'), keyLength, { N, r, p }, (error, value) => error ? reject(error) : resolve(value as Buffer)));
    const expected = Buffer.from(digestText, 'base64url');
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch { return false; }
}
