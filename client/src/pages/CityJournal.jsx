import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiBookOpen, FiAlertCircle, FiRefreshCw, FiChevronRight,
} from 'react-icons/fi';
import api from '../services/api';
import { getStaticCoverForCity } from '../config/images';

/* ── Helpers ──────────────────────────────────────────── */
const fmtSlug = (s = '') => s.toLowerCase().replace(/\s+/g, '-');
const fromSlug = (s = '') =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ── Category accent colours ─────────────────────────── */
const CATEGORY_PALETTE = {
  Picnic:    { bg: '#E8F5E9', accent: '#2E7D32', text: '#1B5E20' },
  Party:     { bg: '#FCE4EC', accent: '#C2185B', text: '#880E4F' },
  Family:    { bg: '#E3F2FD', accent: '#1565C0', text: '#0D47A1' },
  Nature:    { bg: '#E8F5E9', accent: '#388E3C', text: '#1B5E20' },
  Adventure: { bg: '#FFF3E0', accent: '#E65100', text: '#BF360C' },
  Culture:   { bg: '#F3E5F5', accent: '#6A1B9A', text: '#4A148C' },
  Food:      { bg: '#FFF8E1', accent: '#F57F17', text: '#E65100' },
  Heritage:  { bg: '#EFEBE9', accent: '#4E342E', text: '#3E2723' },
  Spiritual: { bg: '#E0F7FA', accent: '#006064', text: '#004D40' },
  Other:     { bg: '#F5F5F5', accent: '#424242', text: '#212121' },
};

/* ── Skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        height: 200,
        background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[70, 90, 50].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 18 : 12, width: `${w}%`, borderRadius: 6,
            background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Category card ────────────────────────────────────── */
function CategoryCard({ citySlug, category, blogs, index }) {
  const [hovered, setHovered] = useState(false);
  const coverUrl = blogs[0]?.images?.[0]?.url;
  const pal = CATEGORY_PALETTE[category] || CATEGORY_PALETTE.Other;
  const count = blogs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      <Link
        to={`/journal/city/${citySlug}/${fmtSlug(category)}`}
        style={{ textDecoration: 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{
          borderRadius: 20, overflow: 'hidden', background: '#fff',
          boxShadow: hovered
            ? '0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.06)'
            : '0 4px 24px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.35s ease, transform 0.35s ease',
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          cursor: 'pointer',
          position: 'relative',
        }}>

          {/* Cover image */}
          <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: pal.bg }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={category}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transition: 'transform 0.65s ease',
                  transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${pal.accent}22 0%, ${pal.bg} 100%)`,
              }}>
                <FiBookOpen style={{ fontSize: '3rem', color: pal.accent, opacity: 0.35 }} />
              </div>
            )}

            {/* Dark scrim */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />

            {/* Category label over image */}
            <div style={{
              position: 'absolute', bottom: '1rem', left: '1.2rem', right: '1rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.35rem',
                fontWeight: 700, color: '#fff', margin: 0,
                lineHeight: 1.2, letterSpacing: '-0.01em',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'color 0.25s',
              }}>
                {category}
              </h2>
            </div>

            {/* Count badge */}
            <div style={{
              position: 'absolute', top: '0.85rem', right: '0.85rem',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '0.22em 0.75em',
              fontSize: '0.65rem', fontWeight: 700,
              color: '#fff', letterSpacing: '0.08em',
            }}>
              {count} {count === 1 ? 'entry' : 'entries'}
            </div>
          </div>

          {/* Card footer */}
          <div style={{
            padding: '1rem 1.25rem 1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: pal.text,
              background: pal.bg, padding: '0.25em 0.7em', borderRadius: 999,
              border: `1px solid ${pal.accent}33`,
            }}>
              {category}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', fontWeight: 700, color: '#3B5F54',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'gap 0.2s',
              ...(hovered ? { gap: '0.55rem' } : {}),
            }}>
              Explore <FiChevronRight style={{ fontSize: '0.85rem' }} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function CityJournal() {
  const { city: citySlug } = useParams();
  const navigate = useNavigate();
  const cityName = fromSlug(citySlug);

  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await api.get('/blogs');
        const all = res.data.data || [];
        // Filter to only blogs matching this city (case-insensitive)
        const cityBlogs = all.filter(
          (b) => b.city?.toLowerCase() === cityName.toLowerCase()
        );
        setBlogs(cityBlogs);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load entries.');
      } finally {
        setLoading(false);
      }
    })();
  }, [cityName]);

  /* Group by category */
  const categoryMap = {};
  blogs.forEach((b) => {
    const cat = b.category || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(b);
  });
  const categories = Object.keys(categoryMap).sort();

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--bg, #F8F5F1)', paddingTop: 80 }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative', height: '46vh',
          minHeight: 340, maxHeight: 520,
          marginTop: -80, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Background — static cover (not "latest post image") */}
          {!loading ? (
            <img
              src={getStaticCoverForCity(cityName)}
              alt={cityName}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                animation: 'ken-burns 28s ease-out forwards',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #2A483E 0%, #3B5F54 100%)',
            }} />
          )}

          {/* Scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.65) 100%)',
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
              zIndex: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <FiArrowLeft /> Journal
          </button>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 1.5rem', marginTop: 80 }}
          >
            <p style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: '#D4CDBC',
              marginBottom: '0.75rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              — Explore by Category —
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
              fontWeight: 700, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.08,
              margin: 0,
              textShadow: '0 4px 20px rgba(0,0,0,0.50)',
            }}>
              {cityName}
            </h1>
            {!loading && categories.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  marginTop: '1rem',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(14px)', color: '#fff',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '0.4rem 1.1rem', borderRadius: 999,
                }}
              >
                <FiBookOpen style={{ fontSize: '0.82rem' }} />
                {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} · {blogs.length} {blogs.length === 1 ? 'Entry' : 'Entries'}
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* ── Breadcrumb ── */}
        <div style={{
          background: '#F0EDE8',
          padding: '0.65rem clamp(1.25rem, 5vw, 3rem)',
          borderBottom: '1px solid var(--border, #E4DFD8)',
        }}>
          <nav style={{
            maxWidth: 1100, margin: '0 auto',
            fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
            color: 'var(--text-light, #9A9A9A)',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            flexWrap: 'wrap',
          }}>
            <Link to="/" style={{ color: 'var(--text-light, #9A9A9A)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #3B5F54)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light, #9A9A9A)'}
            >PHDMusafir</Link>
            <FiChevronRight style={{ fontSize: '0.58rem' }} />
            <Link to="/journal" style={{ color: 'var(--text-light, #9A9A9A)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #3B5F54)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light, #9A9A9A)'}
            >Journal</Link>
            <FiChevronRight style={{ fontSize: '0.58rem' }} />
            <span style={{ color: 'var(--text, #2D2D2D)' }}>{cityName}</span>
          </nav>
        </div>

        {/* ── Thin separator ── */}
        <div style={{ maxWidth: 100, margin: '2.5rem auto 0', borderTop: '2px solid var(--border, #E4DFD8)' }} />

        {/* ── Section label ── */}
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem 0' }}>
          <p style={{
            fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--text-light, #9A9A9A)',
            fontFamily: 'var(--font-sans)',
          }}>
            📍 {cityName} · Choose a Category
          </p>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', padding: '5rem 1rem', textAlign: 'center',
            }}>
              <FiAlertCircle style={{ fontSize: '2.8rem', color: '#3B5F54' }} />
              <p style={{ fontWeight: 600, color: '#3B5F54' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(59,95,84,0.08)', color: '#3B5F54',
                  fontWeight: 600, padding: '0.6rem 1.3rem',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <FiRefreshCw /> Try Again
              </button>
            </div>
          )}

          {/* Skeletons */}
          {loading && !error && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && categories.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', padding: '6rem 1rem', textAlign: 'center',
            }}>
              <FiBookOpen style={{ fontSize: '3.5rem', color: 'rgba(59,95,84,0.2)' }} />
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.4rem',
                fontWeight: 700, color: '#6B6B6B',
              }}>
                No entries for {cityName} yet
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light, #9A9A9A)' }}>
                Check back soon — our editors are curating new stories.
              </p>
              <Link to="/journal" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                marginTop: '0.5rem', color: '#3B5F54', fontWeight: 700,
                fontSize: '0.88rem', textDecoration: 'none',
              }}>
                <FiArrowLeft /> Back to all cities
              </Link>
            </div>
          )}

          {/* Category grid */}
          {!loading && !error && categories.length > 0 && (
            <AnimatePresence>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}>
                {categories.map((cat, i) => (
                  <CategoryCard
                    key={cat}
                    citySlug={citySlug}
                    category={cat}
                    blogs={categoryMap[cat]}
                    index={i}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes ken-burns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </>
  );
}
