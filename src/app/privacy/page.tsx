import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ProjectHub (Raisoni-Projects) collects, uses and protects data.',
};

const sections = [
  {
    heading: 'What we collect',
    body: 'Faculty accounts store a name, institutional email and a securely hashed password. Project entries store the information faculty choose to publish — titles, abstracts, repository links, demo links, team member names/roles and tags. We do not collect data from visitors who only browse published projects.',
  },
  {
    heading: 'How we use it',
    body: 'Account data is used solely to authenticate faculty and attribute the projects they publish. Published project data is shown on the public showcase so students, peers and recruiters can discover the work. We never sell data or use it for advertising.',
  },
  {
    heading: 'How we protect it',
    body: 'Passwords are hashed with bcrypt and never stored or displayed in plain text. Sessions use signed, encrypted tokens. Sign-in and registration are protected by an addition captcha, server-side rate limiting and brute-force lockout. Security headers (CSP, HSTS, anti-clickjacking) are enforced on every response.',
  },
  {
    heading: 'Third-party links',
    body: 'Projects may link to GitHub repositories and YouTube demos. Visiting those links is subject to the privacy policies of those third parties, not this one.',
  },
  {
    heading: 'Your choices',
    body: 'Faculty may request correction or removal of any project they published, or deletion of their account, by contacting their department administrator. Removing a project removes it from the public showcase.',
  },
  {
    heading: 'Changes',
    body: 'This policy may be updated as the platform evolves. Material changes will be reflected on this page with a new effective date.',
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ padding: '3.5rem 0 5rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)', fontWeight: 700, marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 48, height: 48, border: '2px solid var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--highlight-soft)' }}>
            <Shield size={24} color="var(--ink)" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Privacy Policy</h1>
        </div>
        <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--text-muted)', marginBottom: '2.25rem', fontSize: '1.05rem' }}>
          Effective 9 October 2026 · ProjectHub (Raisoni-Projects)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sections.map((s) => (
            <div
              key={s.heading}
              style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--ink)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                {s.heading}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
