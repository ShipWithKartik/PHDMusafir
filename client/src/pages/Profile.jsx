import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiEdit2, FiTrash2, FiUploadCloud, FiCalendar,
  FiBookOpen, FiAlertCircle, FiRefreshCw, FiBookmark, FiPenTool,
  FiClock, FiCheck, FiX, FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getMyStories, deleteStory } from '../services/storyService';
import { getBookmarks } from '../services/authService';
import api from '../services/api';
import toast from 'react-hot-toast';
import StoryModal from '../components/StoryModal';
import EditStoryModal from '../components/EditStoryModal';
import StoryCard from '../components/StoryCard';

const CATEGORY_EMOJI = {
  Food: '🍛', Adventure: '🏔️', Culture: '🏛️', Nature: '🌿',
  Temple: '🛕', Spiritual: '🙏', Beach: '🏖️', City: '🌆',
  Nightlife: '🎶', Art: '🎨', Shopping: '🛍️', History: '🏛️',
  Architecture: '🏗️', Picnic: '🧺', 'Road Trip': '🚗', Wildlife: '🦁',
};
const getEmoji = (c) => CATEGORY_EMOJI[c] || '📌';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [activeTab, setActiveTab] = useState('my-stories'); // 'my-stories' | 'saved' | 'my-blogs'
  
  const [stories, setStories] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  
  const [error, setError] = useState('');
  const [viewStory, setViewStory] = useState(null);
  const [editStory, setEditStory] = useState(null);
  const [deleting, setDeleting] = useState(null); // story._id being deleted

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchStories();
    fetchSavedStories();
    fetchBlogs();
  }, [isLoggedIn]);

  const fetchStories = async () => {
    try {
      setLoading(true); setError('');
      const res = await getMyStories();
      setStories(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load your stories.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedStories = async () => {
    try {
      setLoadingSaved(true);
      const res = await getBookmarks();
      setSavedStories(res.bookmarks || []);
    } catch (err) {
      console.error('Failed to fetch saved stories:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const res = await api.get('/blogs/my');
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // When global user bookmarks change, refresh savedStories to keep parity
  // so if a user un-bookmarks from the saved tab, it drops out of the array
  useEffect(() => {
    if (user && user.bookmarks) {
      // Re-fetch to ensure we have populated stories, or just filter existing:
      setSavedStories((prev) => 
        prev.filter(story => 
          user.bookmarks.some(b => (typeof b === 'string' ? b : b._id) === story._id)
        )
      );
    }
  }, [user?.bookmarks]);

  const handleDelete = async (story) => {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    try {
      setDeleting(story._id);
      await deleteStory(story._id);
      setStories((prev) => prev.filter((s) => s._id !== story._id));
      toast.success('Story deleted successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete story.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (updatedStory) => {
    setStories((prev) => prev.map((s) => s._id === updatedStory._id ? updatedStory : s));
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  if (!isLoggedIn) return null;

  return (
    <>
      <StoryModal story={viewStory} onClose={() => setViewStory(null)} />
      <EditStoryModal story={editStory} onClose={() => setEditStory(null)} onSaved={handleSaved} />

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F8F4EF 0%, #F8F9FA 50%, #EFF4F8 100%)',
      }}>
        {/* ── Profile header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #2A483E 0%, #3B5F54 55%, #1a3255 100%)',
          padding: 'calc(80px + clamp(1.5rem, 4vw, 2.5rem)) 1.5rem clamp(2rem, 4vw, 3rem)',
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B5F54, #D4CDBC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: '#fff',
              flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                fontWeight: 700, color: '#fff',
                margin: '0 0 0.4rem', lineHeight: 1.2,
              }}>
                {user?.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: 0 }}>
                {user?.email}
              </p>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(212,205,188,0.8)', fontWeight: 500 }}>
                  <FiCalendar style={{ fontSize: '0.75rem' }} /> Joined {joinedDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(212,205,188,0.8)', fontWeight: 500 }}>
                  <FiBookOpen style={{ fontSize: '0.75rem' }} /> {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(212,205,188,0.8)', fontWeight: 500 }}>
                  <FiPenTool style={{ fontSize: '0.75rem' }} /> {blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
          
          {/* ── Tab Switcher & Actions ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0.5rem', background: '#e9eff5',
              padding: '0.35rem', borderRadius: 14, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <button
                onClick={() => setActiveTab('my-stories')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'my-stories' ? '#fff' : 'transparent',
                  color: activeTab === 'my-stories' ? '#2A483E' : '#64748b',
                  boxShadow: activeTab === 'my-stories' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <FiBookOpen style={{ fontSize: '1rem' }} /> My Stories
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'saved' ? '#fff' : 'transparent',
                  color: activeTab === 'saved' ? '#2A483E' : '#64748b',
                  boxShadow: activeTab === 'saved' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <FiBookmark style={{ fontSize: '1rem' }} /> Saved Journeys
              </button>
              <button
                onClick={() => setActiveTab('my-blogs')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.6rem 1.2rem', borderRadius: 10, border: 'none',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'my-blogs' ? '#fff' : 'transparent',
                  color: activeTab === 'my-blogs' ? '#2A483E' : '#64748b',
                  boxShadow: activeTab === 'my-blogs' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  position: 'relative',
                }}
              >
                <FiPenTool style={{ fontSize: '1rem' }} /> My Blogs
                {/* Pending badge */}
                {blogs.filter(b => b.status === 'pending').length > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    background: '#D97706', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 700,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {blogs.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* Upload Button — only on stories tabs */}
            {(activeTab === 'my-stories' || activeTab === 'saved') && (
              <Link
                to="/upload"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'linear-gradient(135deg, #3B5F54, #2A483E)',
                  color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                  padding: '0.65rem 1.2rem', borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(59,95,84,0.30)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiUploadCloud style={{ fontSize: '1rem' }} /> New Story
              </Link>
            )}
            {activeTab === 'my-blogs' && (
              <Link
                to="/write-blog"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'linear-gradient(135deg, #3B5F54, #2A483E)',
                  color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                  padding: '0.65rem 1.2rem', borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(59,95,84,0.30)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiPenTool style={{ fontSize: '1rem' }} /> Write a Blog
              </Link>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
              padding: '1rem', color: '#DC2626', fontSize: '0.88rem', marginBottom: '1.5rem',
            }}>
              <FiAlertCircle /> {error}
              <button 
                onClick={activeTab === 'my-stories' ? fetchStories : fetchSavedStories} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {((activeTab === 'my-stories' && loading) || (activeTab === 'saved' && loadingSaved)) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1.25rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '4 / 5', borderRadius: 18,
                  background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          )}
          {activeTab === 'my-blogs' && loadingBlogs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{
                  height: 88, borderRadius: 14,
                  background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          )}

          {/* Empty state - My Stories */}
          {activeTab === 'my-stories' && !loading && stories.length === 0 && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📝</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#6B6B6B' }}>
                No stories yet
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#9A9A9A' }}>
                Share your first travel story and it will appear here!
              </p>
            </div>
          )}

          {/* Empty state - Saved Journeys */}
          {activeTab === 'saved' && !loadingSaved && savedStories.length === 0 && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔖</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#6B6B6B' }}>
                No saved journeys
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#9A9A9A' }}>
                Explore the discover page and bookmark stories to save them for later!
              </p>
              <Link to="/" style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', background: '#2A483E', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>
                Discover Stories
              </Link>
            </div>
          )}

          {/* Stories grid - My Stories */}
          {activeTab === 'my-stories' && !loading && stories.length > 0 && (
            <motion.div
              layout
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1.25rem' }}
            >
              <AnimatePresence mode="popLayout">
                {stories.map((story) => (
                  <motion.div
                    key={story._id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {/* Management card */}
                    <article
                      style={{
                        position: 'relative', overflow: 'hidden', borderRadius: 18,
                        aspectRatio: '4 / 5', background: '#e8e0d8',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)';
                        e.currentTarget.querySelector('.mgmt-bar').style.opacity = '1';
                        e.currentTarget.querySelector('.mgmt-bar').style.transform = 'translateY(0)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)';
                        e.currentTarget.querySelector('.mgmt-bar').style.opacity = '0';
                        e.currentTarget.querySelector('.mgmt-bar').style.transform = 'translateY(8px)';
                      }}
                    >
                      {/* Image */}
                      <img
                        src={story.image} alt={story.title}
                        onClick={() => setViewStory(story)}
                        loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Gradient overlay */}
                      <div
                        onClick={() => setViewStory(story)}
                        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 40%, transparent 70%)' }}
                      />

                      {/* Category badge */}
                      <div style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        color: '#fff', fontSize: '0.68rem', fontWeight: 600,
                        padding: '0.25rem 0.6rem', borderRadius: 999,
                      }}>
                        <span style={{ fontSize: '0.8rem' }}>{getEmoji(story.category)}</span>
                        {story.category}
                      </div>

                      {/* Bottom info */}
                      <div
                        onClick={() => setViewStory(story)}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 1rem 3.4rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#D4CDBC', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                          <FiMapPin style={{ fontSize: '0.72rem' }} />
                          {story.placeVisited}
                        </div>
                        <h3 style={{
                          fontFamily: 'var(--font-serif)', fontWeight: 700,
                          fontSize: '0.92rem', color: '#fff', lineHeight: 1.3,
                          margin: 0, display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}>
                          {story.title}
                        </h3>
                      </div>

                      {/* ── Management bar (edit/delete) — revealed on hover ── */}
                      <div
                        className="mgmt-bar"
                        style={{
                          position: 'absolute',
                          bottom: 0, left: 0, right: 0,
                          padding: '0.6rem 0.75rem',
                          background: 'rgba(0,0,0,0.55)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex', justifyContent: 'center', gap: '0.5rem',
                          opacity: 0,
                          transform: 'translateY(8px)',
                          transition: 'opacity 0.22s ease, transform 0.22s ease',
                        }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditStory(story); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            background: 'rgba(255,255,255,0.92)', color: '#2A483E',
                            border: 'none', borderRadius: 999,
                            padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.92)'}
                        >
                          <FiEdit2 style={{ fontSize: '0.8rem' }} /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(story); }}
                          disabled={deleting === story._id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            background: deleting === story._id ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.85)',
                            color: '#fff', border: 'none', borderRadius: 999,
                            padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 600,
                            cursor: deleting === story._id ? 'not-allowed' : 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { if (deleting !== story._id) e.currentTarget.style.background = 'rgba(220,38,38,1)'; }}
                          onMouseLeave={(e) => { if (deleting !== story._id) e.currentTarget.style.background = 'rgba(220,38,38,0.85)'; }}
                        >
                          <FiTrash2 style={{ fontSize: '0.8rem' }} />
                          {deleting === story._id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Stories grid - Saved Journeys */}
          {activeTab === 'saved' && !loadingSaved && savedStories.length > 0 && (
            <motion.div
              layout
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1.25rem' }}
            >
              <AnimatePresence mode="popLayout">
                {savedStories.map((story) => (
                  <motion.div
                    key={story._id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <StoryCard 
                      story={story} 
                      onClick={() => setViewStory(story)} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── My Blogs tab ── */}
          {activeTab === 'my-blogs' && !loadingBlogs && blogs.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>✍️</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#6B6B6B' }}>
                No blogs yet
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#9A9A9A' }}>
                Share your first travel blog — it will appear here once submitted.
              </p>
              <Link to="/write-blog" style={{ marginTop: '0.5rem', padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg,#3B5F54,#2A483E)', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem' }}>
                Write a Blog
              </Link>
            </div>
          )}

          {activeTab === 'my-blogs' && !loadingBlogs && blogs.length > 0 && (() => {
            /* Status config */
            const STATUS = {
              pending:  { label: 'Pending Review', color: '#D97706', bg: '#FEF3C7', icon: FiClock },
              accepted: { label: 'Published',      color: '#15803D', bg: '#DCFCE7', icon: FiCheck },
              rejected: { label: 'Rejected',        color: '#DC2626', bg: '#FEE2E2', icon: FiX    },
              deleted:  { label: 'Removed',         color: '#6B7280', bg: '#F3F4F6', icon: FiTrash2 },
            };
            const excerpt = (t='',n=110) => t.length<=n ? t : t.slice(0,n).trimEnd()+'…';
            const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

            return (
              <AnimatePresence>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {blogs.map((blog, i) => {
                    const st = STATUS[blog.status] || STATUS.pending;
                    const Icon = st.icon;
                    const cover = blog.images?.[0]?.url;
                    return (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          background: '#fff',
                          borderRadius: 14,
                          border: '1px solid #F0EDE8',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          display: 'flex', gap: '1rem', alignItems: 'stretch',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Cover thumbnail */}
                        {cover && (
                          <div style={{ width: 90, flexShrink: 0, overflow: 'hidden' }}>
                            <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}

                        {/* Body */}
                        <div style={{ flex: 1, padding: '1rem', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                            {/* Status badge */}
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.28rem',
                              background: st.bg, color: st.color,
                              fontSize: '0.68rem', fontWeight: 700,
                              padding: '0.22rem 0.65rem', borderRadius: 999,
                            }}>
                              <Icon style={{ fontSize: '0.72rem' }} />
                              {st.label}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#9A9A9A' }}>{fmtDate(blog.createdAt)}</span>
                          </div>

                          <h3 style={{
                            fontFamily: 'var(--font-serif)', fontWeight: 700,
                            fontSize: '0.98rem', color: '#2A483E', margin: '0 0 0.3rem',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {blog.title}
                          </h3>

                          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, lineHeight: 1.5 }}>
                            {excerpt(blog.content)}
                          </p>

                          {/* Rejection note */}
                          {blog.status === 'rejected' && blog.adminNote && (
                            <div style={{
                              display: 'flex', gap: '0.4rem', alignItems: 'flex-start',
                              marginTop: '0.55rem',
                              background: '#FEF2F2', borderRadius: 8,
                              padding: '0.5rem 0.75rem', fontSize: '0.76rem', color: '#991B1B',
                            }}>
                              <FiAlertCircle style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                              <span><strong>Editor note:</strong> {blog.adminNote}</span>
                            </div>
                          )}
                        </div>

                        {/* Right CTA */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem', gap: '0.5rem', flexShrink: 0 }}>
                          {blog.status === 'accepted' && (
                            <>
                              <Link
                                to={`/journal/${blog._id}`}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                  fontSize: '0.78rem', fontWeight: 600,
                                  color: '#15803D', background: '#DCFCE7',
                                  padding: '0.45rem 0.85rem', borderRadius: 8,
                                  textDecoration: 'none', whiteSpace: 'nowrap',
                                }}
                              >
                                View <FiArrowRight />
                              </Link>
                              <Link
                                to={`/write-blog/${blog._id}`}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                  fontSize: '0.78rem', fontWeight: 600,
                                  color: '#1D4ED8', background: '#DBEAFE',
                                  padding: '0.45rem 0.85rem', borderRadius: 8,
                                  textDecoration: 'none', whiteSpace: 'nowrap',
                                }}
                              >
                                <FiEdit2 style={{ fontSize: '0.75rem' }} /> Edit
                              </Link>
                            </>
                          )}
                          {blog.status === 'rejected' && (
                            <Link
                              to={`/write-blog/${blog._id}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.78rem', fontWeight: 600,
                                color: '#DC2626', background: '#FEE2E2',
                                padding: '0.45rem 0.85rem', borderRadius: 8,
                                textDecoration: 'none', whiteSpace: 'nowrap',
                              }}
                            >
                              Revise <FiArrowRight />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            );
          })()}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

