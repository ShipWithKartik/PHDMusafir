import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCamera, FiX, FiUploadCloud, FiRotateCcw, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSiteImages } from '../context/SiteImagesContext';
import { normaliseImageKey } from '../utils/siteImageKeys';
import { EMPTY_FILE_MSG, isEmptyFile } from '../utils/fileChecks';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

// Stop events inside the button/dialog from reaching parent links, cards or
// click handlers (React bubbles events through portals to their React parents).
const stop = (e) => { e.stopPropagation(); };
const stopAll = { onClick: stop, onMouseDown: stop, onPointerDown: stop, onDoubleClick: stop };

/* ── Dialog ─────────────────────────────────────────────── */
function ImageEditDialog({ title, currentSrc, onClose, onUpload, onReset, options, defaultOption }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [option, setOption] = useState(defaultOption ?? options?.[0]?.value);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Capture phase so Escape closes only this dialog (not e.g. a story modal behind it)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (!busy) onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [busy, onClose]);

  const pick = (f) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { toast.error('Only JPG, PNG and WEBP images are allowed.'); return; }
    if (isEmptyFile(f)) { toast.error(EMPTY_FILE_MSG, { duration: 8000 }); return; }
    if (f.size > MAX_BYTES) { toast.error('Image must be 10 MB or smaller.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!file) return;
    try {
      setBusy(true);
      await onUpload(file, option);
      toast.success('Image updated — visible to everyone now');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update image');
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Remove the custom image and go back to the default?')) return;
    try {
      setBusy(true);
      await onReset();
      toast.success('Image reset to default');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not reset image');
      setBusy(false);
    }
  };

  const shown = preview || currentSrc;

  return createPortal(
    <div {...stopAll}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => { if (!busy) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={stop}
          role="dialog" aria-modal="true" aria-label={title}
          style={{
            background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560,
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)', fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid #F0EAE3' }}>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9A9A', margin: 0 }}>
                Change image
              </p>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: '#2A483E', margin: '0.15rem 0 0' }}>
                {title}
              </h3>
            </div>
            <button type="button" onClick={() => !busy && onClose()} aria-label="Close" style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f4f4f4',
              color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><FiX /></button>
          </div>

          <div style={{ padding: '1.2rem 1.4rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Preview / drop zone */}
            <div
              onClick={() => !busy && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files[0]); }}
              style={{
                position: 'relative', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden',
                background: '#EDEAE6', cursor: busy ? 'wait' : 'pointer',
                border: `2px dashed ${dragOver ? '#3B5F54' : preview ? '#3B5F54' : 'transparent'}`,
              }}
            >
              {shown ? (
                <img src={shown} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: busy ? 0.5 : 1 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9A9A' }}>
                  <FiImage style={{ fontSize: '2rem' }} />
                </div>
              )}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '0.6rem 0.8rem', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <FiUploadCloud />
                {preview ? 'New image selected — click to choose another' : 'Current image — click or drop a file to replace'}
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#9A9A9A', margin: '-0.4rem 0 0' }}>
              JPG, PNG or WEBP · max 10 MB · the new image is shown to all visitors
            </p>

            {/* Scope options (e.g. this city only / all cities) */}
            {options?.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9A9A9A' }}>
                  Apply to
                </span>
                {options.map((o) => (
                  <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: '#333', cursor: 'pointer' }}>
                    <input type="radio" name="image-edit-scope" value={o.value} checked={option === o.value}
                      onChange={() => setOption(o.value)} disabled={busy} />
                    {o.label}
                  </label>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              {onReset && (
                <button type="button" onClick={reset} disabled={busy} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: 'none', border: 'none', color: '#DC2626', fontWeight: 600,
                  fontSize: '0.8rem', cursor: busy ? 'not-allowed' : 'pointer', padding: 0,
                }}>
                  <FiRotateCcw /> Reset to default
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={onClose} disabled={busy} style={{
                padding: '0.6rem 1.1rem', borderRadius: 10, border: '1.5px solid #E8E0D8',
                background: '#fff', color: '#666', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}>Cancel</button>
              <button type="button" onClick={save} disabled={!file || busy} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.3rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#3B5F54,#2A483E)', color: '#fff',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: !file || busy ? 'not-allowed' : 'pointer', opacity: !file || busy ? 0.55 : 1,
              }}>
                <FiUploadCloud /> {busy ? 'Saving…' : 'Set image'}
              </button>
            </div>
          </div>

          <input ref={inputRef} type="file" accept={ALLOWED.join(',')} style={{ display: 'none' }}
            onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} />
        </motion.div>
      </motion.div>
    </div>,
    document.body
  );
}

/**
 * Floating "Change image" button shown only to the admin (while image edit
 * mode is on). Place it inside a `position: relative` container that holds
 * the image.
 *
 * Props:
 *   title        — what this image is (shown in the dialog)
 *   currentSrc   — the image currently displayed (for the preview)
 *   onUpload     — async (file, option) => void   persists the new image
 *   onReset      — async () => void                optional, reverts to default
 *   options      — optional [{ value, label }] scope choices
 *   style        — overrides for the button's absolute position
 *   compact      — icon-only button for small images
 */
export default function ImageEditButton({
  title = 'Image', currentSrc, onUpload, onReset, options, defaultOption, style, compact = false,
}) {
  const { user } = useAuth();
  const { editMode } = useSiteImages();
  const [open, setOpen] = useState(false);

  if (user?.role !== 'admin' || !editMode || !onUpload) return null;

  return (
    <>
      <button
        type="button"
        title={`Change image — ${title}`}
        aria-label={`Change image: ${title}`}
        {...stopAll}
        onKeyDown={stop}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 30,
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          padding: compact ? '0.45rem' : '0.42rem 0.8rem',
          borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)',
          background: 'rgba(20,20,20,0.62)', color: '#fff',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
          letterSpacing: '0.02em', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          transition: 'background 0.2s, transform 0.2s',
          ...style,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(42,72,62,0.92)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,20,20,0.62)'; }}
      >
        <FiCamera style={{ fontSize: '0.85rem', flexShrink: 0 }} />
        {!compact && 'Change image'}
      </button>

      <AnimatePresence>
        {open && (
          <ImageEditDialog
            title={title}
            currentSrc={currentSrc}
            onClose={() => setOpen(false)}
            onUpload={onUpload}
            onReset={onReset}
            options={options}
            defaultOption={defaultOption}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Convenience wrapper for keyed site images (landing hero, journal hero,
 * city covers …) stored through SiteImagesContext.
 */
export function SiteImageEditButton({ imageKey, fallback, title, style, compact }) {
  const { images, setImage, resetImage } = useSiteImages();
  const key = normaliseImageKey(imageKey);
  const custom = images[key];
  return (
    <ImageEditButton
      title={title}
      currentSrc={custom || fallback}
      onUpload={(file) => setImage(key, file)}
      onReset={custom ? () => resetImage(key) : undefined}
      style={style}
      compact={compact}
    />
  );
}
