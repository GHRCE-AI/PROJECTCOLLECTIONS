import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Github, Users, Layers, ArrowRight, FolderGit2, Lightbulb, Rocket, Calendar } from 'lucide-react';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';

export const metadata: Metadata = {
  title: 'Raisoni-Projects – Student Innovation & Engineering Showcase',
  description: 'Discover, explore and get inspired by amazing college projects from students of G.H. Raisoni College of Engineering.',
};

async function getStats() {
  try {
    await dbConnect();
    const [totalProjects, batches, memberCountResult] = await Promise.all([
      Project.countDocuments(),
      Project.distinct('batchName'),
      Project.aggregate([
        { $project: { memberCount: { $size: { $ifNull: ['$members', []] } } } },
        { $group: { _id: null, total: { $sum: '$memberCount' } } }
      ])
    ]);
    const totalMembers = memberCountResult[0]?.total || 0;
    return { totalProjects, totalBatches: batches.length, totalMembers };
  } catch (error) {
    console.error('getStats error:', error);
    return { totalProjects: 0, totalBatches: 0, totalMembers: 0 };
  }
}

async function getFeaturedProjects() {
  try {
    await dbConnect();
    return await Project.find().sort({ createdAt: -1 }).limit(4).lean();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, featuredProjects] = await Promise.all([getStats(), getFeaturedProjects()]);

  return (
    <div>
      {/* ── Hero — "College Projects Made Simple" ─────────────────────────────── */}
      <section className="hero-clean" style={{ padding: '3.5rem 0 3rem', position: 'relative', overflow: 'hidden' }}>
        <div className="container hero-grid">
          {/* Left: headline */}
          <div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              College Projects
              <br />
              Made <span className="hl">Simple</span>
            </h1>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 480, marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Discover, explore and get inspired by amazing college projects from students like you.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/projects" className="btn btn-accent btn-lg">
                <Search size={18} /> Explore Projects <ArrowRight size={18} />
              </Link>
              <Link href="/auth/login" className="btn btn-secondary btn-lg">
                Teacher Login
              </Link>
            </div>
          </div>

          {/* Right: sketch laptop + sticky note */}
          <div style={{ position: 'relative', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="tape" style={{ top: 6, left: '42%', zIndex: 3 }} />
            <div
              className="paper-torn"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                transform: 'rotate(-1.5deg)',
                background: 'linear-gradient(135deg, #cfe4ff 0%, #bcd6f5 100%)',
                maxWidth: 360,
                width: '100%',
              }}
            >
              {/* doodled laptop */}
              <div style={{ border: '3px solid var(--ink)', borderRadius: '10px 12px 10px 12px', background: '#1f1b16', padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#ffd23c', fontWeight: 700 }}>&lt;/&gt;</span>
              </div>
              <div style={{ height: 10, background: 'var(--ink)', borderRadius: '0 0 8px 8px', marginTop: 4 }} />
              <p style={{ textAlign: 'center', fontFamily: 'var(--font-hand)', fontWeight: 700, marginTop: '0.75rem', color: 'var(--ink)' }}>
                Code · Create · Innovate
              </p>
            </div>
            <div className="sticky-note" style={{ position: 'absolute', bottom: -10, right: -6, maxWidth: 150, zIndex: 4, fontSize: '0.95rem' }}>
              Good Projects → Better Future :)
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 0 0.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="stat-label">Published Projects</span>
                <FolderGit2 size={20} color="var(--accent-brand)" />
              </div>
              <div className="stat-number">{stats.totalProjects.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="stat-label">Student Innovators</span>
                <Users size={20} color="var(--accent-brand)" />
              </div>
              <div className="stat-number">{stats.totalMembers.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="stat-label">Academic Batches</span>
                <Layers size={20} color="var(--accent-brand)" />
              </div>
              <div className="stat-number">{stats.totalBatches}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Projects ───────────────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section style={{ padding: '2.5rem 0 3rem' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '3px solid var(--ink)', paddingBottom: '0.15rem' }}>
                Latest Projects
              </h2>
              <Link href="/projects" className="btn btn-secondary btn-sm">
                View All <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {featuredProjects.map((project, i) => {
                const lead = project.members?.find((m: { isLead?: boolean }) => m.isLead) || project.members?.[0];
                const rotations = ['-1deg', '0.8deg', '-0.6deg', '1deg'];
                return (
                  <Link
                    href={`/projects/${project._id}`}
                    key={project._id.toString()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="project-card" style={{ height: '100%', transform: `rotate(${rotations[i % rotations.length]})` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="tag tag-batch">{project.batchName}</span>
                        </div>
                        {project.githubUrl && (
                          <Github size={17} color="var(--text-muted)" />
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.25, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        {project.title}
                      </h3>

                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem', flex: 1 }}>
                        {project.abstract?.length > 120 ? `${project.abstract.slice(0, 120)}...` : project.abstract}
                      </p>

                      {project.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                          {project.tags.slice(0, 3).map((t: string) => (
                            <span key={t} className="tag">{t}</span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1.5px dashed var(--border-secondary)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-hand)', fontWeight: 700 }}>
                          <Users size={13} /> {lead?.name || 'Student Team'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} /> {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Feature row ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '1rem 0 3rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: Lightbulb, title: 'Real College Projects', text: 'Built by students, for students.' },
              { icon: Github, title: 'Open Source', text: 'Explore code, learn and contribute.' },
              { icon: Users, title: 'Student Community', text: 'Share, get feedback and grow together.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 46, height: 46, border: '2px solid var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--highlight-soft)' }}>
                  <Icon size={22} color="var(--ink)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ fontFamily: 'var(--font-hand)', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Faculty CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
              position: 'relative',
            }}
          >
            <div className="tape" style={{ top: -12, left: '46%' }} />
            <div style={{ flex: '1 1 360px' }}>
              <span className="tag tag-accent" style={{ marginBottom: '0.75rem' }}>
                <Rocket size={13} /> Faculty Portal
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)' }}>
                Your next big project might be here…
              </h2>
              <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                Faculty advisors can import projects via Excel or submit individual entries with repository links, demos and verified team rosters.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-primary">
                Register as Faculty
              </Link>
              <Link href="/auth/login" className="btn btn-accent">
                Faculty Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
