import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCamera, FiX, FiItalic, FiLink2, FiCheckCircle,
  FiMapPin, FiTag, FiLoader,
} from 'react-icons/fi';
import { PiQuotesFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ── Constants ─────────────────────────────────────────── */
const MAX_WORDS = 2000;

const CATEGORIES = [
  'Picnic', 'Party', 'Family', 'Nature', 'Adventure',
  'Culture', 'Food', 'Heritage', 'Spiritual', 'Other',
];

/* ── Word / reading time stats ────────────────────────── */
function stats(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const mins  = Math.max(1, Math.round(words / 200));
  return { words, mins };
}

/* ── Inline Bold icon helper ────────────────────────────── */
function FiBoldText(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

export default function WriteBlog() {
  const navigate = useNavigate();
  const { id: editId } = useParams(); // undefined for create mode, blog _id for edit mode
  const isEditMode = Boolean(editId);

  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [city,      setCity]      = useState('');
  const [category,  setCategory]  = useState('');
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(false);

  // Track existing cover image URL in edit mode (used when no new file is chosen)
  const [existingCover, setExistingCover] = useState(null);
  // Track the previous status to show the right success message
  const [previousStatus, setPreviousStatus] = useState(null);

  const editorRef = useRef(null);
  const fileInput = useRef(null);
  const titleRef  = useRef(null);

  /* ── Fetch existing blog data for edit mode ────────── */
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        setFetchingBlog(true);
        const res = await api.get('/blogs/my');
        const myBlogs = res.data.data || [];
        const blog = myBlogs.find(b => b._id === editId);
        if (!blog) {
          toast.error('Blog not found or you do not have permission to edit it.');
          navigate('/profile');
          return;
        }
        if (blog.status !== 'accepted' && blog.status !== 'rejected') {
          toast.error(`This blog cannot be edited (status: ${blog.status}).`);
          navigate('/profile');
          return;
        }
        setTitle(blog.title || '');
        setContent(blog.content || '');
        setCity(blog.city || '');
        setCategory(blog.category || '');
        setPreviousStatus(blog.status);
        if (blog.images?.[0]?.url) {
          setExistingCover(blog.images[0].url);
          setPreview(blog.images[0].url);
        }
        // Set the editor content
        if (editorRef.current) {
          editorRef.current.innerText = blog.content || '';
        }
      } catch (err) {
        toast.error('Failed to load blog data.');
        navigate('/profile');
      } finally {
        setFetchingBlog(false);
      }
    })();
  }, [editId, navigate]);

  /* ── Keep content state in sync with contenteditable ── */
  const syncContent = useCallback(() => {
    const text = editorRef.current?.innerText || '';
    setContent(text);
    setErrors(p => ({ ...p, content: undefined }));
  }, []);

  /* ── Exec command helpers ──────────────────────────── */
  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val ?? null);
  };

  /* ── File handling — single cover image ────────────── */
  const addFile = (incoming) => {
    const f = Array.from(incoming)[0];
    if (!f) return;
    setFile(f);
    setExistingCover(null); // user chose a new image, discard existing reference
    setErrors(p => ({ ...p, image: undefined }));
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
  };

  const removeFile = () => { setFile(null); setPreview(null); setExistingCover(null); };

  /* ── Drag-drop on upload zone ────────────────────── */
  const onDrop = e => { e.preventDefault(); addFile(e.dataTransfer.files); };

  /* ── Validate + submit ──────────────────────────── */
  const handleSubmit = async () => {
    const { words } = stats(content);
    const errs = {};
    if (!title.trim())   errs.title    = 'Title is required.';
    if (!city.trim())    errs.city     = 'City / place visited is required.';
    if (!category)       errs.category = 'Please select a category.';
    if (!content.trim()) errs.content  = 'Write something first.';
    else if (words > MAX_WORDS) errs.content = `Content exceeds ${MAX_WORDS} words (currently ${words}).`;
    // In create mode, image is required; in edit mode, only required if no existing cover
    if (!file && !existingCover) errs.image = 'A cover image is required.';
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Please fix the highlighted fields.'); return; }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('title',    title.trim());
      form.append('content',  content.trim());
      form.append('city',     city.trim());
      form.append('category', category);
      if (file) {
        form.append('images', file);
      }

      if (isEditMode) {
        await api.put(`/blogs/${editId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/blogs', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state while fetching blog for edit ───── */
  if (fetchingBlog) {
    return (
      <div style={{
        minHeight: '100vh', paddingTop: 80, background: '#FDFAF6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <FiLoader style={{ fontSize: '2rem', color: '#3B5F54', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontFamily: 'var(--font-sans)' }}>
            Loading blog…
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Success screen ────────────────────────────── */
  if (submitted) {
    const wasAccepted = isEditMode && previousStatus === 'accepted';
    return (
      <div style={{
        minHeight: '100vh', paddingTop: 80, background: '#FDFAF6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff', borderRadius: 20, padding: '3rem 2.5rem',
            maxWidth: 460, width: '100%', textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: wasAccepted
              ? 'linear-gradient(135deg,#D97706,#B45309)'
              : 'linear-gradient(135deg,#3B5F54,#2A483E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <FiCheckCircle style={{ fontSize: '1.6rem', color: '#fff' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 700, color: '#2A483E', marginBottom: '0.75rem' }}>
            {wasAccepted ? 'Edit Submitted for Review' : 'Submitted for Review'}
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.92rem', marginBottom: '2rem' }}>
            {wasAccepted
              ? 'Your edits have been submitted. The blog has been moved back to Pending and will be invisible in the public Journal until the Admin reviews and re-approves it.'
              : isEditMode
                ? 'Your revised blog has been resubmitted for admin review. You\'ll find it under My Blogs in your profile.'
                : 'Your blog has been submitted for admin review. You\'ll find it under My Blogs in your profile while it awaits approval.'
            }
          </p>
          {wasAccepted && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: 10, padding: '0.75rem 1rem',
              fontSize: '0.82rem', color: '#92400E', marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              <strong>Note:</strong> Your post is no longer visible on the public Journal. It will reappear once the Admin accepts the updated version.
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                padding: '0.72rem 1.5rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#3B5F54,#2A483E)', color: '#fff',
                fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(59,95,84,0.35)',
              }}
            >
              Go to My Profile
            </button>
            {!isEditMode && (
              <button
                onClick={() => {
                  setSubmitted(false); setTitle(''); setContent('');
                  setCity(''); setCategory(''); setFile(null); setPreview(null);
                  setExistingCover(null);
                  if (editorRef.current) editorRef.current.innerHTML = '';
                }}
                style={{
                  padding: '0.72rem 1.5rem', borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Write Another
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const { words, mins } = stats(content);
  const overLimit = words > MAX_WORDS;
  const breadcrumb = title.trim() ? title.trim().toUpperCase() : 'UNTITLED POST';

  /* ── Toolbar button ──────────────────────────────── */
  const ToolBtn = ({ icon: Icon, cmd, val, title: ttl }) => (
    <button
      type="button"
      title={ttl}
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 7, border: 'none',
        background: 'transparent', color: 'var(--text-muted)',
        cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
        fontFamily: 'var(--font-serif)', fontWeight: 700,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F0F0EC'; e.currentTarget.style.color = '#2A483E'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {Icon ? <Icon style={{ fontSize: '0.95rem' }} /> : <span style={{ fontSize: '0.95rem' }}>{val || cmd}</span>}
    </button>
  );

  /* ── Field label ─────────────────────────────────── */
  const FieldLabel = ({ icon: Icon, text }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: 'var(--text-light)',
      marginBottom: '0.55rem',
    }}>
      {Icon && <Icon style={{ fontSize: '0.75rem' }} />}
      {text}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF6', paddingTop: 80 }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(2rem,5vw,3.5rem) clamp(1.25rem,5vw,2.5rem) 6rem' }}>

        {/* ── Breadcrumb ── */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--text-light)',
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          {isEditMode ? 'EDITING' : 'DRAFT'} <span style={{ color: 'var(--border)', fontSize: '0.9em' }}>•</span> {breadcrumb}
        </motion.p>

        {/* ── Edit mode banner ── */}
        {isEditMode && previousStatus === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              border: '1px solid #FCD34D',
              borderRadius: 12,
              padding: '0.85rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' }}>⚠️</span>
            <div>
              <p style={{
                fontWeight: 700, fontSize: '0.85rem', color: '#92400E',
                margin: '0 0 0.25rem', fontFamily: 'var(--font-sans)',
              }}>
                Editing a Published Post
              </p>
              <p style={{
                fontSize: '0.8rem', color: '#B45309', margin: 0,
                lineHeight: 1.55, fontFamily: 'var(--font-sans)',
              }}>
                Once you submit your edits, this post will revert to <strong>Pending</strong> status
                and will be hidden from the public Journal until the Admin re-approves it.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Title ── */}
        <div style={{ marginBottom: errors.title ? '0.5rem' : '2rem' }}>
          <input
            ref={titleRef}
            id="wb-title"
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })); }}
            placeholder="Post Title…"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700, color: title ? '#1A1A1A' : '#CBCAC5',
              lineHeight: 1.2, padding: 0,
              caretColor: '#3B5F54',
              boxSizing: 'border-box',
            }}
          />
          {errors.title && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.title}</p>
          )}
        </div>

        {/* ── Meta row: City + Category ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {/* City */}
          <div>
            <FieldLabel icon={FiMapPin} text="Place Visited (City)" />
            <input
              id="wb-city"
              type="text"
              value={city}
              onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: undefined })); }}
              placeholder="e.g. Jaipur, Coorg, Varanasi…"
              style={{
                width: '100%', padding: '0.72rem 1rem',
                border: `1.5px solid ${errors.city ? '#EF4444' : '#E4DFD8'}`,
                borderRadius: 10, outline: 'none',
                background: '#fff', color: '#2D2D2D',
                fontFamily: 'var(--font-sans)', fontSize: '0.92rem',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { if (!errors.city) e.target.style.borderColor = '#3B5F54'; }}
              onBlur={e => { if (!errors.city) e.target.style.borderColor = '#E4DFD8'; }}
            />
            {errors.city && (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.city}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <FieldLabel icon={FiTag} text="Category" />
            <div style={{ position: 'relative' }}>
              <select
                id="wb-category"
                value={category}
                onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: undefined })); }}
                style={{
                  width: '100%', padding: '0.72rem 2.5rem 0.72rem 1rem',
                  border: `1.5px solid ${errors.category ? '#EF4444' : '#E4DFD8'}`,
                  borderRadius: 10, outline: 'none', appearance: 'none',
                  background: '#fff', color: category ? '#2D2D2D' : '#9A9A9A',
                  fontFamily: 'var(--font-sans)', fontSize: '0.92rem',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                  cursor: 'pointer',
                }}
                onFocus={e => { if (!errors.category) e.target.style.borderColor = '#3B5F54'; }}
                onBlur={e => { if (!errors.category) e.target.style.borderColor = '#E4DFD8'; }}
              >
                <option value="" disabled>Select a category…</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {/* Custom chevron */}
              <svg style={{
                position: 'absolute', right: '0.85rem', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                color: '#9A9A9A',
              }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {errors.category && (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.category}</p>
            )}
          </div>
        </div>

        {/* ── Cover image upload zone (single image) ── */}
        <div style={{ marginBottom: '2rem' }}>
          <FieldLabel icon={FiCamera} text={isEditMode ? 'Cover Image (change optional)' : 'Cover Image (1 required)'} />
          <label
            htmlFor="wb-image"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: 280, borderRadius: 14,
              background: preview
                ? `linear-gradient(rgba(0,0,0,0.32),rgba(0,0,0,0.32)), url(${preview}) center/cover`
                : '#EDEAE6',
              cursor: 'pointer',
              transition: 'background 0.3s',
              border: errors.image ? '2px dashed #EF4444' : '2px dashed transparent',
              overflow: 'hidden',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!preview) e.currentTarget.style.background = '#E5E1DC'; }}
            onMouseLeave={e => { if (!preview) e.currentTarget.style.background = '#EDEAE6'; }}
          >
            {preview && (
              <button
                type="button"
                onClick={e => { e.preventDefault(); removeFile(); }}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(0,0,0,0.55)', border: 'none',
                  borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', zIndex: 2,
                }}
              >
                <FiX style={{ fontSize: '0.85rem' }} />
              </button>
            )}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: preview ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.85rem',
            }}>
              <FiCamera style={{ fontSize: '1.4rem', color: preview ? '#fff' : '#888' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.92rem',
              color: preview ? '#fff' : '#555', margin: '0 0 0.3rem',
            }}>
              {preview
                ? (existingCover ? 'Current cover — click × to change' : 'Cover image selected — click × to change')
                : 'Drag & drop or click to upload'}
            </p>
            <p style={{ fontSize: '0.76rem', color: preview ? 'rgba(255,255,255,0.7)' : '#888', margin: 0 }}>
              JPG, PNG or WEBP · Max 10 MB · Exactly 1 image
            </p>
          </label>
          <input
            ref={fileInput}
            id="wb-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => addFile(e.target.files)}
            disabled={loading}
          />
          {errors.image && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.4rem' }}>{errors.image}</p>
          )}
        </div>

        {/* ── Writing area: toolbar left + editor right ── */}
        <div>
          <FieldLabel text="Your Story" />
          <div style={{
            display: 'flex', gap: 0,
            border: errors.content ? '1.5px solid #EF4444' : '1.5px solid transparent',
            borderRadius: 12,
            minHeight: 280,
          }}>
            {/* Left toolbar */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.15rem', padding: '1rem 0.3rem',
              borderRight: '1.5px solid #EDEAE6',
              width: 44, flexShrink: 0,
            }}>
              <ToolBtn icon={FiItalic}      cmd="italic"      title="Italic (Ctrl+I)" />
              <ToolBtn icon={FiBoldText}    cmd="bold"        title="Bold (Ctrl+B)" />
              <div style={{ height: 1, width: 24, background: '#EDEAE6', margin: '0.4rem 0' }} />
              <ToolBtn icon={FiLink2}       cmd="createLink"  val={window.prompt ? 'https://' : '#'} title="Insert link" />
              <ToolBtn icon={PiQuotesFill}  cmd="formatBlock" val="blockquote" title="Blockquote" />
            </div>

            {/* Left accent bar + editor */}
            <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
              <div style={{
                width: 3, flexShrink: 0,
                background: 'linear-gradient(to bottom, #3B5F54, #2A483E)',
                borderRadius: '0 0 0 4px',
                margin: '1rem 0',
              }} />

              <div style={{ flex: 1, padding: '1rem 1.25rem', position: 'relative' }}>
                {/* Placeholder overlay */}
                {!content && (
                  <div style={{
                    position: 'absolute', top: '1rem', left: '1.25rem',
                    pointerEvents: 'none', userSelect: 'none',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-serif)', fontSize: '1.05rem',
                      color: '#C8C2BB', margin: 0, lineHeight: 1.7,
                    }}>
                      Start writing your story…
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                      fontSize: '0.9rem', color: '#D4CDBC', margin: '0.35rem 0 0',
                      lineHeight: 1.7,
                    }}>
                      Describe the sights, sounds, and moments that made this place special.
                    </p>
                  </div>
                )}

                {/* Contenteditable */}
                <div
                  ref={editorRef}
                  id="wb-content"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncContent}
                  onBlur={syncContent}
                  spellCheck
                  style={{
                    outline: 'none', minHeight: 220,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem', lineHeight: 1.8,
                    color: '#2D2D2D',
                    wordBreak: 'break-word',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Word counter bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.5rem', padding: '0.4rem 0',
          }}>
            {errors.content ? (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: 0 }}>{errors.content}</p>
            ) : <span />}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {/* Pill progress indicator */}
              <div style={{
                width: 80, height: 4, borderRadius: 999,
                background: '#EDEAE6', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (words / MAX_WORDS) * 100)}%`,
                  background: overLimit ? '#EF4444' : words > MAX_WORDS * 0.8 ? '#F59E0B' : '#3B5F54',
                  borderRadius: 999,
                  transition: 'width 0.2s, background 0.2s',
                }} />
              </div>
              <span style={{ color: overLimit ? '#EF4444' : 'var(--text-light)' }}>
                {words} / {MAX_WORDS} words
              </span>
            </div>
          </div>
        </div>

        {/* ── Submit row ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem' }}>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.82rem 1.5rem', borderRadius: 12,
                border: '1.5px solid var(--border, #E4DFD8)',
                background: 'transparent', color: 'var(--text-muted, #6B6B6B)',
                fontFamily: 'var(--font-sans)', fontWeight: 600,
                fontSize: '0.92rem', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F0EB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
          )}
          <button
            id="wb-submit"
            type="button"
            onClick={handleSubmit}
            disabled={loading || overLimit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.82rem 2rem', borderRadius: 12, border: 'none',
              background: isEditMode && previousStatus === 'accepted'
                ? 'linear-gradient(135deg,#D97706,#B45309)'
                : 'linear-gradient(135deg,#3B5F54,#2A483E)',
              color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: '0.92rem', cursor: (loading || overLimit) ? 'not-allowed' : 'pointer',
              boxShadow: (loading || overLimit) ? 'none'
                : isEditMode && previousStatus === 'accepted'
                  ? '0 8px 24px rgba(217,119,6,0.38)'
                  : '0 8px 24px rgba(59,95,84,0.38)',
              opacity: (loading || overLimit) ? 0.6 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { if (!loading && !overLimit) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <svg fill="none" viewBox="0 0 24 24" style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }}>
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            {loading
              ? 'Submitting…'
              : isEditMode && previousStatus === 'accepted'
                ? 'Submit Edits for Review'
                : isEditMode
                  ? 'Resubmit for Review'
                  : 'Submit for Review'
            }
          </button>
        </div>

        {/* ── Bottom stats bar ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '1.5rem',
          marginTop: '1.25rem',
          fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-light)',
        }}>
          <span>READING TIME <strong style={{ color: 'var(--text-muted)' }}>{mins} MIN</strong></span>
          <span>SAVED <strong style={{ color: 'var(--text-muted)' }}>JUST NOW</strong></span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        [contenteditable] blockquote {
          border-left: 3px solid #3B5F54;
          margin: 0.75em 0;
          padding: 0.25em 1em;
          color: #6B6B6B;
          font-style: italic;
        }
        [contenteditable]:focus { outline: none; }
        @media (max-width: 560px) {
          #wb-meta-grid { grid-template-columns: 1fr !important; }
        }
      `}
      </style>
    </div>
  );
}
