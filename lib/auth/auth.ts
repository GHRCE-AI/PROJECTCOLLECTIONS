import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose/mongoose';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations/validations';
import { verifyCaptcha } from '@/lib/captcha';

// ── Server-side brute-force throttle ──────────────────────────────────────────
// Defence-in-depth behind the client captcha: even if someone calls the
// credentials endpoint directly, repeated failures for the same email are
// locked out for a cooldown window. In-memory is fine for a single instance;
// swap for Redis if you scale horizontally.
const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number; firstAt: number }>();

function attemptKey(email: string) {
  return email.trim().toLowerCase();
}

function isLockedOut(email: string): boolean {
  const rec = loginAttempts.get(attemptKey(email));
  if (!rec) return false;
  if (Date.now() - rec.firstAt > LOCKOUT_MS) {
    loginAttempts.delete(attemptKey(email));
    return false;
  }
  return rec.count >= MAX_FAILED;
}

function recordFailure(email: string) {
  const key = attemptKey(email);
  const now = Date.now();
  const rec = loginAttempts.get(key);
  if (!rec || now - rec.firstAt > LOCKOUT_MS) {
    loginAttempts.set(key, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
  // Bound the map so it can't grow without limit.
  if (loginAttempts.size > 5000) {
    for (const [k, v] of loginAttempts) {
      if (now - v.firstAt > LOCKOUT_MS) loginAttempts.delete(k);
    }
  }
}

function clearFailures(email: string) {
  loginAttempts.delete(attemptKey(email));
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        captchaAnswer: { label: 'Captcha', type: 'text' },
        captchaToken: { label: 'Captcha Token', type: 'text' },
      },
      async authorize(credentials) {
        // Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error('Invalid credentials format');
        }

        const { email, password } = parsed.data;

        // Server-side captcha check — enforced here, not just in the browser,
        // so hitting the credentials endpoint directly still requires a valid
        // signed challenge.
        if (!verifyCaptcha(credentials?.captchaAnswer, credentials?.captchaToken)) {
          throw new Error('Captcha verification failed. Please try again.');
        }

        // Block repeated failed attempts for this email.
        if (isLockedOut(email)) {
          throw new Error('Too many failed attempts. Please try again in 15 minutes.');
        }

        // Connect to database
        await dbConnect();

        // Find user. Use the same generic error for "no user" and "bad password"
        // so we don't reveal which emails are registered.
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
          recordFailure(email);
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          recordFailure(email);
          throw new Error('Invalid email or password');
        }

        // Success — reset the counter.
        clearFailures(email);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
