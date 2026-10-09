import Link from 'next/link';
import { Star, Shield, Info } from 'lucide-react';

const REPO_URL = 'https://github.com/MrSpideyNihal/Findmeproject';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          © {new Date().getFullYear()} ProjectHub · G.H. Raisoni College of Engineering
        </span>
        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.9rem', fontFamily: 'var(--font-hand)', fontWeight: 700 }}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}
          >
            <Star size={15} /> Star on GitHub
          </a>
          <Link href="/privacy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <Shield size={15} /> Privacy Policy
          </Link>
          <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <Info size={15} /> About
          </Link>
        </div>
      </div>
    </footer>
  );
}
