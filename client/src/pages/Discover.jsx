import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiAlertCircle, FiInbox, FiUploadCloud, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { getAllStories } from '../services/storyService';
import StoryCard from '../components/StoryCard';
import StoryModal from '../components/StoryModal';

/* ─── Category emoji map ─────────────────────────────────── */
const CATEGORY_EMOJI = {
  food: '🍛', Food: '🍛', Dining: '🍛',
  adventure: '🏔️', Adventure: '🏔️', Trekking: '🏔️',
  culture: '🏛️', Culture: '🏛️', Heritage: '🏛️', History: '🏛️',
  nature: '🌿', Nature: '🌿', Wildlife: '🦁',
  temple: '🛕', Temple: '🛕', Spiritual: '🙏',
  beach: '🏖️', Beach: '🏖️',
  city: '🌆', City: '🌆', Urban: '🌆',
  nightlife: '🎶', Nightlife: '🎶',
  art: '🎨', Art: '🎨',
  shopping: '🛍️', Shopping: '🛍️',
  wellness: '🧘', Wellness: '🧘',
  architecture: '🏗️', Architecture: '🏗️',
  picnic: '🧺', Picnic: '🧺',
  'road trip': '🚗', 'Road Trip': '🚗',
};
const getEmoji = (cat) => CATEGORY_EMOJI[cat] || CATEGORY_EMOJI[cat?.toLowerCase()] || '📌';

const ALL = 'All';

/* ─── Skeleton card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      aspectRatio: '4 / 5',
      borderRadius: 18,
      background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

/* ─── Horizontal pill bar ────────────────────────────────── */
function PillBar({ pills, selected, onSelect }) {
  const ref = useRef(null);

  /* Scroll active pill into view */
  useEffect(() => {
    const activeEl = ref.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ inline: 'nearest', behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Fade edges */}
      {['left', 'right'].map((side) => (
        <div key={side} style={{
          position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 36, zIndex: 2,
          background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, #fff, transparent)`,
          pointerEvents: 'none',
        }} />
      ))}

      <div
        ref={ref}
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          padding: '0.25rem 0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {pills.map(({ id, label, count }) => {
          const active = selected === id;
          return (
            <motion.button
              key={id}
              data-active={active}
              layout
              onClick={() => onSelect(id)}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.48rem 1.05rem',
                borderRadius: 999,
                fontSize: '0.82rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: active ? 600 : 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                border: active ? '1.5px solid transparent' : '1.5px solid #E4DDD4',
                background: active ? '#C07A4F' : '#F5F1EC',
                color: active ? '#fff' : '#4A3F36',
                boxShadow: active ? '0 4px 14px rgba(192,122,79,0.28)' : 'none',
                letterSpacing: '0.01em',
              }}
            >
              {label}
              {count != null && id !== ALL && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.05rem 0.4rem',
                  borderRadius: 999,
                  background: active ? 'rgba(255,255,255,0.22)' : 'rgba(74,63,54,0.10)',
                  color: active ? '#fff' : '#6B5F55',
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Adaptive hero header ───────────────────────────────── */
function DiscoverHeader({ city, category, totalShown, totalAll, bgImage }) {
  const eyebrow = city !== ALL ? `Exploring · ${city}` : 'The Travel Journal';
  const heading = city !== ALL ? city : 'Discover the World Through Stories';
  const sub = category !== ALL
    ? `Showing ${getEmoji(category)} ${category} stories${city !== ALL ? ` in ${city}` : ''}`
    : city !== ALL
      ? `A curated collection of stories from ${city}`
      : 'Immerse yourself in a curated collection of authentic, beautiful journeys handpicked for the sophisticated traveler.';

  // Fallback high-quality stock image if none provided
  const secureBgImage = bgImage || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2669&auto=format&fit=crop';

  return (
    <div style={{
      position: 'relative',
      height: '65vh',
      minHeight: 500,
      maxHeight: 800,
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '-80px', // Pull up under the navbar
    }}>
      {/* Background Image with Ken Burns */}
      <div style={{
        position: 'absolute',
        inset: '-5%', // Extra bleed for scale to hide edges
        zIndex: 0,
      }}>
        <img 
          src={secureBgImage} 
          alt="Hero Cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            animation: 'ken-burns 25s ease-out forwards',
          }}
        />
      </div>

      {/* Heavy Scrim for premium text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        maxWidth: 820, 
        padding: '0 2rem', 
        textAlign: 'center',
        marginTop: '64px', // Offset nav
      }}>
        <motion.p
          key={eyebrow}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4CDBC', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          key={heading}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
            fontWeight: 700, 
            color: '#fff', 
            letterSpacing: '-0.02em', 
            lineHeight: 1.1, 
            marginBottom: '1.2rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {heading}
        </motion.h1>

        <motion.p
          key={sub}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ 
            fontFamily: 'var(--font-serif)', 
            fontStyle: 'italic', 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', 
            maxWidth: 640, 
            margin: '0 auto 2rem',
            lineHeight: 1.6,
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          {sub}
        </motion.p>

        <motion.span 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 1.1rem', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {totalShown} {totalShown === 1 ? 'Entry' : 'Entries'}
        </motion.span>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function Discover() {
  const routerLocation = useLocation();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(ALL);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedStory, setSelectedStory] = useState(null);

  /* Pre-select city if navigated from world map pin */
  useEffect(() => {
    if (routerLocation.state?.cityFilter) {
      setSelectedCity(routerLocation.state.cityFilter);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Fetch */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await getAllStories({ grouped: false });
        setStories(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load stories. Is the server running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* City pills — always includes 'All' at front */
  const cityPills = useMemo(() => {
    const map = {};
    stories.forEach((s) => { const c = s.placeVisited || 'Unknown'; map[c] = (map[c] || 0) + 1; });
    return [
      { id: ALL, label: '🌍 All Cities' },
      ...Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([city, count]) => ({ id: city, label: city, count })),
    ];
  }, [stories]);

  /* Category pills — only categories that exist in the selected city */
  const categoryPills = useMemo(() => {
    const src = selectedCity === ALL ? [] : stories.filter((s) => (s.placeVisited || 'Unknown') === selectedCity);
    const map = {};
    src.forEach((s) => { const c = s.category || 'Uncategorized'; map[c] = (map[c] || 0) + 1; });
    return [
      { id: ALL, label: '✦ All' },
      ...Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([cat, count]) => ({ id: cat, label: `${getEmoji(cat)} ${cat}`, count })),
    ];
  }, [stories, selectedCity]);

  /* Filtered stories */
  const filteredStories = useMemo(() => {
    let src = [...stories];
    if (selectedCity !== ALL) src = src.filter((s) => (s.placeVisited || 'Unknown') === selectedCity);
    if (selectedCategory !== ALL) src = src.filter((s) => (s.category || 'Uncategorized') === selectedCategory);
    return src.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [stories, selectedCity, selectedCategory]);

  /* City selection resets category */
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedCategory(ALL);
  };

  const hasActiveFilter = selectedCity !== ALL || selectedCategory !== ALL;
  const clearFilters = () => { setSelectedCity(ALL); setSelectedCategory(ALL); };

  /* Error */
  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '5rem 1rem' }}>
        <FiAlertCircle style={{ fontSize: '3rem', color: '#3B5F54' }} />
        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#3B5F54' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,95,84,0.08)', color: '#3B5F54', fontWeight: 600, padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>

        {/* ── Adaptive header ── */}
        <DiscoverHeader
          city={selectedCity}
          category={selectedCategory}
          totalShown={filteredStories.length}
          totalAll={stories.length}
        />

        {/* ── Sticky filter bar ── */}
        <div style={{
          position: 'sticky', top: 64, zIndex: 40,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(228,221,212,0.9)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          padding: '0.6rem 0',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>

            {/* White card container for both rows */}
            {!loading && (
              <div style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #EDE8E2',
                padding: '0.75rem 0.5rem 0.6rem',
              }}>

                {/* City row — no label */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: selectedCity !== ALL ? '0.6rem' : 0 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <PillBar pills={cityPills} selected={selectedCity} onSelect={handleCitySelect} />
                  </div>
                </div>

                {/* Category row — conditional */}
                <AnimatePresence>
                  {selectedCity !== ALL && categoryPills.length > 1 && (
                    <motion.div
                      key="cat-row"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                        paddingTop: '0.55rem',
                        borderTop: '1px solid #EDE8E2',
                      }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700,
                          letterSpacing: '0.2em', textTransform: 'uppercase',
                          color: '#B0A89E', flexShrink: 0, paddingLeft: '0.5rem',
                          whiteSpace: 'nowrap',
                        }}>
                          Refine by:
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <PillBar pills={categoryPills} selected={selectedCategory} onSelect={setSelectedCategory} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.25rem 4rem' }}>

          {/* Active filters + count row */}
          <AnimatePresence>
            {!loading && (hasActiveFilter || filteredStories.length > 0) && (
              <motion.div
                key="meta"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  {selectedCity !== ALL && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(30,58,95,0.10)', border: '1px solid rgba(30,58,95,0.2)', color: '#2A483E', fontSize: '0.75rem', fontWeight: 600, padding: '0.28rem 0.7rem 0.28rem 0.85rem', borderRadius: 999 }}>
                      📍 {selectedCity}
                      <button onClick={() => handleCitySelect(ALL)} style={{ display: 'flex', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}><FiX style={{ fontSize: '0.8rem' }} /></button>
                    </span>
                  )}
                  {selectedCategory !== ALL && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(59,95,84,0.10)', border: '1px solid rgba(59,95,84,0.25)', color: '#3B5F54', fontSize: '0.75rem', fontWeight: 600, padding: '0.28rem 0.7rem 0.28rem 0.85rem', borderRadius: 999 }}>
                      {getEmoji(selectedCategory)} {selectedCategory}
                      <button onClick={() => setSelectedCategory(ALL)} style={{ display: 'flex', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}><FiX style={{ fontSize: '0.8rem' }} /></button>
                    </span>
                  )}
                  {hasActiveFilter && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={clearFilters}
                      style={{ fontSize: '0.72rem', color: '#9A9A9A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                    >
                      Clear all
                    </motion.button>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9A9A9A', fontWeight: 500 }}>
                  {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skeletons */}
          {loading && (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="masonry-item">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          )}

          {/* No stories at all */}
          {!loading && stories.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '6rem 1rem', textAlign: 'center' }}>
              <FiInbox style={{ fontSize: '3.5rem', color: 'rgba(59,95,84,0.3)' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: '#6B6B6B' }}>No stories yet</h2>
              <p style={{ fontSize: '0.875rem', color: '#9A9A9A' }}>Be the first to share a travel story!</p>
              <a href="/upload" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#3B5F54,#2A483E)', color: '#fff', fontWeight: 700, padding: '0.7rem 1.4rem', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 24px rgba(59,95,84,0.35)' }}>
                <FiUploadCloud /> Share Your Story
              </a>
            </div>
          )}

          {/* Filtered empty */}
          {!loading && stories.length > 0 && filteredStories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', padding: '5rem 1rem', textAlign: 'center' }}
            >
              <span style={{ fontSize: '2.5rem' }}>🔍</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: '#6B6B6B' }}>No stories match this filter</h3>
              <p style={{ fontSize: '0.85rem', color: '#9A9A9A' }}>
                {selectedCategory !== ALL
                  ? `No ${selectedCategory} stories in ${selectedCity} yet.`
                  : 'Try a different city.'}
              </p>
              <button onClick={clearFilters} style={{ marginTop: '0.25rem', background: 'rgba(59,95,84,0.10)', color: '#3B5F54', border: 'none', borderRadius: 10, padding: '0.6rem 1.3rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                Clear filters
              </button>
            </motion.div>
          )}

          {/* Story grid — Masonry layout */}
          {!loading && filteredStories.length > 0 && (
            <div className="masonry-grid">
              <AnimatePresence mode="popLayout">
                {filteredStories.map((story) => (
                  <div key={story._id} className="masonry-item">
                    <StoryCard story={story} onClick={() => setSelectedStory(story)} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </>
  );
}

