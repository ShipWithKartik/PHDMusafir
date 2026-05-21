import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

/* ── Card data ──────────────────────────────────────────────── */
const CARDS = [
  {
    id: 'places',
    image:
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1200&auto=format&fit=crop',
    alt: 'Hawa Mahal, Jaipur — Indian Architecture',
    label: 'PLACES TO TRAVEL TO',
    to: '/journal',
    isExternal: false,
  },
  {
    id: 'stories',
    image:
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Paragliding adventure over mountains',
    label: 'MY STORIES',
    to: '/discover',
    isExternal: false,
  },
  {
    id: 'follow',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    alt: 'Serene Buddha statue in tranquil setting',
    label: 'FOLLOW ME',
    to: 'https://instagram.com',
    isExternal: true,
  },
];

/* ── Single portrait card ───────────────────────────────────── */
function PortraitCard({ card, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const btn = card.isExternal ? (
    <a
      href={card.to}
      target="_blank"
      rel="noreferrer"
      style={btnStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
    >
      {card.label}
    </a>
  ) : (
    <Link
      to={card.to}
      style={btnStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
    >
      {card.label}
    </Link>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ position: 'relative' }}
    >
      {/* ── Portrait image container ── */}
      <div style={cardWrap}>
        <img
          src={card.image}
          alt={card.alt}
          style={imgStyle}
          /* CSS hover zoom via inline onMouse — framer handles the card lift */
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Subtle bottom-gradient scrim so the button always reads clearly */}
        <div style={scrimStyle} />
      </div>

      {/* ── Floating label button ── */}
      <div style={btnWrap}>
        {btn}
      </div>
    </motion.div>
  );
}

/* ── Styles (JS objects for zero-dependency approach) ───────── */
const cardWrap = {
  position: 'relative',
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: 4,
  overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
  background: '#1a1a1a',
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
  transform: 'scale(1)',
};

const scrimStyle = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.28) 100%)',
  pointerEvents: 'none',
};

const btnWrap = {
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translate(-50%, 50%)',
  zIndex: 10,
  whiteSpace: 'nowrap',
};

const btnStyle = {
  display: 'inline-block',
  background: '#fff',
  color: '#1A1A1A',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '0.7rem 1.8rem',
  borderRadius: 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
  border: '1px solid rgba(0,0,0,0.07)',
  cursor: 'pointer',
  transition: 'background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease',
};

const btnHover = {
  ...btnStyle,
  background: '#1A1A1A',
  color: '#fff',
  boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
};

/* ── Section ────────────────────────────────────────────────── */
export default function LandingFeatured() {
  return (
    <section
      style={{
        background: 'var(--bg, #F8F5F1)',
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 4rem)',
        width: '100%',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* ── Heading block ── */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C07A4F',
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Curated by the Editor
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '0 auto 1rem',
            }}
          >
            Featured Section
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: '#6B6B6B',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Wander through places, stories, and moments handpicked for curious travellers.
          </p>
        </div>

        {/* ── 3-column portrait grid ── */}
        {/*
          Extra bottom padding accounts for the floating buttons that
          overlap the bottom edge of each card by 50% of their height.
        */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            paddingBottom: '3rem',  /* room for floating buttons */
          }}
        >
          {CARDS.map((card, i) => (
            <PortraitCard key={card.id} card={card} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}
