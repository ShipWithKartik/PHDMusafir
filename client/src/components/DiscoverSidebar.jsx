import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { getRecentContent, getCityStats } from '../services/storyService';

/* ── Sidebar heading ───────────────────────────────────────── */
function SidebarHeading({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: '#9A9A9A',
      marginBottom: '1.25rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid #C07A4F',
      display: 'inline-block',
    }}>
      {children}
    </p>
  );
}

/* ── Date formatter ────────────────────────────────────────── */
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Skeleton shimmer for sidebar ──────────────────────────── */
function SidebarSkeleton() {
  const shimBg = {
    background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 4,
  };
  return (
    <div>
      <div style={{ ...shimBg, width: '40%', height: 10, marginBottom: '1.25rem' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 0', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ ...shimBg, width: 56, height: 56, borderRadius: 4, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...shimBg, width: '90%', height: 12, marginBottom: '0.5rem' }} />
            <div style={{ ...shimBg, width: '60%', height: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Sidebar ──────────────────────────────────────────── */
export default function DiscoverSidebar({ onCityFilter }) {
  const [recentPosts, setRecentPosts] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [recentRes, statsRes] = await Promise.all([
          getRecentContent(),
          getCityStats(),
        ]);
        setRecentPosts(recentRes.data || []);
        setCityStats(statsRes.data || []);
      } catch (err) {
        console.error('Sidebar fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <SidebarSkeleton />;

  return (
    <aside style={{ position: 'sticky', top: 140, alignSelf: 'start' }}>

      {/* ══ RECENT POST ══ */}
      <div style={{ marginBottom: '3rem' }}>
        <SidebarHeading>Recent Post</SidebarHeading>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentPosts.map((item) => {
            const isStory = item.type === 'story';
            const href = isStory ? '/discover' : `/journal/city/${item.city?.toLowerCase()}`;

            return (
              <Link
                key={item._id}
                to={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid #F0EDE8',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                  borderRadius: 4,
                  marginLeft: '-0.35rem',
                  marginRight: '-0.35rem',
                  paddingLeft: '0.35rem',
                  paddingRight: '0.35rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(192,122,79,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#E8E4DF',
                }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1.3,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.62rem',
                    color: '#9A9A9A',
                    margin: '0.2rem 0 0',
                    letterSpacing: '0.03em',
                  }}>
                    {fmtDate(item.createdAt)}
                    <span style={{ margin: '0 0.3rem', color: '#D4CDBC' }}>/</span>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C07A4F', fontWeight: 600 }}>
                      {isStory ? 'Story' : 'Journal'}
                    </span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ══ CITIES STATISTICS ══ */}
      <div>
        <SidebarHeading>Cities Statistics</SidebarHeading>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cityStats.map((row) => (
            <div
              key={row.city}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.35rem',
                borderBottom: '1px solid #F0EDE8',
                borderRadius: 4,
                transition: 'background 0.15s ease',
                marginLeft: '-0.35rem',
                marginRight: '-0.35rem',
                cursor: 'default',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* City name — clicking filters the Discover feed */}
              <button
                onClick={() => onCityFilter?.(row.city)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2D2D2D',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C07A4F'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2D2D2D'}
              >
                {row.city}
              </button>

              {/* Stat counters */}
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#9A9A9A',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
              }}>
                {/* Posts (journal) count */}
                <Link
                  to={`/journal/city/${row.city?.toLowerCase()}`}
                  style={{
                    color: '#C07A4F',
                    textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {row.blogCount} {row.blogCount === 1 ? 'Post' : 'Posts'}
                </Link>

                <span style={{ color: '#D4CDBC' }}>|</span>

                {/* Stories count — triggers city filter on Discover */}
                <button
                  onClick={() => onCityFilter?.(row.city)}
                  style={{
                    color: '#C07A4F',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    padding: 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {row.storyCount} {row.storyCount === 1 ? 'Story' : 'Stories'}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
