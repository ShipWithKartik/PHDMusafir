import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiUser, FiAlertCircle } from 'react-icons/fi';
import React from 'react';
import api from '../services/api';
import DiscoverSidebar from '../components/DiscoverSidebar';
import PostNavigation from '../components/PostNavigation';
import RecommendedPosts from '../components/RecommendedPosts';
import CommentSection from '../components/CommentSection';

/* ── Error boundary for comments ─ */
class CommentErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ── Helpers ─────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/* ── Inline image gallery ────────────────────────────── */
function ImageGallery({ images }) {
  if (!images || images.length === 0) return null;

  const remaining = images.slice(1); // skip cover (shown as hero)
  if (remaining.length === 0) return null;

  return (
    <div style={{ margin: '2.5rem 0' }}>
      <p style={{
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em',
        textTransform: 'uppercase', color: '#9A9A9A',
        marginBottom: '1rem',
      }}>
        From the Album
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: remaining.length === 1
          ? '1fr'
          : remaining.length === 2
            ? '1fr 1fr'
            : 'repeat(3, 1fr)',
        gap: '0.75rem',
      }}>
        {remaining.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              aspectRatio: remaining.length === 1 ? '16/7' : '4/3',
            }}
          >
            <img
              src={img.url}
              alt={`Blog image ${i + 2}`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────── */
function BlogDetailSkeleton() {
  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ height: '60vh', background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ maxWidth: 740, margin: '3rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[60, 90, 40, 100, 100, 80].map((w, i) => (
          <div key={i} style={{ height: i < 3 ? 20 : 14, width: `${w}%`, borderRadius: 6, background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export default function BlogDetail() {
  const { id, slug } = useParams();
  const blogId = id || slug;
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    (async () => {
      try {
        setLoading(true); setError('');
        const [detailRes, listRes] = await Promise.all([
          api.get(`/blogs/${blogId}`),
          api.get('/blogs'),
        ]);
        setBlog(detailRes.data.data);
        setAllBlogs(listRes.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load this entry.');
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId]);

  if (loading) return (
    <>
      <BlogDetailSkeleton />
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </>
  );

  if (error || !blog) return (
    <div style={{
      minHeight: '100vh', paddingTop: 160, display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center',
    }}>
      <FiAlertCircle style={{ fontSize: '3rem', color: '#3B5F54' }} />
      <p style={{ fontWeight: 600, color: '#3B5F54' }}>{error || 'Blog not found.'}</p>
      <Link to="/journal" style={{ color: '#3B5F54', fontWeight: 600 }}>← Back to Journal</Link>
    </div>
  );

  const coverUrl = blog.images?.[0]?.url;

  // Determine prev/next within the same city + category silo
  const sameSilo = [...allBlogs]
    .filter(
      (b) =>
        (b.city || '').toLowerCase() === (blog.city || '').toLowerCase() &&
        (b.category || '').toLowerCase() === (blog.category || '').toLowerCase()
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
  const siloIdx = sameSilo.findIndex((b) => b._id === blog._id);
  const prevPost = siloIdx >= 0 && siloIdx < sameSilo.length - 1 ? sameSilo[siloIdx + 1] : null; // older
  const nextPost = siloIdx > 0 ? sameSilo[siloIdx - 1] : null; // newer

  // Recommended: prefer same category, fallback to city, then random
  const allSorted = [...allBlogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const pool = allSorted.filter((b) => b._id !== blog._id);
  const sameCategory = blog.category
    ? pool.filter((b) => (b.category || '').toLowerCase() === blog.category.toLowerCase())
    : [];
  const sameCity = blog.city
    ? pool.filter((b) => (b.city || '').toLowerCase() === blog.city.toLowerCase())
    : [];
  const pickUnique = (arr, limit) => {
    const out = [];
    for (const item of arr) {
      if (out.length >= limit) break;
      if (!out.some((x) => x._id === item._id)) out.push(item);
    }
    return out;
  };
  const recommended = (() => {
    const first = pickUnique(sameCategory, 3);
    if (first.length >= 2) return first;
    const second = pickUnique([...first, ...sameCity], 3);
    if (second.length >= 2) return second;
    // simple deterministic-ish fallback (already sorted)
    return pickUnique([...second, ...pool], 3);
  })();

  return (
    <>
      <article style={{ minHeight: '100vh', background: '#FDFAF6', paddingTop: 80 }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative',
          height: '65vh', minHeight: 480, maxHeight: 780,
          overflow: 'hidden',
          marginTop: -80,
        }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={blog.title}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                animation: 'ken-burns 28s ease-out forwards',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #2A483E, #3B5F54)',
            }} />
          )}

          {/* Gradient scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.72) 100%)',
          }} />

          {/* Back button */}
          <button
            onClick={() => navigate('/journal')}
            style={{
              position: 'absolute', top: 100, left: '1.5rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
              color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              padding: '0.5rem 1rem', borderRadius: 999,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <FiArrowLeft /> Journal
          </button>

          {/* Hero title block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 5vw, 4rem)',
              maxWidth: 860,
            }}
          >
            {/* Eyebrow */}
            <p style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: '#D4CDBC',
              marginBottom: '0.8rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
            }}>
              Travel Journal
              {blog.category && (
                <span style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: 999, padding: '0.15em 0.6em',
                  fontSize: '0.6rem', fontWeight: 700,
                  letterSpacing: '0.12em', color: '#fff',
                }}>{blog.category}</span>
              )}
              {blog.city && (
                <span style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 999, padding: '0.15em 0.65em',
                  fontSize: '0.62rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em',
                }}>📍 {blog.city}</span>
              )}
            </p>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.9rem, 5vw, 3.8rem)',
              fontWeight: 700, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.1,
              marginBottom: '1.2rem',
              textShadow: '0 3px 12px rgba(0,0,0,0.45)',
            }}>
              {blog.title}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.35)',
                  background: '#3B5F54',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {blog.author?.profilePicture ? (
                    <img src={blog.author.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                      {blog.author?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}>
                  {blog.author?.name || 'Unknown Author'}
                </span>
              </div>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)',
              }}>
                <FiCalendar style={{ fontSize: '0.75rem' }} />
                {fmtDate(blog.createdAt)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Article body + sidebar ── */}
        <div className="pm-post-layout">
          <div className="pm-post-main" style={{ paddingTop: 'clamp(2.5rem, 5vw, 4rem)' }}>

          {/* Drop cap first paragraph + body text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            {/* Decorative rule above text */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '1.1rem', color: 'var(--accent-warm)' }}>✦</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Content — rendered as styled paragraphs */}
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.05rem, 2vw, 1.18rem)',
              lineHeight: 1.95,
              color: '#3A3A3A',
              letterSpacing: '0.01em',
            }}>
              {blog.content.split('\n\n').map((para, i) => {
                if (!para.trim()) return null;

                // Drop-cap on the very first paragraph
                if (i === 0) {
                  const [first, ...rest] = para.trim();
                  return (
                    <p key={i} style={{ marginBottom: '1.6em' }}>
                      <span style={{
                        float: 'left',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '4.2em',
                        lineHeight: 0.78,
                        fontWeight: 900,
                        color: '#2A483E',
                        marginRight: '0.1em',
                        marginTop: '0.12em',
                        paddingBottom: '0.05em',
                      }}>
                        {first}
                      </span>
                      {rest.join('')}
                    </p>
                  );
                }

                // Double-hash lines → sub-heading
                if (para.startsWith('## ')) {
                  return (
                    <h2 key={i} style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                      fontWeight: 700, color: '#2A483E',
                      margin: '2.2em 0 0.6em',
                      letterSpacing: '-0.01em',
                    }}>
                      {para.slice(3)}
                    </h2>
                  );
                }

                // Single-hash lines → section heading
                if (para.startsWith('# ')) {
                  return (
                    <h3 key={i} style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                      fontWeight: 700, color: '#3B5F54',
                      margin: '2em 0 0.5em', letterSpacing: '-0.01em',
                    }}>
                      {para.slice(2)}
                    </h3>
                  );
                }

                return <p key={i} style={{ marginBottom: '1.6em' }}>{para.trim()}</p>;
              })}
            </div>

            {/* Image gallery (remaining images after cover) */}
            <ImageGallery images={blog.images} />

            {/* Closing rule */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginTop: '3rem', paddingTop: '2.5rem',
              borderTop: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '1rem', color: 'var(--accent-warm)' }}>✦</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Author byline card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginTop: '2rem', padding: '1.25rem 1.5rem',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                overflow: 'hidden', flexShrink: 0,
                background: '#3B5F54',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {blog.author?.profilePicture ? (
                  <img src={blog.author.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                    {blog.author?.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9A9A9A', marginBottom: '0.2rem' }}>Written by</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#2A483E', fontSize: '1rem' }}>
                  {blog.author?.name || 'Unknown Author'}
                </p>
              </div>
            </div>

            {/* ── Prev / Next navigation ── */}
            <div style={{ marginTop: '3.5rem', marginBottom: '2rem' }}>
              <PostNavigation prevPost={prevPost} nextPost={nextPost} />
            </div>
            <RecommendedPosts posts={recommended} />

            {/* ── Comment section (bottom of page) ── */}
            <div style={{ marginTop: '4.5rem' }}>
              <CommentErrorBoundary>
                <CommentSection
                  targetId={blog._id}
                  targetModel="Blog"
                  postAuthorId={blog.author?._id}
                />
              </CommentErrorBoundary>
            </div>

            {/* Back link */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link
                to="/journal"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#3B5F54', fontWeight: 700, fontSize: '0.88rem',
                  textDecoration: 'none', letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderBottom: '2px solid rgba(59,95,84,0.2)',
                  paddingBottom: '0.15rem',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B5F54'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(59,95,84,0.2)'}
              >
                <FiArrowLeft /> Back to Journal
              </Link>
            </div>
          </motion.div>
          </div>

          <DiscoverSidebar />
        </div>
      </article>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </>
  );
}
