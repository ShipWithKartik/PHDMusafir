import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUploadCloud, FiMapPin, FiTag, FiX, FiItalic, FiImage,
  FiCheckCircle, FiAlertCircle, FiCamera, FiHash, FiLock, FiPenTool,
} from 'react-icons/fi';
import { PiQuotesFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { uploadStory, uploadStoryInlineImage } from '../services/storyService';
import { useAuth } from '../context/AuthContext';
import { serializeEditor, stripStoryImages, storyWordCount } from '../utils/storyContent';
import { EMPTY_FILE_MSG, isEmptyFile } from '../utils/fileChecks';

const CATEGORIES = [
  'Adventure', 'Architecture', 'Culture', 'Food', 'History',
  'Nature', 'Nightlife', 'Picnic', 'Road Trip', 'Shopping',
  'Spiritual', 'Wildlife',
];

const INITIAL_FORM = { title: '', description: '', placeVisited: '', category: '', tags: '' };

/* ── Inline Bold icon helper (same as the Post editor) ──── */
function FiBoldText(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

/* ── Field label ─────────────────────────────────────────── */
function FieldLabel({ icon: Icon, text }) {
  return (
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
}

/* ── Toolbar button ──────────────────────────────────────── */
function ToolBtn({ icon: Icon, title, onAction, busy }) {
  return (
    <button
      type="button"
      title={title}
      disabled={busy}
      onMouseDown={e => { e.preventDefault(); if (!busy) onAction(); }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 7, border: 'none',
        background: 'transparent', color: 'var(--text-muted)',
        cursor: busy ? 'wait' : 'pointer', transition: 'background 0.15s, color 0.15s',
        fontFamily: 'var(--font-serif)', fontWeight: 700,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F0F0EC'; e.currentTarget.style.color = '#2A483E'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {busy
        ? <svg fill="none" viewBox="0 0 24 24" style={{ width: 15, height: 15, animation: 'spin 0.8s linear infinite' }}>
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        : <Icon style={{ fontSize: '0.95rem' }} />}
    </button>
  );
}

/* ── Shown to non-admins who reach /upload ──────────────── */
function AdminOnlyNotice() {
  return (
    <div style={{
      minHeight: '100vh', paddingTop: 80, background: '#FDFAF6',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#fff', borderRadius: 20, padding: '2.75rem 2.25rem',
          maxWidth: 460, width: '100%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.10)',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1.25rem',
          background: 'rgba(59,95,84,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiLock style={{ fontSize: '1.4rem', color: '#3B5F54' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: '#2A483E', marginBottom: '0.75rem' }}>
          Stories are published by our editors
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.75rem' }}>
          Only the PHDMusafir admin can publish stories. You can still share your
          travel experience by writing a Post for the Journal.
        </p>
        <Link
          to="/write-blog"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.72rem 1.5rem', borderRadius: 12,
            background: 'linear-gradient(135deg,#3B5F54,#2A483E)', color: '#fff',
            fontFamily: 'var(--font-sans)', fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(59,95,84,0.35)',
          }}
        >
          <FiPenTool /> Write a Post
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function UploadStory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef   = useRef(null);   // cover image
  const inlineInputRef = useRef(null);   // photos inside the story text
  const editorRef      = useRef(null);   // contenteditable writing area
  const savedRange     = useRef(null);   // caret position to insert photos at

  const [form, setForm]           = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [progress, setProgress]   = useState(0);
  const [status, setStatus]       = useState('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [errors, setErrors]       = useState({});
  const [dragOver, setDragOver]   = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  /* Sync contenteditable → form.description (text + inline photo tokens) */
  const syncDescription = useCallback(() => {
    const text = serializeEditor(editorRef.current);
    setForm(prev => ({ ...prev, description: text }));
    setErrors(p => ({ ...p, description: undefined }));
  }, []);

  /* Remember the caret so a photo can be inserted where the writer was */
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  /* Rich-text exec — called from onMouseDown so selection is still alive */
  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val ?? null);
    syncDescription();
  };

  /* Paste as plain text so foreign markup / images don't sneak in */
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  /* ── Inline photos ── */
  const insertInlineImage = (url) => {
    const editor = editorRef.current;
    if (!editor) return;

    const figure = document.createElement('figure');
    figure.setAttribute('contenteditable', 'false');
    figure.className = 'story-inline-figure';
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.setAttribute('data-inline-url', url);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'story-inline-remove';
    removeBtn.title = 'Remove photo';
    removeBtn.setAttribute('data-remove-inline', '1');
    removeBtn.textContent = '×';
    figure.append(img, removeBtn);

    // Empty line after the photo so the writer can keep typing
    const after = document.createElement('div');
    after.appendChild(document.createElement('br'));

    // Insert after the paragraph that holds the caret (or at the end)
    const range = savedRange.current;
    if (range && editor.contains(range.startContainer)) {
      if (range.startContainer === editor) {
        editor.insertBefore(figure, editor.childNodes[range.startOffset] || null);
      } else {
        let block = range.startContainer;
        while (block.parentNode && block.parentNode !== editor) block = block.parentNode;
        block.after(figure);
      }
    } else {
      editor.appendChild(figure);
    }
    figure.after(after);

    // Move the caret onto the new empty line
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(after, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    savedRange.current = r.cloneRange();
    syncDescription();
  };

  const handleInlineFile = async (file) => {
    if (inlineInputRef.current) inlineInputRef.current.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP photos are allowed.');
      return;
    }
    if (isEmptyFile(file)) {
      toast.error(EMPTY_FILE_MSG, { duration: 8000 });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photos must be 10 MB or smaller.');
      return;
    }
    try {
      setInlineUploading(true);
      const { url } = await uploadStoryInlineImage(file);
      insertInlineImage(url);
      toast.success('Photo added to your story');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not upload photo.');
    } finally {
      setInlineUploading(false);
    }
  };

  const handleEditorClick = (e) => {
    const btn = e.target.closest?.('[data-remove-inline]');
    if (btn) {
      e.preventDefault();
      btn.closest('figure')?.remove();
      syncDescription();
    }
  };

  /* ── Cover image ── */
  const applyFile = (file) => {
    if (fileInputRef.current) fileInputRef.current.value = ''; // allow re-picking the same file
    if (!file || !file.type.startsWith('image/')) return;
    if (isEmptyFile(file)) {
      toast.error(EMPTY_FILE_MSG, { duration: 8000 });
      setErrors(p => ({ ...p, image: 'The selected image is empty (0 bytes) — please choose it again.' }));
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors(p => ({ ...p, image: undefined }));
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

  /* ── Validate + submit ── */
  const handleSubmit = async () => {
    setErrorMsg('');
    const errs = {};
    if (!form.title.trim())        errs.title = 'Title is required.';
    if (!form.placeVisited.trim()) errs.placeVisited = 'Place visited is required.';
    if (!form.category)            errs.category = 'Please select a category.';
    if (!stripStoryImages(form.description)) errs.description = 'Write something first.';
    if (!imageFile)                errs.image = 'A cover image is required.';
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Please fix the highlighted fields.'); return; }

    const formData = new FormData();
    formData.append('title',        form.title.trim());
    formData.append('description',  form.description.trim());
    formData.append('placeVisited', form.placeVisited.trim());
    formData.append('category',     form.category);
    formData.append('tags',         form.tags.trim());
    formData.append('image',        imageFile);

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

  /* Only the admin can publish stories */
  if (user?.role !== 'admin') return <AdminOnlyNotice />;

  const isUploading = status === 'uploading';
  const isSuccess   = status === 'success';

  /* ── Live stats ── */
  const wordCount  = storyWordCount(form.description);
  const readMins   = Math.max(1, Math.round(wordCount / 200));
  const photoCount = (form.description.match(/!\[[^\]]*\]\(/g) || []).length;
  const breadcrumb = form.title.trim() ? form.title.trim().toUpperCase() : 'UNTITLED STORY';

  const inputBox = (hasError) => ({
    width: '100%', padding: '0.72rem 1rem',
    border: `1.5px solid ${hasError ? '#EF4444' : '#E4DFD8'}`,
    borderRadius: 10, outline: 'none',
    background: '#fff', color: '#2D2D2D',
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
    opacity: isUploading ? 0.6 : 1,
  });
  const errText = (msg) => msg && (
    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{msg}</p>
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
          NEW STORY <span style={{ color: 'var(--border)', fontSize: '0.9em' }}>•</span> {breadcrumb}
        </motion.p>

        {/* ── Title ── */}
        <div style={{ marginBottom: errors.title ? '0.5rem' : '2rem' }}>
          <input
            id="us-title"
            type="text"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            disabled={isUploading}
            maxLength={150}
            placeholder="Story Title…"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700, color: form.title ? '#1A1A1A' : '#CBCAC5',
              lineHeight: 1.2, padding: 0,
              caretColor: '#3B5F54',
              boxSizing: 'border-box',
              opacity: isUploading ? 0.6 : 1,
            }}
          />
          {errText(errors.title)}
        </div>

        {/* ── Meta row: Place + Category ── */}
        <div id="us-meta-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {/* Place */}
          <div>
            <FieldLabel icon={FiMapPin} text="Place Visited (City)" />
            <input
              id="us-place"
              type="text"
              value={form.placeVisited}
              onChange={e => setField('placeVisited', e.target.value)}
              disabled={isUploading}
              placeholder="e.g. Jaipur, Coorg, Varanasi…"
              style={inputBox(errors.placeVisited)}
              onFocus={e => { if (!errors.placeVisited) e.target.style.borderColor = '#3B5F54'; }}
              onBlur={e => { if (!errors.placeVisited) e.target.style.borderColor = '#E4DFD8'; }}
            />
            {errText(errors.placeVisited)}
          </div>

          {/* Category */}
          <div>
            <FieldLabel icon={FiTag} text="Category" />
            <div style={{ position: 'relative' }}>
              <select
                id="us-category"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                disabled={isUploading}
                style={{
                  ...inputBox(errors.category),
                  padding: '0.72rem 2.5rem 0.72rem 1rem',
                  appearance: 'none', cursor: 'pointer',
                  color: form.category ? '#2D2D2D' : '#9A9A9A',
                }}
                onFocus={e => { if (!errors.category) e.target.style.borderColor = '#3B5F54'; }}
                onBlur={e => { if (!errors.category) e.target.style.borderColor = '#E4DFD8'; }}
              >
                <option value="" disabled>Select a category…</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <svg style={{
                position: 'absolute', right: '0.85rem', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                color: '#9A9A9A',
              }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {errText(errors.category)}
          </div>
        </div>

        {/* ── Cover image upload zone ── */}
        <div style={{ marginBottom: '2rem' }}>
          <FieldLabel icon={FiCamera} text="Cover Image (1 required)" />
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: 280, borderRadius: 14,
              background: preview
                ? `linear-gradient(rgba(0,0,0,0.32),rgba(0,0,0,0.32)), url(${preview}) center/cover`
                : dragOver ? '#E5E1DC' : '#EDEAE6',
              cursor: 'pointer',
              transition: 'background 0.3s',
              border: errors.image ? '2px dashed #EF4444' : dragOver ? '2px dashed #3B5F54' : '2px dashed transparent',
              overflow: 'hidden',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!preview) e.currentTarget.style.background = '#E5E1DC'; }}
            onMouseLeave={e => { if (!preview) e.currentTarget.style.background = '#EDEAE6'; }}
          >
            {preview && !isUploading && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
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
                ? 'Cover image selected — click × to change'
                : dragOver ? 'Drop it here!' : 'Drag & drop or click to upload'}
            </p>
            <p style={{ fontSize: '0.76rem', color: preview ? 'rgba(255,255,255,0.7)' : '#888', margin: 0 }}>
              JPG, PNG or WEBP · Max 10 MB · Exactly 1 image
            </p>
          </div>
          {errText(errors.image)}
        </div>

        {/* ── Writing area: toolbar left + editor right ── */}
        <div>
          <FieldLabel text="Your Story" />
          <div style={{
            display: 'flex', gap: 0,
            border: errors.description ? '1.5px solid #EF4444' : '1.5px solid transparent',
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
              <ToolBtn icon={FiItalic}     title="Italic (Ctrl+I)" onAction={() => exec('italic')} />
              <ToolBtn icon={FiBoldText}   title="Bold (Ctrl+B)"   onAction={() => exec('bold')} />
              <div style={{ height: 1, width: 24, background: '#EDEAE6', margin: '0.4rem 0' }} />
              <ToolBtn icon={PiQuotesFill} title="Blockquote"      onAction={() => exec('formatBlock', 'blockquote')} />
              <div style={{ height: 1, width: 24, background: '#EDEAE6', margin: '0.4rem 0' }} />
              <ToolBtn
                icon={FiImage}
                title="Insert photo at cursor"
                busy={inlineUploading}
                onAction={() => { saveSelection(); inlineInputRef.current?.click(); }}
              />
            </div>

            {/* Left accent bar + editor */}
            <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
              <div style={{
                width: 3, flexShrink: 0,
                background: 'linear-gradient(to bottom, #3B5F54, #2A483E)',
                borderRadius: '0 0 0 4px',
                margin: '1rem 0',
              }} />

              <div style={{ flex: 1, padding: '1rem 1.25rem', position: 'relative', minWidth: 0 }}>
                {/* Placeholder overlay */}
                {!form.description && (
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
                      Use the photo button on the left to add pictures between paragraphs.
                    </p>
                  </div>
                )}

                {/* Contenteditable */}
                <div
                  ref={editorRef}
                  id="us-content"
                  className="story-editor"
                  contentEditable={!isUploading}
                  suppressContentEditableWarning
                  onInput={() => { syncDescription(); saveSelection(); }}
                  onBlur={() => { syncDescription(); saveSelection(); }}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  onPaste={handlePaste}
                  onClick={handleEditorClick}
                  spellCheck
                  style={{
                    outline: 'none', minHeight: 220,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem', lineHeight: 1.8,
                    color: '#2D2D2D',
                    wordBreak: 'break-word',
                    opacity: isUploading ? 0.6 : 1,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Counter bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.5rem', padding: '0.4rem 0',
          }}>
            {errors.description ? (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: 0 }}>{errors.description}</p>
            ) : <span />}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.9rem',
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-light)',
            }}>
              <span>{wordCount} words</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiImage style={{ fontSize: '0.8rem' }} /> {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tags ── */}
        <div style={{ marginTop: '1.5rem' }}>
          <FieldLabel icon={FiHash} text="Tags (optional, comma-separated)" />
          <input
            id="us-tags"
            type="text"
            value={form.tags}
            onChange={e => setField('tags', e.target.value)}
            disabled={isUploading}
            placeholder="sunset, mountains, solo-travel…"
            style={inputBox(false)}
            onFocus={e => { e.target.style.borderColor = '#3B5F54'; }}
            onBlur={e => { e.target.style.borderColor = '#E4DFD8'; }}
          />
        </div>

        {/* ── Progress ── */}
        {isUploading && (
          <div style={{ marginTop: '2rem' }}>
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
            marginTop: '2rem',
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
            marginTop: '2rem',
          }}>
            <FiCheckCircle style={{ flexShrink: 0 }} /> Story uploaded! Redirecting…
          </div>
        )}

        {/* ── Submit row ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem' }}>
          <button
            id="us-submit"
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || isSuccess || inlineUploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.82rem 2rem', borderRadius: 12, border: 'none',
              background: isSuccess
                ? 'linear-gradient(135deg,#16A34A,#15803D)'
                : 'linear-gradient(135deg,#3B5F54,#2A483E)',
              color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700,
              fontSize: '0.92rem',
              cursor: (isUploading || isSuccess || inlineUploading) ? 'not-allowed' : 'pointer',
              boxShadow: (isUploading || isSuccess) ? 'none' : '0 8px 24px rgba(59,95,84,0.38)',
              opacity: (isUploading || inlineUploading) ? 0.6 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { if (!isUploading && !isSuccess) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isUploading ? (
              <svg fill="none" viewBox="0 0 24 24" style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }}>
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : isSuccess ? <FiCheckCircle /> : <FiUploadCloud />}
            {isUploading ? 'Publishing…' : isSuccess ? 'Published!' : 'Publish Story'}
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
          <span>READING TIME <strong style={{ color: 'var(--text-muted)' }}>{readMins} MIN</strong></span>
          <span>PHOTOS <strong style={{ color: 'var(--text-muted)' }}>{photoCount}</strong></span>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => applyFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <input
        ref={inlineInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleInlineFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .story-editor blockquote {
          border-left: 3px solid #3B5F54;
          margin: 0.75em 0;
          padding: 0.25em 1em;
          color: #6B6B6B;
          font-style: italic;
        }
        .story-editor:focus { outline: none; }
        .story-editor .story-inline-figure {
          position: relative;
          margin: 1.1em 0;
          border-radius: 10px;
          overflow: hidden;
          user-select: none;
        }
        .story-editor .story-inline-figure img {
          display: block;
          width: 100%;
          max-height: 460px;
          object-fit: cover;
        }
        .story-editor .story-inline-remove {
          position: absolute; top: 10px; right: 10px;
          width: 28px; height: 28px; border-radius: 50%;
          border: none; cursor: pointer;
          background: rgba(0,0,0,0.6); color: #fff;
          font-size: 1rem; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .story-editor .story-inline-figure:hover .story-inline-remove { opacity: 1; }
        @media (hover: none) {
          .story-editor .story-inline-remove { opacity: 0.85; }
        }
        @media (max-width: 560px) {
          #us-meta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
