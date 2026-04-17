import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiMapPin, FiTag, FiClock, FiShare2, FiBookmark,
} from 'react-icons/fi';

/* Category emoji map */
const CATEGORY_EMOJI = {
  food: '🍛', Food: '🍛', Dining: '🍛',
  adventure: '🏔️', Adventure: '🏔️', Trekking: '🏔️',
  culture: '🏛️', Culture: '🏛️', Heritage: '🏛️', History: '🏛️',
  nature: '🌿', Nature: '🌿', Wildlife: '🦁',
  temple: '🛕', Temple: '🛕', Spiritual: '🙏',
  beach: '🏖️', Beach: '🏖️',
  city: '🌆', City: '🌆',
  nightlife: '🎶', Nightlife: '🎶',
  art: '🎨', Art: '🎨',
  shopping: '🛍️', Shopping: '🛍️',
  wellness: '🧘', Wellness: '🧘',
};
const getEmoji = (cat) => CATEGORY_EMOJI[cat] || '📌';

export default function StoryModal({ story, onClose }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!story) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [story, handleKeyDown]);

  /* Reset state when story changes */
  useEffect(() => { setSaved(false); setCopied(false); }, [story]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const modal = (
    <AnimatePresence>
      {story && (() => {
        const { title, description, image, placeVisited, category, tags = [], createdAt } = story;
        const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        const emoji = getEmoji(category);
        const readTime = Math.max(1, Math.ceil((description || '').split(/\s+/).length / 200));

        return (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '2rem',
                overflowY: 'auto',
              }}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              {/* ── Modal panel — 70/30 Split ── */}
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  background: '#fff',
                  width: '100%',
                  maxWidth: 1200,
                  minHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'row',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
                  borderRadius: 2, // Sharp edges
                  overflow: 'hidden',
                  margin: 'auto 0',
                }}
              >
                {/* Close Button Floating */}
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 50,
                    width: 40, height: 40,
                    background: '#F8F9FA',
                    border: 'none',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#2D2D2D',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E8E0D8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F8F9FA'}
                >
                  <FiX style={{ fontSize: '1.2rem' }} />
                </button>

                {/* ═══════════════════════════════════════════
                    LEFT SIDE: 70% Content Flow
                ═══════════════════════════════════════════ */}
                <div style={{
                  flex: '7',
                  borderRight: '1px solid #E8E0D8',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Hero Image Full Bleed Left */}
                  <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative' }}>
                    <img 
                      src={image} 
                      alt={title} 
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%', objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Written Content */}
                  <div style={{ padding: '3.5rem clamp(2rem, 5vw, 4rem)', maxWidth: 800, margin: '0 auto' }}>
                    {/* Eyebrow */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#3B5F54',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}>
                      <FiMapPin style={{ fontSize: '0.8rem' }} /> {placeVisited}
                    </div>

                    <h2 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                      fontWeight: 700,
                      color: '#2D2D2D',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      margin: '0 0 2rem 0',
                    }}>
                      {title}
                    </h2>

                    {/* Description set in serif, large leading */}
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                      lineHeight: 1.8,
                      color: '#4A4A4A',
                      whiteSpace: 'pre-line',
                      margin: 0,
                    }}>
                      {description}
                    </p>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════
                    RIGHT SIDE: 30% Sticky Sidebar
                ═══════════════════════════════════════════ */}
                <div style={{
                  flex: '3',
                  background: '#FDF6EF',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'sticky',
                    top: 0,
                    padding: '4rem 2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem',
                  }}>
                    {/* Category Label */}
                    <div>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: '#fff', border: '1px solid #E8E0D8',
                        padding: '0.4rem 1rem', borderRadius: 999,
                        fontSize: '0.75rem', fontWeight: 600, color: '#2D2D2D',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}>
                        {emoji} {category}
                      </span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(59,95,84,0.2)', margin: 0 }} />

                    {/* Metadata Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#9A9A9A', marginBottom: '0.2rem' }}>Date Published</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#2D2D2D', fontWeight: 500 }}>
                          <FiClock style={{ color: '#3B5F54' }} /> {formattedDate}
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#9A9A9A', marginBottom: '0.2rem' }}>Reading Time</span>
                        <span style={{ fontSize: '0.9rem', color: '#2D2D2D', fontWeight: 500 }}>{readTime} minute read</span>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(59,95,84,0.2)', margin: 0 }} />

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {/* Save to Profile */}
                      <button
                        onClick={() => setSaved((s) => !s)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                          width: '100%',
                          padding: '0.85rem',
                          background: saved ? '#2D2D2D' : '#fff',
                          color: saved ? '#fff' : '#2D2D2D',
                          border: saved ? '1px solid #2D2D2D' : '1px solid #E8E0D8',
                          borderRadius: 8,
                          fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: saved ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <FiBookmark style={{ fontSize: '1.1rem', fill: saved ? '#fff' : 'none' }} />
                        {saved ? 'Saved to Profile' : 'Save to Profile'}
                      </button>

                      {/* Share */}
                      <button
                        onClick={handleShare}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                          width: '100%',
                          padding: '0.85rem',
                          background: copied ? '#E8F5E9' : 'transparent',
                          color: copied ? '#2E7D32' : '#3B5F54',
                          border: copied ? '1px solid #A5D6A7' : '1px solid rgba(59,95,84,0.3)',
                          borderRadius: 8,
                          fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <FiShare2 style={{ fontSize: '1rem' }} />
                        {copied ? 'Link Copied!' : 'Share Entry'}
                      </button>
                    </div>

                    {/* Tags at very bottom of sticky */}
                    {tags.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#9A9A9A', marginBottom: '0.6rem' }}>Tags</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {tags.map((tag) => (
                            <span key={tag} style={{
                              color: '#6B6B6B', fontSize: '0.75rem', fontWeight: 500,
                              background: '#F8F9FA', padding: '0.2rem 0.6rem', borderRadius: 4,
                              border: '1px solid #E8E0D8',
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

