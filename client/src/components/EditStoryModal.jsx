import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiCamera, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateStory } from '../services/storyService';

const CATEGORIES = [
  'Adventure', 'Architecture', 'Culture', 'Food', 'History',
  'Nature', 'Nightlife', 'Picnic', 'Road Trip', 'Shopping',
  'Spiritual', 'Wildlife',
];

/**
 * Modal to edit an existing story.
 * Props:
 *   story   — the story object to edit (or null to hide)
 *   onClose — callback to close the modal
 *   onSaved — callback after successful save (receives updated story)
 */
export default function EditStoryModal({ story, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placeVisited, setPlaceVisited] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form when story changes
  useEffect(() => {
    if (!story) return;
    setTitle(story.title || '');
    setDescription(story.description || '');
    setPlaceVisited(story.placeVisited || '');
    setCategory(story.category || '');
    setTags((story.tags || []).join(', '));
    setNewImage(null);
    setPreview(story.image || null);
    setError('');
  }, [story]);

  // Lock body scroll
  useEffect(() => {
    if (!story) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [story]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !placeVisited.trim() || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);

      // Build FormData if there's a new image, otherwise plain JSON
      let payload;
      if (newImage) {
        payload = new FormData();
        payload.append('title', title.trim());
        payload.append('description', description.trim());
        payload.append('placeVisited', placeVisited.trim());
        payload.append('category', category);
        payload.append('tags', tags.trim());
        payload.append('image', newImage);
      } else {
        payload = {
          title: title.trim(),
          description: description.trim(),
          placeVisited: placeVisited.trim(),
          category,
          tags: tags.trim(),
        };
      }

      const res = await updateStory(story._id, payload);
      onSaved?.(res.data);
      toast.success('Story updated successfully!');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update story.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #E8E0D8',
    outline: 'none',
    fontSize: '0.9rem',
    color: '#2D2D2D',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#9A9A9A',
    marginBottom: '0.4rem',
    display: 'block',
  };
  const focusIn = (e) => (e.target.style.borderColor = '#3B5F54');
  const focusOut = (e) => (e.target.style.borderColor = '#E8E0D8');

  const modal = (
    <AnimatePresence>
      {story && (
        <motion.div
          key="edit-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(10,15,25,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <motion.div
            key="edit-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #F0EAE3',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#2A483E',
                margin: 0,
              }}>
                Edit Story
              </h3>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.04)', border: 'none',
                  color: '#9A9A9A', cursor: 'pointer', fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              >
                <FiX />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSave} style={{
              flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1.1rem',
            }}>
              {/* Image preview + change */}
              <div>
                <label style={labelStyle}>Cover Image</label>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: '#F5F0EB',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview && (
                    <img src={preview} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: '#fff', color: '#3B5F54',
                      padding: '0.4rem 0.9rem', borderRadius: 999,
                      fontSize: '0.78rem', fontWeight: 600,
                    }}>
                      <FiCamera /> Change Photo
                    </span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  required maxLength={150} disabled={saving}
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  required rows={3} disabled={saving}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              {/* Place + Category row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Place *</label>
                  <input
                    value={placeVisited} onChange={(e) => setPlaceVisited(e.target.value)}
                    required disabled={saving}
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    required disabled={saving}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', padding: '0.7rem 1.2rem 0.7rem 0' }}
                    onFocus={focusIn} onBlur={focusOut}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input
                  value={tags} onChange={(e) => setTags(e.target.value)}
                  disabled={saving} placeholder="sunset, mountains…"
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 10, padding: '0.6rem 0.9rem',
                  color: '#DC2626', fontSize: '0.8rem',
                }}>
                  <FiAlertCircle style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 12,
                    border: '1.5px solid #E8E0D8', background: 'transparent',
                    color: '#6B6B6B', fontWeight: 600, fontSize: '0.88rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #3B5F54, #2A483E)',
                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(59,95,84,0.35)',
                    opacity: saving ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? (
                    <svg style={{ animation: 'spin 0.8s linear infinite', height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <FiSave />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

