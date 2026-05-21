import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiAlertCircle, FiRefreshCw, FiChevronRight, FiMapPin,
} from 'react-icons/fi';
import api from '../services/api';
import { getStaticCoverForCity } from '../config/images';

/* ── Helpers ──────────────────────────────────────────── */
const fmtSlug = (s = '') => s.toLowerCase().replace(/\s+/g, '-');

/* ── Skeleton card ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        height: 240,
        background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[65, 85, 50].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 20 : 12, width: `${w}%`, borderRadius: 6,
            background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── City card ────────────────────────────────────────── */
function CityCard({ city, blogs, index }) {
  const [hovered, setHovered] = useState(false);
  // Static cover (not "latest post image")
  const coverUrl = getStaticCoverForCity(city);

  /* Count unique categories available */
  const uniqueCats = [...new Set(blogs.map((b) => b.category).filter(Boolean))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      style={{ height: '100%' }}
    >
      <Link
        to={`/journal/city/${fmtSlug(city)}`}
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
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>

          {/* Cover image — aspect-[4/3] keeps uniform height across all cards */}
          <div style={{
            aspectRatio: '4 / 3', overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #3B5F54, #2A483E)',
            flexShrink: 0,
          }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={city}
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
              }}>
                <FiBookOpen style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}

            {/* Gradient scrim */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />

            {/* City name over image */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '1.25rem 1.4rem 1.1rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                marginBottom: '0.3rem',
              }}>
                <FiMapPin style={{ color: '#D4CDBC', fontSize: '0.8rem', flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: '#D4CDBC',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  India
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
                fontWeight: 700, color: '#fff',
                margin: 0, lineHeight: 1.1,
                letterSpacing: '-0.01em',
                textShadow: '0 2px 10px rgba(0,0,0,0.55)',
                transition: 'letter-spacing 0.3s',
                ...(hovered ? { letterSpacing: '0.01em' } : {}),
              }}>
                {city}
              </h2>
            </div>

            {/* Entry count badge */}
            <div style={{
              position: 'absolute', top: '0.85rem', right: '0.85rem',
              background: 'rgba(0,0,0,0.42)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 999,
              padding: '0.22em 0.7em',
              fontSize: '0.62rem', fontWeight: 700,
              color: '#fff', letterSpacing: '0.08em',
            }}>
              {blogs.length} {blogs.length === 1 ? 'story' : 'stories'}
            </div>
          </div>

          {/* Card footer — always anchored to bottom via flex-col + mt-auto */}
          <div style={{
            padding: '1rem 1.4rem 1.15rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '0.75rem',
            marginTop: 'auto',
          }}>
            {/* Category mini-pills */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minWidth: 0,
            }}>
              {uniqueCats.slice(0, 3).map((cat) => (
                <span key={cat} style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: '#F0EDE8', color: '#7A6856',
                  padding: '0.2em 0.55em', borderRadius: 999,
                  border: '1px solid #E4DFD8', whiteSpace: 'nowrap',
                }}>
                  {cat}
                </span>
              ))}
              {uniqueCats.length > 3 && (
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  background: '#F0EDE8', color: '#7A6856',
                  padding: '0.2em 0.55em', borderRadius: 999,
                  border: '1px solid #E4DFD8',
                }}>
                  +{uniqueCats.length - 3}
                </span>
              )}
            </div>

            {/* Arrow */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.72rem', fontWeight: 700, color: '#3B5F54',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              flexShrink: 0,
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

/* ── Hero header ──────────────────────────────────────── */
function JournalHero({ cityCount, storyCount }) {
  return (
    <div style={{
      position: 'relative',
      height: '62vh',
      minHeight: 460, maxHeight: 720,
      marginTop: -80, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Ken-Burns background */}
      <div style={{ position: 'absolute', inset: '-5%', zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1512719994953-eabf50895df7?q=80&w=2670&auto=format&fit=crop"
          alt="Journal hero"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            animation: 'ken-burns 28s ease-out forwards',
          }}
        />
      </div>

      {/* Scrim */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.60) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center',
        padding: '0 1.5rem',
        marginTop: 80,
        maxWidth: 760,
      }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#D4CDBC',
            marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          PHDMusafir · Travel Journal
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            fontWeight: 700, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.08,
            marginBottom: '1.1rem',
            textShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          Places to<br />
          <em style={{ fontStyle: 'italic', color: '#D4CDBC' }}>Travel to</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.82)',
            fontSize: 'clamp(1rem, 2.4vw, 1.25rem)',
            lineHeight: 1.65, marginBottom: '1.8rem',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          Pick a destination and dive into curated stories, spot guides, and local experiences.
        </motion.p>

        {cityCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(14px)', color: '#fff',
              fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.42rem 1.2rem', borderRadius: 999,
            }}>
              <FiMapPin style={{ fontSize: '0.85rem' }} />
              {cityCount} {cityCount === 1 ? 'City' : 'Cities'}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(14px)', color: '#fff',
              fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.42rem 1.2rem', borderRadius: 999,
            }}>
              <FiBookOpen style={{ fontSize: '0.85rem' }} />
              {storyCount} {storyCount === 1 ? 'Story' : 'Stories'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────── */
export default function Journal() {
  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await api.get('/blogs');
        setBlogs(res.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load journal entries.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Group by city — preserve insertion order (first city encountered = first card) */
  const cityMap = {};
  blogs.forEach((b) => {
    const city = b.city?.trim();
    if (!city) return;
    if (!cityMap[city]) cityMap[city] = [];
    cityMap[city].push(b);
  });
  const cities = Object.keys(cityMap);
  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--bg, #F8F5F1)', paddingTop: 80 }}>

        {/* Hero */}
        <JournalHero cityCount={cities.length} storyCount={blogs.length} />

        {/* ── Breadcrumb ── */}
        <div style={{
          background: '#F0EDE8',
          padding: '0.65rem clamp(1.25rem, 5vw, 3rem)',
          borderBottom: '1px solid var(--border, #E4DFD8)',
        }}>
          <nav style={{
            maxWidth: 1200, margin: '0 auto',
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
            <span style={{ color: 'var(--text, #2D2D2D)' }}>Places to Travel to</span>
          </nav>
        </div>

        {/* Thin rule */}
        <div style={{ maxWidth: 120, margin: '3rem auto 0', borderTop: '2px solid var(--border, #E4DFD8)' }} />

        {/* ── Constrained content wrapper — equal left + right margins ── */}
        <div style={{
          maxWidth: 1152,
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
        }}>

        {/* ── 2-column section header ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          alignItems: 'center',
          padding: '2.5rem 0 clamp(3rem, 6vw, 5rem)',
        }}>

          {/* Left — map image */}
          <div style={{
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            aspectRatio: '4 / 3',
            flexShrink: 0,
          }}>
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
              alt="Physical map with magnifying glass"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Right — text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C07A4F',
              marginBottom: '0.85rem',
            }}>
              PHDMusafir · Travel Journal
            </p>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.6rem, 6vw, 4rem)',
              fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '-0.03em',
              lineHeight: 1.06,
              margin: '0 0 1.4rem',
            }}>
              Search<br />
              <em style={{ fontStyle: 'italic', color: '#3B5F54' }}>your City.</em>
            </h2>

            <div style={{
              width: 48,
              height: 3,
              background: 'linear-gradient(90deg, #C07A4F, #D4A45A)',
              borderRadius: 2,
              marginBottom: '1.4rem',
            }} />

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
              color: '#6B6B6B',
              lineHeight: 1.75,
              maxWidth: 400,
              margin: 0,
            }}>
              Pick any destination below and dive into curated stories,
              category guides, and local experiences — all in one place.
            </p>

            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: '#9A9A9A',
              marginTop: '1.1rem',
            }}>
              Search it and Click it to explore!
            </p>
          </div>
        </div>

        {/* Content */}
        <section className="pb-20">

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
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 place-items-stretch">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && cities.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', padding: '6rem 1rem', textAlign: 'center',
            }}>
              <FiBookOpen style={{ fontSize: '3.5rem', color: 'rgba(59,95,84,0.25)' }} />
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.4rem',
                fontWeight: 700, color: '#6B6B6B',
              }}>
                No journal entries yet
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-light, #9A9A9A)' }}>
                Check back soon — our editors are working on it.
              </p>
            </div>
          )}

          {/* City grid */}
          {!loading && !error && cities.length > 0 && (
            <AnimatePresence>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 place-items-stretch">
                {cities.map((city, i) => (
                  <CityCard
                    key={city}
                    city={city}
                    blogs={cityMap[city]}
                    index={i}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>
        </div>  {/* end constrained wrapper */}
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
