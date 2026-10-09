import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';

// Issues a fresh addition-captcha challenge: the two numbers to display plus a
// signed token binding their sum. Verified later by /api/auth/register and the
// NextAuth credentials authorize() step.
export async function GET() {
  try {
    const { a, b, token } = generateCaptcha();
    return NextResponse.json(
      { a, b, token },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Captcha service unavailable' },
      { status: 500 }
    );
  }
}
