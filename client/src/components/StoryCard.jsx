import { useState, useEffect } from 'react';
import { FiMapPin, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { toggleBookmark } from '../services/authService';

/* Category → emoji map (shared with Discover page) */
const CATEGORY_EMOJI = {
  food: '🍛', Food: '🍛', Dining: '🍛',
  adventure: '🏔️', Adventure: '🏔️', Trekking: '🏔️', Trek: '🏔️',
  culture: '🏛️', Culture: '🏛️', Heritage: '🏛️', History: '🏛️',
  nature: '🌿', Nature: '🌿', Wildlife: '🦁',
  temple: '🛕', Temple: '🛕', Spiritual: '🙏', Religion: '🙏',
  beach: '🏖️', Beach: '🏖️', Coastal: '🌊',
  city: '🌆', City: '🌆', Urban: '🌆',
  nightlife: '🎶', Nightlife: '🎶',
  art: '🎨', Art: '🎨',
  shopping: '🛍️', Shopping: '🛍️',
  wellness: '🧘', Wellness: '🧘',
};
function getCatEmoji(cat) {
  return CATEGORY_EMOJI[cat] || CATEGORY_EMOJI[cat?.toLowerCase()] || '📌';
}

/**
 * Magazine-style 4:5 story card.
 * Image is the hero; all text lives in an overlay at the bottom.
 */
export default function StoryCard({ story, onClick }) {
  const { title, description, image, placeVisited, category, tags = [] } = story;
  const emoji = getCatEmoji(category);
  
  const { user, isLoggedIn, updateUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user && user.bookmarks) {
      // Allow bookmarks array to contain either string IDs or populated objects
      const isBookmarked = user.bookmarks.some(
        (b) => (typeof b === 'string' ? b : b._id) === story._id
      );
      setIsSaved(isBookmarked);
    } else {
      setIsSaved(false);
    }
  }, [user, story._id]);

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast('Log in to save this journey.', { icon: '🔒' });
      return;
    }

    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await toggleBookmark(story._id);
      if (res.success) {
        // Update global user bookmarks
        updateUser(prev => ({
          ...prev,
          bookmarks: res.bookmarks
        }));
        toast.success(res.message, { id: 'bookmark-toast' });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setIsSaved(previousState); // Revert on failure
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '0', // Sharp editorial edges instead of rounded
        cursor: 'pointer',
        background: '#e8e0d8',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.12)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1)';
      }}
    >
      {/* ── Image Container (Maintains intrinsic or forced aspect) ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
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
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* ── Soft gradient from bottom of image ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        {/* ── Floating category badge (top-right) — Glassmorphism ── */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#2D2D2D',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '0.35rem 0.8rem',
          borderRadius: '999px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: '0.8rem' }}>{emoji}</span>
          {category}
        </div>
      </div>

      {/* ── Text Content Below Image (Editorial Style) ── */}
      <div style={{
        padding: '1.25rem 1rem 1.5rem',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}>
        
        {/* Location tag and Bookmark */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: '#3B5F54',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            overflow: 'hidden',
          }}>
            <FiMapPin style={{ flexShrink: 0, fontSize: '0.75rem' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {placeVisited}
            </span>
          </div>

          <button
            onClick={handleBookmarkClick}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isSaved ? '#3B5F54' : '#9A9A9A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              transition: 'all 0.2s',
            }}
            aria-label={isSaved ? "Remove Bookmark" : "Add Bookmark"}
            title={isSaved ? "Saved" : "Save"}
          >
            <FiBookmark 
              style={{
                fontSize: '1.15rem',
                fill: isSaved ? 'currentColor' : 'none',
              }} 
            />
          </button>
        </div>

        {/* Title — Playfair Display */}
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
          color: '#2D2D2D',
          lineHeight: 1.3,
          margin: '0 0 0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </h3>

        {/* Description snippet */}
        {description && (
          <p style={{
            color: '#6B6B6B',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            margin: '0 0 1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </p>
        )}

        {/* Tags */}
        <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                color: '#9A9A9A',
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

