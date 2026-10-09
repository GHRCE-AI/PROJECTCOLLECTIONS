'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, Loader2, Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', accessCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // ── Server-verified addition captcha ────────────────────────────────────────
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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!captcha) {
      showToast('Security check failed to load. Please refresh it.', 'error');
      return;
    }
    if (parseInt(captchaAnswer, 10) !== captcha.a + captcha.b) {
      setErrors({ captcha: ['Incorrect answer. Please solve the sum to continue.'] });
      newCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, captchaAnswer, captchaToken: captcha.token }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setErrors(data.issues);
        } else {
          showToast(data.error || 'Registration failed', 'error');
        }
        newCaptcha();
        return;
      }

      // Auto sign-in after registration (needs its own fresh captcha token).
      let signInCaptcha: { a: number; b: number; token: string } | null = null;
      try {
        const cRes = await fetch('/api/captcha', { cache: 'no-store' });
        if (cRes.ok) signInCaptcha = await cRes.json();
      } catch {
        signInCaptcha = null;
      }

      const result = signInCaptcha
        ? await signIn('credentials', {
            email: form.email,
            password: form.password,
            captchaAnswer: String(signInCaptcha.a + signInCaptcha.b),
            captchaToken: signInCaptcha.token,
            redirect: false,
          })
        : null;

      if (result?.ok) {
        showToast('Account created successfully. Welcome to Raisoni-Projects', 'success');
        router.push('/dashboard');
        router.refresh();
      } else {
        showToast('Account created. Please sign in.', 'success');
        router.push('/auth/login');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Faculty Name', type: 'text', placeholder: 'Prof. / Dr. Full Name', icon: User, autocomplete: 'name' },
    { id: 'email', label: 'Institutional Email', type: 'email', placeholder: 'faculty@raisoni.net', icon: Mail, autocomplete: 'email' },
    { id: 'password', label: 'Password', type: showPassword ? 'text' : 'password', placeholder: 'Minimum 8 characters, 1 uppercase, 1 number', icon: Lock, autocomplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: showPassword ? 'text' : 'password', placeholder: '••••••••', icon: Lock, autocomplete: 'new-password' },
    { id: 'accessCode', label: 'Teacher Access Code', type: 'text', placeholder: 'College authorization code', icon: KeyRound, autocomplete: 'off' },
  ];

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Faculty Registration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Create an account to catalog student projects
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {fields.map(({ id, label, type, placeholder, icon: Icon, autocomplete }) => (
              <div key={id} className="form-group">
                <label className="form-label required" htmlFor={id}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id={id}
                    type={type}
                    value={form[id as keyof typeof form]}
                    onChange={(e) => handleChange(id, e.target.value)}
                    placeholder={placeholder}
                    className={`form-input ${errors[id]?.length ? 'error' : ''}`}
                    style={{
                      paddingLeft: '2.4rem',
                      paddingRight: id === 'password' || id === 'confirmPassword' ? '2.4rem' : '0.85rem',
                    }}
                    autoComplete={autocomplete}
                  />
                  {id === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[id]?.map((err, i) => (
                  <span key={i} className="form-error">
                    {err}
                  </span>
                ))}
              </div>
            ))}

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
                    if (errors.captcha) setErrors((p) => ({ ...p, captcha: [] }));
                  }}
                  placeholder="Answer"
                  className={`form-input ${errors.captcha?.length ? 'error' : ''}`}
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
              {errors.captcha?.map((err, i) => (
                <span key={i} className="form-error">{err}</span>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="register-submit"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have faculty access?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent-brand)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
