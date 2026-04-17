import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUploadCloud, FiMapPin, FiTag, FiX,
  FiCheckCircle, FiAlertCircle, FiCamera,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadStory } from '../services/storyService';

const CATEGORIES = [
  'Adventure', 'Architecture', 'Culture', 'Food', 'History',
  'Nature', 'Nightlife', 'Picnic', 'Road Trip', 'Shopping',
  'Spiritual', 'Wildlife',
];

const INITIAL_FORM = { title: '', description: '', placeVisited: '', category: '', tags: '' };

/* ─── Main Page ──────────────────────────────────────────── */
export default function UploadStory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const descRef = useRef(null);       // contenteditable writing area

  const [form, setForm]         = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]   = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus]     = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* Sync contenteditable innerText → form.description */
  const handleDescInput = () => {
    const text = descRef.current?.innerText || '';
    setForm(prev => ({ ...prev, description: text }));
  };

  /* Rich-text exec — called from onMouseDown so selection is still alive */
  const execDesc = (cmd) => {
    document.execCommand(cmd, false, null);
  };

  const applyFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!imageFile) {
      const msg = 'Please select an image before uploading.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const formData = new FormData();
    formData.append('title',       form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('placeVisited',form.placeVisited.trim());
    formData.append('category',    form.category);
    formData.append('tags',        form.tags.trim());
    formData.append('image',       imageFile);

    try {
      setStatus('uploading');
      setProgress(0);
      await uploadStory(formData, setProgress);
      setStatus('success');
      toast.success('Story published successfully!');
      setTimeout(() => navigate('/'), 2200);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
      setStatus('error');
    }
  };

  const isUploading = status === 'uploading';
  const isSuccess   = status === 'success';

  /* ── Live stats ── */
  const wordCount = form.description.trim() ? form.description.trim().split(/\s+/).length : 0;
  const readMins  = Math.max(1, Math.round(wordCount / 200));

  /* ── Shared micro-styles ── */
  const toolBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 8, border: 'none',
    background: 'transparent', cursor: 'pointer',
  };
  const statLabel = {
    fontSize: '0.62rem', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: '#AEAAA5', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    fontFamily: 'var(--font-sans)',
  };
  const statDot = {
    display: 'inline-block', width: 4, height: 4,
    borderRadius: '50%', background: '#C8C2BB', flexShrink: 0,
  };

  return (
    <>
      {/* ── Outer shell ── */}
      <div style={{
        minHeight: '100vh',
        background: '#F8F6F2',
        paddingTop: 80,
        paddingBottom: 64,     /* room for sticky bar */
        position: 'relative',
      }}>

        {/* ── Right-edge rotated draft label ── */}
        <div style={{
          position: 'fixed',
          right: -50,
          top: '50%',
          transform: 'rotate(90deg) translateX(-50%)',
          transformOrigin: 'right center',
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#C8C2BB',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 5,
          userSelect: 'none',
        }}>
          DRAFT SESSION ACTIVE&nbsp;&nbsp;•&nbsp;&nbsp;LIVE SYNC
        </div>

        {/* ── Editor canvas ── */}
        <div style={{
          maxWidth: 740,
          margin: '0 auto',
          padding: 'clamp(2rem,5vw,3.5rem) clamp(1.25rem,5vw,2rem)',
        }}>
          <form onSubmit={handleSubmit}>

            {/* ①  TITLE ─────────────────────────────────────── */}
            <div style={{ marginBottom: '1.75rem' }}>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                disabled={isUploading}
                required
                maxLength={150}
                placeholder="Story Title..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem,5vw,2.85rem)',
                  fontWeight: 700,
                  color: form.title ? '#1A1A1A' : '#CECCCA',
                  lineHeight: 1.15,
                  padding: 0,
                  caretColor: '#3B5F54',
                  boxSizing: 'border-box',
                  opacity: isUploading ? 0.6 : 1,
                }}
              />
            </div>

            {/* ②  LOCATION + CATEGORY ROW ──────────────────── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}>
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 160 }}>
                <FiMapPin style={{ color: '#9A9A9A', fontSize: '1rem', flexShrink: 0 }} />
                <input
                  id="placeVisited"
                  name="placeVisited"
                  type="text"
                  value={form.placeVisited}
                  onChange={handleChange}
                  disabled={isUploading}
                  required
                  placeholder="Where did you go?"
                  style={{
                    border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    color: form.placeVisited ? '#3A3A3A' : '#AEAAA5',
                    padding: 0, width: '100%',
                    caretColor: '#3B5F54',
                    opacity: isUploading ? 0.6 : 1,
                  }}
                />
              </div>

              {/* Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <FiTag style={{ color: '#9A9A9A', fontSize: '0.95rem', flexShrink: 0 }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={isUploading}
                    required
                    style={{
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      color: form.category ? '#3A3A3A' : '#AEAAA5',
                      appearance: 'none',
                      cursor: 'pointer',
                      paddingRight: '1.2rem',
                      opacity: isUploading ? 0.6 : 1,
                    }}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 0, pointerEvents: 'none', color: '#9A9A9A', fontSize: '0.75rem' }}>∨</span>
                </div>
              </div>
            </div>

            {/* ③  IMAGE UPLOAD ZONE ──────────────────────────── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div
                onClick={() => !preview && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  position: 'relative',
                  height: preview ? 'auto' : 300,
                  borderRadius: 12,
                  border: `1.5px dashed ${dragOver ? '#3B5F54' : preview ? '#E0D9D0' : '#C8C2BB'}`,
                  background: dragOver
                    ? 'rgba(59,95,84,0.04)'
                    : preview ? 'transparent' : '#EDEAE6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: preview ? 'default' : 'pointer',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {preview ? (
                  /* Filled */
                  <div style={{ width: '100%', position: 'relative' }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block', borderRadius: 10 }}
                    />
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s', borderRadius: 10,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.36)';
                        e.currentTarget.querySelector('button').style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0)';
                        e.currentTarget.querySelector('button').style.opacity = '0';
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          background: '#fff', color: '#2A483E',
                          border: 'none', padding: '0.5rem 1.1rem',
                          borderRadius: 999, fontWeight: 700, fontSize: '0.82rem',
                          cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                      >
                        <FiX /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty drop zone */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: dragOver ? 'rgba(59,95,84,0.12)' : 'rgba(0,0,0,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiCamera style={{ fontSize: '1.35rem', color: dragOver ? '#3B5F54' : '#888' }} />
                    </div>
                    <p style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#9A9A9A', margin: 0,
                    }}>
                      {dragOver ? 'Drop it here!' : 'Upload Feature Image'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#AEAAA5', margin: 0 }}>
                      JPG, PNG or WEBP · max 10 MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ④  FLOATING RICH-TEXT TOOLBAR ─────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.1rem',
                background: '#fff',
                borderRadius: 999,
                padding: '0.5rem 1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                border: '1px solid #EDE8E2',
              }}>
                {/* B */}
                <button type="button" title="Bold" style={toolBtn}
                  onMouseDown={e => { e.preventDefault(); execDesc('bold'); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: '#5A5550' }}>B</span>
                </button>
                {/* I */}
                <button type="button" title="Italic" style={toolBtn}
                  onMouseDown={e => { e.preventDefault(); execDesc('italic'); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: '#5A5550' }}>I</span>
                </button>
                {/* Divider */}
                <div style={{ width: 1, height: 18, background: '#EDE8E2', margin: '0 0.25rem' }} />
                {/* + add block */}
                <button type="button" title="Add block" style={toolBtn}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '1.15rem', color: '#5A5550', lineHeight: 1 }}>+</span>
                </button>
                {/* image icon — also triggers file picker */}
                <button type="button" title="Insert image"
                  onClick={() => fileInputRef.current?.click()}
                  style={toolBtn}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5550" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </button>
                {/* film icon */}
                <button type="button" title="Insert video" style={toolBtn}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5550" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M10 9l5 3-5 3V9z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ⑤  WRITING AREA (description — contenteditable for rich text) ── */}
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              {/* Placeholder overlay — shown when empty */}
              {!form.description && (
                <p style={{
                  position: 'absolute', top: 0, left: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem', lineHeight: 1.85,
                  color: '#C8C2BB', pointerEvents: 'none',
                  margin: 0, userSelect: 'none',
                }}>
                  Start writing your story...
                </p>
              )}
              <div
                ref={descRef}
                contentEditable={!isUploading}
                suppressContentEditableWarning
                onInput={handleDescInput}
                onBlur={handleDescInput}
                spellCheck
                style={{
                  minHeight: '14rem',
                  outline: 'none',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  lineHeight: 1.85,
                  color: '#2D2D2D',
                  caretColor: '#3B5F54',
                  wordBreak: 'break-word',
                  opacity: isUploading ? 0.6 : 1,
                }}
              />
            </div>

            {/* ⑥  TAGS (minimal) ─────────────────────────────── */}
            <div style={{ marginBottom: '1.75rem' }}>
              <input
                id="tags"
                name="tags"
                type="text"
                value={form.tags}
                onChange={handleChange}
                disabled={isUploading}
                placeholder="Tags: sunset, mountains, solo-travel…"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  borderBottom: '1px solid #EDE8E2',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  color: '#7A7470',
                  padding: '0.5rem 0',
                  boxSizing: 'border-box',
                  opacity: isUploading ? 0.6 : 1,
                }}
              />
            </div>

            {/* ── Progress ── */}
            {isUploading && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 500 }}>Uploading to Cloudinary…</span>
                  <span style={{ fontSize: '0.72rem', color: '#3B5F54', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 3, background: '#EDE8E2', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg,#3B5F54,#527A6D)',
                    borderRadius: 99, transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            {/* ── Error ── */}
            {status === 'error' && errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 10, padding: '0.7rem 1rem',
                color: '#DC2626', fontSize: '0.83rem',
                marginBottom: '1.25rem',
              }}>
                <FiAlertCircle style={{ flexShrink: 0 }} /> {errorMsg}
              </div>
            )}

            {/* ── Success ── */}
            {isSuccess && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 10, padding: '0.7rem 1rem',
                color: '#16A34A', fontSize: '0.83rem',
                marginBottom: '1.25rem',
              }}>
                <FiCheckCircle style={{ flexShrink: 0 }} /> Story uploaded! Redirecting…
              </div>
            )}

            {/* ── Submit ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isUploading || isSuccess}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.82rem 2rem', borderRadius: 12, border: 'none',
                  background: isSuccess
                    ? 'linear-gradient(135deg,#16A34A,#15803D)'
                    : 'linear-gradient(135deg,#3B5F54,#2A483E)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.92rem',
                  cursor: isUploading || isSuccess ? 'not-allowed' : 'pointer',
                  boxShadow: isUploading || isSuccess ? 'none' : '0 8px 24px rgba(59,95,84,0.36)',
                  opacity: isUploading ? 0.75 : 1,
                  transition: 'all 0.22s ease',
                }}
                onMouseEnter={(e) => { if (!isUploading && !isSuccess) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isUploading ? (
                  <>
                    <svg style={{ animation: 'spin 0.8s linear infinite', height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading…
                  </>
                ) : isSuccess
                  ? <><FiCheckCircle /> Uploaded!</>
                  : <><FiUploadCloud /> Publish Story</>
                }
              </button>
            </div>

          </form>
        </div>

        {/* ⑦  PINNED BOTTOM STATUS BAR ─────────────────────── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          background: 'rgba(248,246,242,0.95)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid #EDE8E2',
          height: 44,
          display: 'flex', alignItems: 'center',
          padding: '0 clamp(1.25rem,5vw,3rem)',
          justifyContent: 'space-between',
        }}>
          {/* Left: word count + read time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={statLabel}>
              <span style={statDot} /> {wordCount} WORDS
            </span>
            <span style={statLabel}>
              <span style={statDot} /> {readMins} MIN READ
            </span>
          </div>
          {/* Right: cloud saved */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiUploadCloud style={{ fontSize: '0.78rem', color: '#AEAAA5' }} />
            <span style={statLabel}>AUTO-SAVED TO CLOUD</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder  { color: #C8C2BB; }
        input[type="text"]::placeholder { color: #C8C2BB; }
      `}</style>

      {/* Hidden file input — logic completely unchanged */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => applyFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </>
  );
}
