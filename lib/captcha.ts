import crypto from 'crypto';

/**
 * Stateless, server-verified addition captcha.
 *
 * The correct answer is bound into an HMAC-signed, time-limited token. The
 * client is shown `a` and `b` and must return the sum plus the token; the
 * server recomputes the signature over the submitted answer and only accepts it
 * when it matches. An attacker cannot forge a valid token without the secret,
 * so the captcha is enforced server-side — the client widget is just the UI.
 *
 * Stateless (no DB/session needed) so it works on serverless/edge-less Node
 * runtimes and across multiple instances.
 */

const TTL_MS = 5 * 60 * 1000; // token valid for 5 minutes

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) {
    // Fail loud in dev; in prod NEXTAUTH_SECRET is always required anyway.
    throw new Error('NEXTAUTH_SECRET must be set for captcha signing');
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export interface CaptchaChallenge {
  a: number;
  b: number;
  token: string;
}

export function generateCaptcha(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 9) + 1; // 1..9
  const b = Math.floor(Math.random() * 9) + 1; // 1..9
  const exp = Date.now() + TTL_MS;
  const sig = sign(`${a + b}.${exp}`);
  return { a, b, token: `${exp}.${sig}` };
}

export function verifyCaptcha(answer: unknown, token: unknown): boolean {
  if (typeof token !== 'string') return false;
  if (answer === null || answer === undefined) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const sum = parseInt(String(answer).trim(), 10);
  if (!Number.isInteger(sum)) return false;

  const expected = sign(`${sum}.${exp}`);

  // Constant-time comparison to avoid signature timing leaks.
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}
