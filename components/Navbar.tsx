'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, LayoutDashboard, LogIn, LogOut, Plus, Menu, X, Info, Star } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Returns inline styles for a nav link, highlighting it when active
  const navLinkStyle = (href: string): React.CSSProperties => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return {
      padding: '0.5rem 0.875rem',
      borderRadius: 8,
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      fontSize: '0.9rem',
      fontWeight: isActive ? 700 : 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      transition: 'all 0.2s',
      background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
      boxShadow: isActive ? 'inset 0 0 0 1px rgba(124, 58, 237, 0.3)' : 'none',
    };
  };

  const mobileNavLinkStyle = (href: string): React.CSSProperties => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return {
      padding: '0.75rem',
      borderRadius: 8,
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: isActive ? 700 : 400,
      background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
    };
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 800, fontSize: '1.1rem' }}>
          <Image
            src="/raisoni-logo.webp"
            alt="GH Raisoni College"
            width={120}
            height={40}
            style={{ objectFit: 'contain', height: 40, width: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          <Link href="/projects" style={navLinkStyle('/projects')}>
            <Search size={16} /> Explore
          </Link>
          <Link href="/about" style={navLinkStyle('/about')}>
            <Info size={16} /> About
          </Link>
          <a
            href="https://github.com/MrSpideyNihal/Findmeproject"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.5rem 0.875rem', borderRadius: 8, color: 'var(--text-amber)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' }}
          >
            <Star size={16} fill="var(--text-amber)" /> Star Repo
          </a>
          {session ? (
            <>
              <Link href="/dashboard" style={navLinkStyle('/dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link href="/add-project" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem' }}>
                <Plus size={16} /> Add Project
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.25rem' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={navLinkStyle('/auth/login')}>
                <LogIn size={16} /> Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'none' }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu" style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-secondary)',
          padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
        }}>
          <Link href="/projects" onClick={() => setMobileOpen(false)} style={mobileNavLinkStyle('/projects')}>
            <Search size={16} /> Explore Projects
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} style={mobileNavLinkStyle('/about')}>
            <Info size={16} /> About
          </Link>
          <a
            href="https://github.com/MrSpideyNihal/Findmeproject"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{ padding: '0.75rem', borderRadius: 8, color: 'var(--text-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Star size={16} fill="var(--text-amber)" /> Star Repo
          </a>
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={mobileNavLinkStyle('/dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link href="/add-project" onClick={() => setMobileOpen(false)} style={mobileNavLinkStyle('/add-project')}>
                <Plus size={16} /> Add Project
              </Link>
              <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }} style={{ padding: '0.75rem', borderRadius: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={mobileNavLinkStyle('/auth/login')}>
                <LogIn size={16} /> Login
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}


