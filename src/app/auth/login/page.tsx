'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Server-verified addition captcha (bot / brute-force gate) ───────────────
  const [captcha, setCaptcha] = useState<{ a: number; b: number; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const newCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/captcha', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCaptcha({ a: data.a, b: data.b, token: data.token });
      setCaptchaAnswer('');
    } catch {
      setCaptcha(null);
    }
  }, []);

  useEffect(() => {
    // Load the first challenge on mount. setState runs only after the awaited
    // fetch resolves, so it never fires synchronously during the effect.
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/captcha', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setCaptcha({ a: data.a, b: data.b, token: data.token });
      } catch {
        if (active) setCaptcha(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email address is required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    // Quick client-side check for instant feedback (the real check is server-side).
    if (!captcha) {
      setErrors({ captcha: 'Security check failed to load. Please refresh it.' });
      return;
    }
    if (parseInt(captchaAnswer, 10) !== captcha.a + captcha.b) {
      setErrors({ captcha: 'Incorrect answer. Please solve the sum to continue.' });
      newCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        captchaAnswer,
        captchaToken: captcha.token,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error, 'error');
        newCaptcha(); // force a fresh sum on every failed attempt
      } else {
        showToast('Signed in successfully', 'success');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      newCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* College / Platform Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Image
              src="/raisoni-logo.webp"
              alt="GH Raisoni College"
              width={160}
              height={50}
              style={{ objectFit: 'contain', height: 48, width: 'auto' }}
              priority
            />
          </Link>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Faculty Sign In
          </h1>
          <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Access your project management dashboard
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--ink)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required" htmlFor="email">
                Institutional Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@raisoni.net"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: '2.4rem' }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* ── Addition captcha ─────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label required" htmlFor="captcha" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={15} color="var(--accent-brand)" /> Security Check
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    background: 'var(--highlight-soft)',
                    border: '2px solid var(--ink)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.1rem 0.9rem',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    color: 'var(--text-primary)',
                    minWidth: 118,
                    textAlign: 'center',
                  }}
                  aria-label={captcha ? `What is ${captcha.a} plus ${captcha.b}?` : 'Loading'}
                >
                  {captcha ? `${captcha.a} + ${captcha.b} = ?` : '…'}
                </span>
                <input
                  id="captcha"
                  type="text"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => {
                    setCaptchaAnswer(e.target.value.replace(/[^0-9]/g, ''));
                    if (errors.captcha) setErrors((p) => ({ ...p, captcha: '' }));
                  }}
                  placeholder="Answer"
                  className={`form-input ${errors.captcha ? 'error' : ''}`}
                  style={{ maxWidth: 120 }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={newCaptcha}
                  title="New question"
                  aria-label="Refresh security check"
                  style={{ background: 'none', border: '2px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              {errors.captcha && <span className="form-error">{errors.captcha}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="login-submit"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', fontFamily: 'var(--font-hand)', color: 'var(--text-secondary)' }}>
          Don&apos;t have faculty access?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent-brand)', fontWeight: 700 }}>
            Register with code
          </Link>
        </div>
      </div>
    </div>
  );
}
