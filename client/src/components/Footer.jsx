import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';

/* ── Column heading ─────────────────────────────────────────── */
function ColHeading({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: '#8A8A8A',
      marginBottom: '1.1rem',
    }}>
      {children}
    </p>
  );
}

/* ── Social icon button ─────────────────────────────────────── */
function SocialIcon({ href, Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.9rem',
        transition: 'color 0.22s ease, border-color 0.22s ease, background 0.22s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon />
    </a>
  );
}

/* ── Main Footer ────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer style={{ background: '#141414', color: '#fff' }}>

      {/* ── Top decorative rule ── */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, transparent, #C07A4F 30%, #3B9B8F 70%, transparent)',
        opacity: 0.6,
      }} />

      {/* ── 3-column grid ── */}
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'clamp(2rem,4vw,3.5rem)',
        alignItems: 'start',
      }}>

        {/* ── Column 1 — Brand ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: '0.85rem',
            }}>
              PHDMusafir
            </p>
          </Link>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            maxWidth: 260,
          }}>
            A premium journey atlas and travel storytelling platform.
          </p>

          {/* Nav shortcuts */}
          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { label: 'Discover Stories', to: '/discover' },
              { label: 'Travel Journal', to: '/journal' },
              { label: 'Share Your Story', to: '/upload' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.38)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  width: 'fit-content',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#D4CDBC'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Column 2 — Our Mission ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <ColHeading>Our Mission</ColHeading>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            fontWeight: 400,
            color: '#E8E2D8',
            marginBottom: '0.6rem',
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            maxWidth: 260,
          }}>
            "Every journey tells a story — we're here to help you share yours with the world."
          </p>

          {/* Subtle divider */}
          <div style={{
            width: 36,
            height: 2,
            background: 'linear-gradient(90deg, #C07A4F, transparent)',
            borderRadius: 1,
            margin: '1.3rem 0',
          }} />

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.65,
            maxWidth: 250,
          }}>
            Bridging cultures through authentic travel storytelling, one destination at a time.
          </p>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.22)',
            lineHeight: 1.6,
            maxWidth: 240,
            marginTop: '0.8rem',
          }}>
            Built with ♥ at LNMIIT, Jaipur
          </p>
        </motion.div>

        {/* ── Column 3 — Development Team ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <ColHeading>Developed By</ColHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { name: 'Kartik Awasthi', role: 'Full-Stack Engineer' },
              { name: 'Atharv Shah', role: 'Full-Stack Engineer' },
              { name: 'Alakshendra Bharadwaj', role: 'Backend & Integration' },
            ].map(({ name, role }) => (
              <li key={name}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#D4CDBC',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {name}
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.3)',
                  margin: 0,
                  marginTop: '0.1rem',
                }}>
                  {role}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        maxWidth: 1180,
        margin: '0 auto',
        padding: '1.25rem clamp(1.5rem,5vw,3rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.28)',
          margin: 0,
          letterSpacing: '0.02em',
        }}>
          © 2026 PHDMusafir. All rights reserved.
        </p>

        {/* Social icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SocialIcon href="https://github.com" Icon={FaGithub} label="GitHub" />
          <SocialIcon href="https://linkedin.com" Icon={FaLinkedinIn} label="LinkedIn" />
          <SocialIcon href="https://instagram.com" Icon={FaInstagram} label="Instagram" />
          <SocialIcon href="https://youtube.com" Icon={FaYoutube} label="YouTube" />
        </div>
      </div>
    </footer>
  );
}
