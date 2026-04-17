import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { getJourneyPins } from '../services/storyService';

/* ── India GeoJSON (state boundaries) ────────────────────────── */
const INDIA_GEO =
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

/* ── Colour tokens ──────────────────────────────────────────────── */
const STATE_DEFAULT  = '#2E4A3A';
const STATE_HOVER    = '#3B5F54';
const STATE_STROKE   = '#3F5E4E';
const BG_GRADIENT    = 'linear-gradient(160deg, #1E2D3A 0%, #16232D 100%)';

/* Pin colours by source type */
const PIN_COLORS = {
  story: '#C07A4F',                   // amber            — stories only
  blog:  '#3B9B8F',                   // teal             — journal posts only
  both:  'url(#pin-gradient-both)',   // gold-teal gradient — both
};
const RING_COLORS = {
  story: '#C07A4F',
  blog:  '#3B9B8F',
  both:  '#D4A45A',
};

/* ── Slug helper ─────────────────────────────────────────────────── */
const toSlug = (s = '') => s.toLowerCase().replace(/\s+/g, '-');

/* ============================================================
   WorldMap — Interactive India Journey Atlas
   ============================================================ */
export default function WorldMap() {
  const navigate = useNavigate();
  const mapWrapRef = useRef(null);

  const [pins, setPins]           = useState([]);
  const [tooltip, setTooltip]     = useState(null); // { pin, x, y }
  const [popover, setPopover]     = useState(null); // { pin, x, y } — click menu
  const [loading, setLoading]     = useState(true);

  /* ── Fetch unified pins ────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getJourneyPins();
        setPins(res.data || []);
      } catch {
        /* Silently degrade — map still renders without pins */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Close popover on outside click ────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (popover && mapWrapRef.current && !mapWrapRef.current.contains(e.target)) {
        setPopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  /* ── Navigation helpers ────────────────────────────────────── */
  const goToStories = (pin) => {
    navigate('/discover', { state: { cityFilter: pin.location } });
  };

  const goToBlogs = (pin) => {
    if (pin.blogIds.length === 1) {
      navigate(`/journal/${pin.blogIds[0]}`);
    } else {
      navigate(`/journal/city/${toSlug(pin.location)}`);
    }
  };

  const handlePinClick = (pin, e) => {
    // Compute position for popover
    const svg = e.currentTarget.closest('svg');
    const wrap = mapWrapRef.current;
    if (!svg || !wrap) return;

    const svgRect  = svg.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const ptRect   = e.currentTarget.getBoundingClientRect();
    const x = ptRect.left - wrapRect.left + ptRect.width / 2;
    const y = ptRect.top  - wrapRect.top;

    if (pin.type === 'story') {
      goToStories(pin);
    } else if (pin.type === 'blog') {
      goToBlogs(pin);
    } else {
      // Both — show popover
      setPopover({ pin, x, y });
      setTooltip(null);
    }
  };

  /* ── Tooltip helpers ───────────────────────────────────────── */
  const showTooltip = (pin, e) => {
    if (popover) return; // don't show tooltip while popover active
    const svg  = e.currentTarget.closest('svg');
    const wrap = mapWrapRef.current;
    if (!svg || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const ptRect   = e.currentTarget.getBoundingClientRect();
    setTooltip({
      pin,
      x: ptRect.left - wrapRect.left + ptRect.width / 2,
      y: ptRect.top  - wrapRect.top,
    });
  };
  const hideTooltip = () => setTooltip(null);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div ref={mapWrapRef} style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden' }}>

      {/* Ocean background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: BG_GRADIENT,
        borderRadius: 16, zIndex: 0,
      }} />

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes atlas-pulse {
          0%   { r: 6;  opacity: 0.70; }
          70%  { r: 16; opacity: 0;    }
          100% { r: 16; opacity: 0;    }
        }
        .atlas-ring {
          animation: atlas-pulse 2.4s ease-out infinite;
          fill: none;
          stroke-width: 1.5;
          pointer-events: none;
        }
        .atlas-dot {
          stroke: rgba(255,255,255,0.85);
          stroke-width: 1;
          cursor: pointer;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));
          transition: r 0.18s ease, filter 0.18s ease;
        }
        .atlas-dot:hover {
          r: 6.5 !important;
          filter: drop-shadow(0 3px 10px rgba(0,0,0,0.55));
        }
      `}</style>

      {/* SVG gradient defs (for "both" pins) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="pin-gradient-both" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#D4A45A" />
            <stop offset="100%" stopColor="#3B9B8F" />
          </radialGradient>
        </defs>
      </svg>

      {/* ── Map ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ComposableMap
          projectionConfig={{
            scale: 1050,
            center: [82, 22],
          }}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 520 }}
          projection="geoMercator"
        >
          {/* India states */}
          <Geographies geography={INDIA_GEO}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill:   STATE_DEFAULT,
                      stroke: STATE_STROKE,
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill:   STATE_HOVER,
                      stroke: STATE_STROKE,
                      strokeWidth: 0.6,
                      outline: 'none',
                    },
                    pressed: {
                      fill:   STATE_DEFAULT,
                      stroke: STATE_STROKE,
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Journey pins */}
          {pins.map((pin) => {
            const fillColor = PIN_COLORS[pin.type] || PIN_COLORS.story;
            const ringColor = RING_COLORS[pin.type] || RING_COLORS.story;
            return (
              <Marker
                key={pin.location}
                coordinates={[pin.longitude, pin.latitude]}
              >
                {/* Pulse ring */}
                <circle
                  className="atlas-ring"
                  cx={0} cy={0} r={6}
                  style={{
                    stroke: ringColor,
                    animationDelay: `${(pin.location.length % 10) * 0.22}s`,
                  }}
                />
                {/* Pin dot */}
                <circle
                  className="atlas-dot"
                  cx={0} cy={0} r={4.5}
                  fill={fillColor}
                  onMouseEnter={(e) => showTooltip(pin, e)}
                  onMouseLeave={hideTooltip}
                  onClick={(e) => handlePinClick(pin, e)}
                />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* ── Floating tooltip (hover) ── */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top:  tooltip.y - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 20,
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: '0.65rem 0.9rem',
            boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
            minWidth: 150,
            fontFamily: 'var(--font-sans)',
          }}>
            {/* Location name */}
            <p style={{
              margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A',
              marginBottom: '0.25rem',
            }}>
              {tooltip.pin.location}
            </p>

            {/* Counts */}
            <div style={{
              display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: '#6B6B6B',
              marginBottom: '0.45rem',
            }}>
              {tooltip.pin.storyCount > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#C07A4F', display: 'inline-block', flexShrink: 0,
                  }} />
                  {tooltip.pin.storyCount} {tooltip.pin.storyCount === 1 ? 'story' : 'stories'}
                </span>
              )}
              {tooltip.pin.blogCount > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#3B9B8F', display: 'inline-block', flexShrink: 0,
                  }} />
                  {tooltip.pin.blogCount} {tooltip.pin.blogCount === 1 ? 'post' : 'posts'}
                </span>
              )}
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {tooltip.pin.categories.slice(0, 4).map((cat) => (
                <span key={cat} style={{
                  fontSize: '0.62rem', fontWeight: 600,
                  color: '#C07A4F', background: '#FDF3EC',
                  borderRadius: 4, padding: '0.12rem 0.42rem',
                }}>
                  {cat}
                </span>
              ))}
            </div>

            {/* Arrow */}
            <div style={{
              position: 'absolute',
              bottom: -6, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #fff',
            }} />
          </div>
        </div>
      )}

      {/* ── Popover (click — shown for "both" type pins) ── */}
      {popover && (
        <div
          style={{
            position: 'absolute',
            left: popover.x,
            top:  popover.y - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 25,
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '0.85rem 1rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            minWidth: 185,
            fontFamily: 'var(--font-sans)',
          }}>
            {/* Header */}
            <p style={{
              margin: '0 0 0.55rem', fontSize: '0.88rem', fontWeight: 700,
              color: '#1A1A1A', textAlign: 'center',
            }}>
              {popover.pin.location}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                onClick={() => { setPopover(null); goToStories(popover.pin); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 0.85rem', borderRadius: 8, border: 'none',
                  background: '#FDF3EC', color: '#C07A4F',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9E8D9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FDF3EC'}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#C07A4F',
                  flexShrink: 0,
                }} />
                View {popover.pin.storyCount} {popover.pin.storyCount === 1 ? 'Story' : 'Stories'}
              </button>

              <button
                onClick={() => { setPopover(null); goToBlogs(popover.pin); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 0.85rem', borderRadius: 8, border: 'none',
                  background: '#E8F5F3', color: '#2A7A6E',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#D0EDE9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#E8F5F3'}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#3B9B8F',
                  flexShrink: 0,
                }} />
                View {popover.pin.blogCount} Journal {popover.pin.blogCount === 1 ? 'Post' : 'Posts'}
              </button>
            </div>

            {/* Arrow */}
            <div style={{
              position: 'absolute',
              bottom: -6, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #fff',
            }} />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5,
        }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-sans)',
          }}>
            Loading destinations…
          </span>
        </div>
      )}

      {/* fadeIn keyframe */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, calc(-100% + 6px)); }
          to   { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
}
