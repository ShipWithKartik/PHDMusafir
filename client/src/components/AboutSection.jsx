import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { IMAGES } from '../config/images';

/* ── Feature items ──────────────────────────────────────────── */
const FEATURES = [
  'Know Nearby Places',
  'Explore Natural Beauty',
  'Go for a Picnic',
  'Plan a Weekend',
  'Throw a Party',
  'Find Date Spots',
  'Eat the Very Best',
];

/* ── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

/* ── Feature pill ───────────────────────────────────────────── */
function FeaturePill({ label }) {
  return (
    <motion.li variants={fadeUp} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.8rem',
      fontWeight: 600,
      color: '#3B5F54',
      background: 'rgba(59,95,84,0.07)',
      border: '1px solid rgba(59,95,84,0.14)',
      borderRadius: 999,
      padding: '0.38rem 0.9rem',
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    }}>
      <FiCheck style={{ flexShrink: 0, fontSize: '0.78rem', strokeWidth: 2.5 }} />
      {label}
    </motion.li>
  );
}

/* ── Image stack (collage preserved) ───────────────────────── */
function ImageStack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      style={{
        position: 'relative',
        /* height that accommodates the stacked layout */
        height: 'clamp(420px, 55vw, 600px)',
        width: '100%',
      }}
    >
      {/* ── Decorative offset square (terracotta) ── */}
      <div style={{
        position: 'absolute',
        bottom: -18,
        right: -18,
        width: '72%',
        height: '72%',
        background: 'linear-gradient(135deg, #C07A4F22, #D4A45A18)',
        border: '1.5px solid rgba(192,122,79,0.22)',
        borderRadius: 12,
        zIndex: 0,
      }} />

      {/* ── Primary hero image (centre/large) ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '8%',
        width: '72%',
        height: '80%',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.10)',
        zIndex: 2,
      }}>
        <img
          src={IMAGES.aboutCollage[0]}
          alt="Travel adventure"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Secondary image (bottom-right overlap) ── */}
      <div style={{
        position: 'absolute',
        bottom: '4%',
        right: '0%',
        width: '42%',
        height: '46%',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.20)',
        border: '3px solid #fff',
        zIndex: 3,
      }}>
        <img
          src={IMAGES.aboutCollage[1]}
          alt="Journey moments"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Tertiary accent image (top-right chip) ── */}
      <div style={{
        position: 'absolute',
        top: '0%',
        right: '4%',
        width: '33%',
        height: '30%',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
        border: '3px solid #fff',
        zIndex: 4,
      }}>
        <img
          src={IMAGES.aboutCollage[2]}
          alt="Scenic exploration"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Floating stat badge ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '0%',
          zIndex: 5,
          background: '#fff',
          borderRadius: 12,
          padding: '0.75rem 1.1rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.14)',
          border: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          minWidth: 150,
        }}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C07A4F, #D4A45A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1.1rem',
        }}>
          🗺️
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1,
          }}>40+</p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 600,
            color: '#9A9A9A',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}>Destinations</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main section ───────────────────────────────────────────── */
export default function AboutSection() {
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, amount: 0.2 });

  return (
    <section style={{
      background: '#FDFAF7',
      padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,6vw,5rem)',
      width: '100%',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px), 1fr))',
        gap: 'clamp(3rem,6vw,6rem)',
        alignItems: 'center',
      }}>

        {/* ══ LEFT — Text content ══ */}
        <motion.div
          ref={textRef}
          variants={stagger}
          initial="hidden"
          animate={textInView ? 'show' : 'hidden'}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {/* Eyebrow */}
          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#C07A4F',
            marginBottom: '0.9rem',
          }}>
            About the Platform
          </motion.p>

          {/* Heading */}
          <motion.h2 variants={fadeUp} style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            marginBottom: '1.5rem',
          }}>
            Why<br />
            <em style={{ fontStyle: 'italic', color: '#3B5F54' }}>PHDMusafir?</em>
          </motion.h2>

          {/* Decorative rule */}
          <motion.div variants={fadeUp} style={{
            width: 52,
            height: 3,
            background: 'linear-gradient(90deg, #C07A4F, #D4A45A)',
            borderRadius: 2,
            marginBottom: '1.75rem',
          }} />

          {/* Body copy */}
          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.88rem, 1.6vw, 1rem)',
            color: '#4A4A4A',
            lineHeight: 1.85,
            marginBottom: '2rem',
            maxWidth: 520,
          }}>
            The simplest answer? <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>To make the time we have count.</strong> Despite
            busy schedules and preoccupied minds, we wanted to create a space to share
            authentic places, stories, and experiences. We are a squad driven by the urge to
            venture out and resolve the traveller's ultimate quests. PHDMusafir is here to
            show you that you can do more, explore more, and truly enjoy the world around you.{' '}
            <em style={{ color: '#3B5F54', fontStyle: 'italic', fontWeight: 600 }}>
              Seize the Day, My Friend!
            </em>
          </motion.p>

          {/* Feature list heading */}
          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#9A9A9A',
            marginBottom: '0.85rem',
          }}>
            Discover Your Next:
          </motion.p>

          {/* Feature pills grid */}
          <motion.ul
            variants={stagger}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.6rem',
            }}
          >
            {FEATURES.map((f) => (
              <FeaturePill key={f} label={f} />
            ))}
          </motion.ul>
        </motion.div>

        {/* ══ RIGHT — Image stack ══ */}
        <ImageStack />
      </div>
    </section>
  );
}
