import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FiArrowRight, FiCompass, FiUploadCloud } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import WorldMap from './components/WorldMap';
import UploadStory from './pages/UploadStory';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Journal from './pages/Journal';
import CityJournal from './pages/CityJournal';
import CategoryBlogs from './pages/CategoryBlogs';
import BlogDetail from './pages/BlogDetail';
import WriteBlog from './pages/WriteBlog';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Counting number hook
───────────────────────────────────────────────────────── */
function useCounter(target, duration = 1600, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const frame = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(frame);
        else setValue(target);
      };
      requestAnimationFrame(frame);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

/* ─────────────────────────────────────────────────────────
   Magnetic button — cursor-following spring
───────────────────────────────────────────────────────── */
function MagneticBtn({ children, strength = 0.22 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 280, damping: 22, mass: 0.6 });

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [x, y, strength]);

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pill scroll indicator
───────────────────────────────────────────────────────── */
function ScrollPill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
      }}
    >
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
      }}>
        Scroll
      </span>
      {/* Pill with moving dot */}
      <div style={{
        width: 22,
        height: 38,
        borderRadius: 11,
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5px 0',
      }}>
        <motion.div
          style={{
            width: 4,
            height: 8,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.75)',
          }}
          animate={{ y: [0, 14, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Stat item with counting number
───────────────────────────────────────────────────────── */
function StatItem({ value, suffix = '', label, delay }) {
  const count = useCounter(value, 1500, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.9, duration: 0.6, ease: 'easeOut' }}
      style={{ textAlign: 'center' }}
    >
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 700,
        color: '#D4CDBC',
        lineHeight: 1,
        marginBottom: '0.25rem',
      }}>
        {count}{suffix}
      </p>
      <p style={{
        fontSize: '0.62rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
        fontWeight: 600,
      }}>
        {label}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   World Map Section
───────────────────────────────────────────────────────── */
function WorldMapSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      style={{
        background: 'var(--bg, #F8F5F1)',
        padding: 'clamp(4rem,8vw,6rem) clamp(1.25rem,5vw,3rem)',
        width: '100%',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#C07A4F', marginBottom: '0.75rem',
            fontFamily: 'var(--font-sans)',
          }}>
            Stories from across India
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '0.85rem',
          }}>
            The Journey Atlas
          </h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: '#6B6B6B',
            fontSize: 'clamp(0.95rem,2vw,1.1rem)',
            maxWidth: 480, margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Click any pin to dive into travel stories and journal posts from that destination.
          </p>
        </div>

        {/* Map */}
        <WorldMap />

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
          }}>
            <span style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
              background: '#C07A4F', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, color: '#9A9A9A',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}>
              Stories
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
          }}>
            <span style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
              background: '#3B9B8F', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, color: '#9A9A9A',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}>
              Journal Posts
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
          }}>
            <span style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4A45A, #3B9B8F)', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, color: '#9A9A9A',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}>
              Both
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────
   Home page
───────────────────────────────────────────────────────── */
function HomePage() {
  /* Stagger orchestration */
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      {/* ── Full-screen hero ── */}
      <div style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>

        {/* ── Ken Burns background ── */}
        <motion.div
          animate={{ scale: 1.10 }}
          transition={{ duration: 22, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            inset: '-8%',
            backgroundImage: "url('https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform',
          }}
        />

        {/* ── Film-grain texture (SVG noise) ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
          pointerEvents: 'none',
          zIndex: 1,
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }} />

        {/* ── Dark overlay ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.46)',
          zIndex: 2,
        }} />

        {/* ── Vignette ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.60) 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }} />

        {/* ── Gradient bottom fade ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 35%, rgba(0,0,0,0.55) 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }} />

        {/* ── Hero content ── */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(80px + 3.5rem) 1.5rem 8rem',
          textAlign: 'center',
        }}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem' }}
          >
            {/* ① Eyebrow label */}
            <motion.div variants={item}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                color: '#D4CDBC',
                padding: '0.45rem 1.1rem',
                borderRadius: 999,
                border: '1px solid rgba(212,205,188,0.35)',
                background: 'rgba(212,205,188,0.08)',
                backdropFilter: 'blur(8px)',
              }}>
                A Journal of Real Journeys
              </span>
            </motion.div>

            {/* ② Main heading */}
            <motion.h1
              variants={item}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(3.8rem, 11vw, 8.5rem)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              PHD<span style={{ color: '#D4CDBC' }}>Musafir</span>
            </motion.h1>

            {/* ③ Tagline */}
            <motion.p
              variants={item}
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: 'rgba(255,255,255,0.68)',
                maxWidth: 520,
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Real stories. Real places. Real adventures —{' '}
              <em style={{ color: 'rgba(212,205,188,0.80)' }}>told by those who lived them.</em>
            </motion.p>

            {/* ④ CTA buttons */}
            <motion.div
              variants={item}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {/* Primary */}
              <MagneticBtn>
                <Link
                  to="/discover"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    letterSpacing: '0.03em',
                    padding: '0.9rem 2rem',
                    borderRadius: '14px',
                    boxShadow: '0 10px 40px rgba(59,95,84,0.50)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 14px 48px rgba(59,95,84,0.70)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(59,95,84,0.50)'}
                >
                  <FiCompass style={{ fontSize: '1.05rem', flexShrink: 0 }} />
                  Discover Stories
                  <FiArrowRight style={{ fontSize: '0.9rem', flexShrink: 0, opacity: 0.8 }} />
                </Link>
              </MagneticBtn>

              {/* Secondary */}
              <MagneticBtn strength={0.18}>
                <Link
                  to="/upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    background: 'rgba(255,255,255,0.10)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    letterSpacing: '0.03em',
                    padding: '0.9rem 2rem',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.25s ease, border-color 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
                  }}
                >
                  <FiUploadCloud style={{ fontSize: '1.05rem', flexShrink: 0 }} />
                  Share Your Story
                </Link>
              </MagneticBtn>
            </motion.div>

            {/* ⑤ Stats row */}
            <motion.div
              variants={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2.5rem',
                marginTop: '1.5rem',
                padding: '1.1rem 2.5rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <StatItem value={100} suffix="+" label="Stories" delay={1000} />
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.15)' }} />
              <StatItem value={40} suffix="+" label="Destinations" delay={1200} />
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.15)' }} />
              <StatItem value={8} suffix="+" label="Categories" delay={1400} />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <ScrollPill />
      </div>

      {/* ── World Map Section ── */}
      <WorldMapSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   App router
───────────────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Toaster 
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                borderRadius: '10px',
              },
              success: { style: { background: '#22c55e' } },
              error: { style: { background: '#ef4444' } },
            }}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadStory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/journals" element={<Journal />} />
            {/* Level 1 — City Gallery */}
            <Route path="/journal" element={<Journal />} />
            {/* Level 2 — Category Drill-Down */}
            <Route path="/journal/city/:city" element={<CityJournal />} />
            {/* Level 3 — Story List (city + category) */}
            <Route path="/journal/city/:city/:category" element={<CategoryBlogs />} />
            {/* Blog Detail — MongoDB ObjectId never clashes with the literal 'city' prefix */}
            <Route path="/journal/:id" element={<BlogDetail />} />
            <Route
              path="/write-blog"
              element={
                <ProtectedRoute>
                  <WriteBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write-blog/:id"
              element={
                <ProtectedRoute>
                  <WriteBlog />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

