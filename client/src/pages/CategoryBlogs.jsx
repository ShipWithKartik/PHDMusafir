import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiBookOpen, FiAlertCircle, FiRefreshCw, FiChevronRight,
  FiCalendar, FiUser, FiCompass, FiMapPin, FiArrowRight,
} from 'react-icons/fi';
import api from '../services/api';
import { getStaticCoverForCategory } from '../config/images';

/* ── Helpers ──────────────────────────────────────────── */
const fromSlug = (s = '') =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

const excerpt = (text = '', len = 200) =>
  text.length <= len ? text : text.slice(0, len).trimEnd() + '…';

const EXPLORE_STORIES_IMG = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop';

/* ── Explore card (editorial magazine style) ───────── */
function ExploreCard({ image, eyebrow, title, subtitle, to }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          borderRadius: 16,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: hovered
            ? '0 20px 50px rgba(0,0,0,0.22)'
            : '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.45s ease',
        }}
      >
        {/* Background image */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.7s ease-out',
            transform: hovered ? 'scale(1.10)' : 'scale(1)',
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)',
          transition: 'background 0.4s ease',
          ...(hovered ? { background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.05) 100%)' } : {}),
        }} />

        {/* Text content at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* Eyebrow / category tag */}
          {eyebrow && (
            <p style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#E8A87C',
              marginBottom: '0.65rem',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
            }}>
              {eyebrow}
            </p>
          )}

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            margin: '0 0 0.45rem',
            transition: 'transform 0.5s ease',
            transitionDelay: '0.04s',
            transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>
            {title}
          </h3>

          {/* Subtitle + arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflow: 'hidden',
          }}>
            {subtitle && (
              <p style={{
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                margin: 0,
                transition: 'transform 0.5s ease',
                transitionDelay: '0.08s',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
              }}>
                {subtitle}
              </p>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: '#E8A87C',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              transitionDelay: '0.12s',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateX(0)' : 'translateX(-12px)',
            }}>
              <FiArrowRight />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Skeleton row ─────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div style={{
      display: 'flex', gap: '2rem', padding: '2rem 0',
      borderBottom: '1px solid #F0EDE8',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[60, 100, 90, 50].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 20 : 13, width: `${w}%`, borderRadius: 6,
            background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
      <div style={{
        width: 280, height: 200, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  );
}

/* ── Editorial blog row — alternating layout ─────────── */
function BlogRow({ blog, index }) {
  const [hovered, setHovered] = useState(false);
  const coverUrl = blog.images?.[0]?.url;
  const isEven = index % 2 === 0; // even = text-left / image-right

  const textBlock = (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* Eyebrow */}
      <p style={{
        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#9A9A9A',
        marginBottom: '0.7rem',
      }}>
        {blog.city}
      </p>

      {/* Title */}
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(1.2rem, 2.5vw, 1.65rem)',
        fontWeight: 700, color: '#1A1A1A',
        lineHeight: 1.25, margin: '0 0 0.75rem',
        letterSpacing: '-0.01em',
        transition: 'color 0.2s',
        ...(hovered ? { color: '#3B5F54' } : {}),
      }}>
        {blog.title}
      </h2>

      {/* Excerpt */}
      <p style={{
        fontSize: '0.9rem', color: '#666',
        lineHeight: 1.72, margin: '0 0 1rem',
        fontFamily: 'var(--font-serif)',
      }}>
        {excerpt(blog.content)}
      </p>

      {/* Meta + Read More */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.7rem', color: '#9A9A9A',
        }}>
          <FiUser style={{ fontSize: '0.68rem' }} />
          {blog.author?.name || 'Unknown'}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.7rem', color: '#9A9A9A',
        }}>
          <FiCalendar style={{ fontSize: '0.68rem' }} />
          {fmtDate(blog.createdAt)}
        </span>
        <Link
          to={`/journal/${blog._id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.78rem', fontWeight: 700, color: '#3B5F54',
            textDecoration: 'none', letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'gap 0.2s',
            ...(hovered ? { gap: '0.55rem' } : {}),
          }}
        >
          Read More <FiChevronRight style={{ fontSize: '0.82rem' }} />
        </Link>
      </div>
    </div>
  );

  const imageBlock = coverUrl ? (
    <Link
      to={`/journal/${blog._id}`}
      style={{
        width: 'clamp(200px, 35%, 320px)', flexShrink: 0,
        borderRadius: 14, overflow: 'hidden',
        display: 'block',
      }}
    >
      <img
        src={coverUrl}
        alt={blog.title}
        style={{
          width: '100%', height: '100%', minHeight: 180,
          objectFit: 'cover', display: 'block',
          transition: 'transform 0.55s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />
    </Link>
  ) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: isEven ? 'row' : 'row-reverse',
        gap: 'clamp(1.5rem, 4vw, 2.5rem)',
        padding: '2.5rem 0',
        borderBottom: '1px solid #F0EDE8',
        cursor: 'pointer',
      }}
    >
      {textBlock}
      {imageBlock}
    </motion.article>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function CategoryBlogs() {
  const { city: citySlug, category: catSlug } = useParams();
  const navigate = useNavigate();
  const cityName = fromSlug(citySlug);
  const categoryName = fromSlug(catSlug);

  const [blogs,    setBlogs]    = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await api.get('/blogs');
        const all = res.data.data || [];
        setAllBlogs(all);
        const filtered = all.filter(
          (b) =>
            b.city?.toLowerCase() === cityName.toLowerCase() &&
            b.category?.toLowerCase() === categoryName.toLowerCase()
        );
        setBlogs(filtered);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load entries.');
      } finally {
        setLoading(false);
      }
    })();
  }, [cityName, categoryName]);

  /* Hero cover — static (not "latest post image") */
  const heroCover = getStaticCoverForCategory(`${cityName}:${categoryName}`);

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#FDFAF6', paddingTop: 80 }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative',
          height: '44vh', minHeight: 320, maxHeight: 480,
          marginTop: -80, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Background */}
          {!loading ? (
            <img
              src={heroCover} alt={categoryName}
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
              background: 'linear-gradient(135deg, #1A1A1A 0%, #2A483E 100%)',
            }} />
          )}

          {/* Scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.68) 100%)',
          }} />

          {/* Back button */}
          <button
            onClick={() => navigate(`/journal/city/${citySlug}`)}
            style={{
              position: 'absolute', top: 100, left: '1.5rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
              color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              padding: '0.5rem 1rem', borderRadius: 999,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'background 0.2s', zIndex: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <FiArrowLeft /> {cityName}
          </button>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 1.5rem', marginTop: 80 }}
          >
            <p style={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: '#D4CDBC',
              marginBottom: '0.65rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {cityName}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 6vw, 4rem)',
              fontWeight: 700, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.08,
              margin: 0, fontStyle: 'italic',
              textShadow: '0 4px 20px rgba(0,0,0,0.50)',
            }}>
              {categoryName}
            </h1>
            {!loading && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{
                  marginTop: '0.85rem',
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '0.82rem', fontWeight: 600,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                {blogs.length} {blogs.length === 1 ? 'result' : 'results'}
              </motion.p>
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
            maxWidth: 900, margin: '0 auto',
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
            <Link to={`/journal/city/${citySlug}`} style={{ color: 'var(--text-light, #9A9A9A)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #3B5F54)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light, #9A9A9A)'}
            >{cityName}</Link>
            <FiChevronRight style={{ fontSize: '0.58rem' }} />
            <span style={{ color: 'var(--text, #2D2D2D)' }}>{categoryName}</span>
          </nav>
        </div>

        {/* ── Result count ── */}
        {!loading && !error && blogs.length > 0 && (
          <div style={{
            maxWidth: 900, margin: '0 auto',
            padding: '1.5rem clamp(1.25rem, 5vw, 2rem) 0',
          }}>
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#9A9A9A',
            }}>
              Showing 1 – {blogs.length} of <strong style={{ color: '#555' }}>{blogs.length} results</strong>
            </p>
          </div>
        )}

        {/* ── Blog list ── */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(1.25rem, 5vw, 2rem) 6rem' }}>

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
            <div>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          )}

          {/* Empty */}
          {!loading && !error && blogs.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', padding: '6rem 1rem', textAlign: 'center',
            }}>
              <FiBookOpen style={{ fontSize: '3.5rem', color: 'rgba(59,95,84,0.2)' }} />
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.4rem',
                fontWeight: 700, color: '#6B6B6B',
              }}>
                No stories here yet
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9A9A9A' }}>
                No {categoryName} entries have been published for {cityName}.
              </p>
              <Link
                to={`/journal/city/${citySlug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  marginTop: '0.5rem', color: '#3B5F54', fontWeight: 700,
                  fontSize: '0.88rem', textDecoration: 'none',
                }}
              >
                <FiArrowLeft /> Back to {cityName}
              </Link>
            </div>
          )}

          {/* Blog entries */}
          {!loading && !error && blogs.length > 0 && (
            <AnimatePresence>
              {blogs.map((blog, i) => (
                <BlogRow key={blog._id} blog={blog} index={i} />
              ))}
            </AnimatePresence>
          )}

          {/* ── Continue Exploring ── */}
          {!loading && !error && blogs.length > 0 && (() => {
            // Card 2: Same city, different category
            const sameCityDiffCat = allBlogs.find(
              (b) =>
                b.city?.toLowerCase() === cityName.toLowerCase() &&
                b.category?.toLowerCase() !== categoryName.toLowerCase()
            );

            // Card 3: Different city
            const diffCity = allBlogs.find(
              (b) => b.city?.toLowerCase() !== cityName.toLowerCase()
            );

            // Only render if at least one dynamic card exists
            const hasContent = sameCityDiffCat || diffCity;

            return (
              <section style={{
                marginTop: '6rem',
                paddingTop: '3.5rem',
                borderTop: '1px solid #E8E0D8',
              }}>
                {/* Heading with decorative lines */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.25rem',
                  marginBottom: '2.75rem',
                }}>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: 'linear-gradient(to right, transparent, #D4CDBC)' }} />
                  <p style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#9A9A9A',
                    fontFamily: 'var(--font-sans)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    Continue Exploring
                  </p>
                  <div style={{ flex: 1, maxWidth: 80, height: 1, background: 'linear-gradient(to left, transparent, #D4CDBC)' }} />
                </div>

                <div className="explore-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.25rem',
                }}>
                  {/* Card 1: Explore Visual Stories (static) */}
                  <ExploreCard
                    image={EXPLORE_STORIES_IMG}
                    eyebrow="Visual Stories"
                    title="Explore Visual Stories"
                    subtitle="Discover photo stories"
                    to="/discover"
                  />

                  {/* Card 2: Same city, different category */}
                  {sameCityDiffCat && (
                    <ExploreCard
                      image={sameCityDiffCat.images?.[0]?.url || EXPLORE_STORIES_IMG}
                      eyebrow={sameCityDiffCat.category}
                      title={`More in ${cityName}`}
                      subtitle={`Explore ${sameCityDiffCat.category}`}
                      to={`/journal/city/${citySlug}/${sameCityDiffCat.category?.toLowerCase()}`}
                    />
                  )}

                  {/* Card 3: Different city */}
                  {diffCity && (
                    <ExploreCard
                      image={diffCity.images?.[0]?.url || EXPLORE_STORIES_IMG}
                      eyebrow={diffCity.city}
                      title={`Discover ${diffCity.city}`}
                      subtitle={diffCity.title}
                      to={`/journal/${diffCity._id}`}
                    />
                  )}
                </div>
              </section>
            );
          })()}
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
        @media (max-width: 640px) {
          article { flex-direction: column !important; }
          article > a { width: 100% !important; }
          article img { min-height: 200px !important; }
        }
        @media (max-width: 860px) {
          .explore-grid { grid-template-columns: 1fr !important; max-width: 400px; margin-left: auto; margin-right: auto; }
        }
        @media (min-width: 861px) and (max-width: 1024px) {
          .explore-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
