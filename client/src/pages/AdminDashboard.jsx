import { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiCheck, FiX, FiTrash2, FiEdit2, FiEye, FiClock,
  FiBookOpen, FiShield, FiAlertTriangle, FiChevronDown, FiSearch,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─── Helpers ────────────────────────────────────────────── */
const excerpt = (t = '', n = 120) => (t.length <= n ? t : t.slice(0, n).trimEnd() + '…');
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ─── Pill badge ─────────────────────────────────────────── */
function Badge({ count, color = '#3B5F54' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 999,
      background: color, color: '#fff',
      fontSize: '0.7rem', fontWeight: 700,
      padding: '0 6px',
    }}>
      {count}
    </span>
  );
}

/* ─── Btn helper ─────────────────────────────────────────── */
function Btn({ onClick, color = '#3B5F54', bg, icon: Icon, children, small, disabled }) {
  const baseColor = bg || `${color}14`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: small ? '0.38rem 0.75rem' : '0.5rem 1rem',
        borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: baseColor, color,
        fontSize: small ? '0.75rem' : '0.82rem', fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, filter 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.92)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
    >
      {Icon && <Icon style={{ fontSize: small ? '0.8rem' : '0.9rem', flexShrink: 0 }} />}
      {children}
    </button>
  );
}

/* ─── Overlay backdrop ───────────────────────────────────── */
function Overlay({ children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 18, width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.20)',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Preview modal ──────────────────────────────────────── */
function PreviewModal({ blog, onClose }) {
  if (!blog) return null;
  const cover = blog.images?.[0]?.url;
  return (
    <Overlay onClose={onClose}>
      <div>
        {cover && (
          <img src={cover} alt={blog.title} style={{
            width: '100%', height: 260, objectFit: 'cover',
            borderRadius: '18px 18px 0 0', display: 'block',
          }} />
        )}
        <div style={{ padding: '1.75rem 2rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#9A9A9A',
              }}>{blog.author?.name} · {fmtDate(blog.createdAt)}</span>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.55rem',
                fontWeight: 700, color: '#2A483E', marginTop: '0.5rem', lineHeight: 1.2,
              }}>{blog.title}</h2>
            </div>
            <button onClick={onClose} style={{
              flexShrink: 0, background: '#f4f4f4', border: 'none',
              borderRadius: '50%', width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#666',
            }}><FiX /></button>
          </div>
          {blog.adminNote && (
            <div style={{
              background: '#FFF7ED', border: '1px solid #FED7AA',
              borderRadius: 10, padding: '0.75rem 1rem',
              fontSize: '0.82rem', color: '#92400E', marginBottom: '1rem',
            }}>
              <strong>Admin note:</strong> {blog.adminNote}
            </div>
          )}
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: '1rem',
            lineHeight: 1.85, color: '#3A3A3A', whiteSpace: 'pre-wrap',
            maxHeight: 340, overflowY: 'auto',
            borderTop: '1px solid #F0EDE8', paddingTop: '1rem',
          }}>
            {blog.content}
          </div>
          {blog.images?.length > 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(blog.images.length - 1, 3)}, 1fr)`,
              gap: '0.5rem', marginTop: '1.25rem',
            }}>
              {blog.images.slice(1).map((img, i) => (
                <img key={i} src={img.url} alt="" style={{
                  width: '100%', aspectRatio: '4/3',
                  objectFit: 'cover', borderRadius: 10,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Reject modal ───────────────────────────────────────── */
function RejectModal({ blog, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('');
  if (!blog) return null;
  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#2A483E' }}>
            Reject Blog
          </h3>
          <button onClick={onClose} style={{
            background: '#f4f4f4', border: 'none', borderRadius: '50%',
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#666',
          }}><FiX /></button>
        </div>

        <div style={{ background: '#F8F4EF', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 700, color: '#2A483E', marginBottom: '0.15rem', fontSize: '0.9rem' }}>{blog.title}</p>
          <p style={{ fontSize: '0.78rem', color: '#888' }}>by {blog.author?.name}</p>
        </div>

        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#666', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Rejection reason (optional — shown to author)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Content needs more detail in the second section…"
          rows={4}
          style={{
            width: '100%', padding: '0.75rem', border: '1.5px solid #E8E0D8',
            borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            lineHeight: 1.6, color: '#333',
          }}
          onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
          onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Btn onClick={onClose} color="#666" bg="#f4f4f4">Cancel</Btn>
          <Btn onClick={() => onConfirm(note)} color="#DC2626" bg="#FEE2E2" icon={FiX} disabled={loading}>
            {loading ? 'Rejecting…' : 'Reject Blog'}
          </Btn>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Delete confirm modal ───────────────────────────────── */
function DeleteModal({ blog, onClose, onConfirm, loading }) {
  if (!blog) return null;
  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <FiAlertTriangle style={{ fontSize: '1.4rem', color: '#DC2626' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#2A483E', marginBottom: '0.5rem' }}>
          Delete this blog?
        </h3>
        <p style={{ color: '#888', fontSize: '0.88rem', maxWidth: 340, margin: '0 auto 0.5rem' }}>
          <strong style={{ color: '#333' }}>"{blog.title}"</strong> will be removed from the public journal.
          This action soft-deletes the record.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'center' }}>
          <Btn onClick={onClose} color="#666" bg="#f4f4f4">Cancel</Btn>
          <Btn onClick={onConfirm} color="#DC2626" bg="#FEE2E2" icon={FiTrash2} disabled={loading}>
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </Btn>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Edit & Accept modal ────────────────────────────────── */
function EditModal({ blog, onClose, onConfirm, loading }) {
  const [title,    setTitle]    = useState(blog?.title    || '');
  const [content,  setContent]  = useState(blog?.content  || '');
  const [city,     setCity]     = useState(blog?.city     || '');
  const [category, setCategory] = useState(blog?.category || '');
  const [note,     setNote]     = useState('');

  if (!blog) return null;

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid #E8E0D8', borderRadius: 10,
    fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', color: '#333',
    transition: 'border-color 0.2s',
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#2A483E' }}>
            Edit & Accept
          </h3>
          <button onClick={onClose} style={{
            background: '#f4f4f4', border: 'none', borderRadius: '50%',
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#666',
          }}><FiX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Title</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>City</label>
              <input
                value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="Place visited…"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
                onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Category</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
                  onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
                >
                  <option value="">Select…</option>
                  {['Picnic','Party','Family','Nature','Adventure','Culture','Food','Heritage','Spiritual','Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg style={{ position:'absolute',right:'0.7rem',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9A9A9A' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Content</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              rows={9}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Editor note (optional)
            </label>
            <input
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note for this edit…"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
          <Btn onClick={onClose} color="#666" bg="#f4f4f4">Cancel</Btn>
          <Btn
            onClick={() => onConfirm({ title, content, city, category, adminNote: note })}
            color="#fff" bg="#2A483E" icon={FiCheck}
            disabled={loading || !title || !content}
          >
            {loading ? 'Saving…' : 'Save & Accept'}
          </Btn>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Pending row ────────────────────────────────────────── */
function PendingRow({ blog, onPreview, onAccept, onEdit, onReject, busy }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #F0EDE8',
        padding: '1.1rem 1.35rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1rem',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700,
            color: '#2A483E', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>
            {blog.title}
          </h3>
          {blog.category && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '0.2em 0.55em', borderRadius: 999,
              background: '#EDF6F1', color: '#2A7A54', border: '1px solid #C1E4D0',
            }}>{blog.category}</span>
          )}
          {blog.city && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 600, padding: '0.2em 0.55em', borderRadius: 999,
              background: '#F5F0EB', color: '#7A5C3E', border: '1px solid #DDD5C8',
            }}>📍 {blog.city}</span>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>by <strong style={{ color: '#555' }}>{blog.author?.name || '—'}</strong></span>
          <span style={{ color: '#ccc' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <FiClock style={{ fontSize: '0.72rem' }} /> {fmtDate(blog.createdAt)}
          </span>
        </p>
        <p style={{ fontSize: '0.83rem', color: '#666', margin: 0, lineHeight: 1.55 }}>
          {excerpt(blog.content)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Btn onClick={() => onPreview(blog)} icon={FiEye} color="#555" bg="#F4F4F4" small>View</Btn>
        <Btn onClick={() => onAccept(blog._id)} icon={FiCheck} color="#15803D" bg="#DCFCE7" small disabled={busy}>Accept</Btn>
        <Btn onClick={() => onEdit(blog)} icon={FiEdit2} color="#1D4ED8" bg="#DBEAFE" small disabled={busy}>Edit & Accept</Btn>
        <Btn onClick={() => onReject(blog)} icon={FiX} color="#DC2626" bg="#FEE2E2" small disabled={busy}>Reject</Btn>
      </div>
    </motion.div>
  );
}

/* ─── Published row ──────────────────────────────────────── */
function PublishedRow({ blog, onPreview, onEdit, onDelete, busy }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #F0EDE8',
        padding: '1.1rem 1.35rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1rem',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700,
          color: '#2A483E', margin: '0 0 0.3rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {blog.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>by <strong style={{ color: '#555' }}>{blog.author?.name || '—'}</strong></span>
          <span style={{ color: '#ccc' }}>·</span>
          <span>Published {fmtDate(blog.createdAt)}</span>
          {blog.category && <span style={{ color: '#ccc' }}>·</span>}
          {blog.category && <span style={{ color: '#2A7A54', fontWeight: 600 }}>{blog.category}</span>}
          {blog.city && <span style={{ color: '#ccc' }}>·</span>}
          {blog.city && <span style={{ color: '#7A5C3E' }}>📍 {blog.city}</span>}
          {blog.adminNote && (
            <>
              <span style={{ color: '#ccc' }}>·</span>
              <span style={{ color: '#B45309', fontSize: '0.72rem', fontStyle: 'italic' }}>has editor note</span>
            </>
          )}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <Btn onClick={() => onPreview(blog)} icon={FiEye} color="#555" bg="#F4F4F4" small>View</Btn>
        <Btn onClick={() => onEdit(blog)} icon={FiEdit2} color="#1D4ED8" bg="#DBEAFE" small disabled={busy}>Edit</Btn>
        <Btn onClick={() => onDelete(blog)} icon={FiTrash2} color="#DC2626" bg="#FEE2E2" small disabled={busy}>Delete</Btn>
      </div>
    </motion.div>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '0.75rem', padding: '4rem 1rem', textAlign: 'center',
    }}>
      <Icon style={{ fontSize: '2.5rem', color: 'rgba(59,95,84,0.2)' }} />
      <p style={{ color: '#9A9A9A', fontSize: '0.9rem' }}>{msg}</p>
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();

  const [tab, setTab]           = useState('pending');
  const [pending, setPending]   = useState([]);
  const [published, setPublished] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [busy, setBusy]         = useState(false);

  // Modal state
  const [previewBlog, setPreviewBlog] = useState(null);
  const [rejectBlog, setRejectBlog]   = useState(null);
  const [editBlog, setEditBlog]       = useState(null);
  const [deleteBlog, setDeleteBlog]   = useState(null);
  const [editPublishedBlog, setEditPublishedBlog] = useState(null);

  // Published-tab client-side filters
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterCity, setFilterCity]   = useState('All');

  /* Auth gate — redirect non-admins immediately */
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  /* Fetch */
  const fetchAll = useCallback(async () => {
    try {
      setLoadingData(true);
      const [p, a] = await Promise.all([
        api.get('/admin/blogs?status=pending'),
        api.get('/admin/blogs?status=accepted'),
      ]);
      setPending(p.data.data || []);
      setPublished(a.data.data || []);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Derived: unique cities from published posts */
  const uniqueCities = useMemo(() => {
    const set = new Set(published.map(b => b.city).filter(Boolean));
    return [...set].sort();
  }, [published]);

  /* Derived: filtered published list (search + city) */
  const filteredPublished = useMemo(() => {
    let list = published;
    if (filterCity !== 'All') {
      list = list.filter(b => b.city === filterCity);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [published, filterCity, searchTerm]);

  /* Actions */
  const handleAccept = async (id) => {
    try {
      setBusy(true);
      await api.put(`/admin/blogs/${id}/accept`);
      toast.success('Blog accepted ✓');
      await fetchAll();
    } catch { toast.error('Could not accept blog'); }
    finally { setBusy(false); }
  };

  const handleRejectConfirm = async (note) => {
    try {
      setBusy(true);
      await api.put(`/admin/blogs/${rejectBlog._id}/reject`, { adminNote: note });
      toast.success('Blog rejected');
      setRejectBlog(null);
      await fetchAll();
    } catch { toast.error('Could not reject blog'); }
    finally { setBusy(false); }
  };

  const handleEditConfirm = async ({ title, content, city, category, adminNote }) => {
    try {
      setBusy(true);
      await api.put(`/admin/blogs/${editBlog._id}/edit`, { title, content, city, category, adminNote });
      toast.success('Blog edited & accepted ✓');
      setEditBlog(null);
      await fetchAll();
    } catch { toast.error('Could not save edit'); }
    finally { setBusy(false); }
  };

  const handleDeleteConfirm = async () => {
    try {
      setBusy(true);
      await api.delete(`/admin/blogs/${deleteBlog._id}`);
      toast.success('Blog deleted');
      setDeleteBlog(null);
      await fetchAll();
    } catch { toast.error('Could not delete blog'); }
    finally { setBusy(false); }
  };

  const handleEditPublishedConfirm = async ({ title, content, city, category, adminNote }) => {
    try {
      setBusy(true);
      await api.put(`/admin/blogs/${editPublishedBlog._id}/edit`, { title, content, city, category, adminNote });
      toast.success('Published post updated ✓');
      setEditPublishedBlog(null);
      await fetchAll();
    } catch { toast.error('Could not save edit'); }
    finally { setBusy(false); }
  };

  /* ── Render ── */
  const TAB_BTN = (id, label, count, accent) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
          padding: '0.65rem 1.35rem',
          borderRadius: 10, border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600,
          transition: 'all 0.2s',
          background: active ? accent : 'transparent',
          color: active ? '#fff' : '#666',
          boxShadow: active ? `0 4px 16px ${accent}55` : 'none',
        }}
      >
        {label}
        <Badge count={count} color={active ? 'rgba(255,255,255,0.25)' : accent} />
      </button>
    );
  };

  return (
    <>
      {/* Modals */}
      {previewBlog && <PreviewModal blog={previewBlog} onClose={() => setPreviewBlog(null)} />}
      {rejectBlog  && <RejectModal  blog={rejectBlog}  onClose={() => setRejectBlog(null)}  onConfirm={handleRejectConfirm} loading={busy} />}
      {editBlog    && <EditModal    blog={editBlog}    onClose={() => setEditBlog(null)}    onConfirm={handleEditConfirm}   loading={busy} />}
      {deleteBlog  && <DeleteModal  blog={deleteBlog}  onClose={() => setDeleteBlog(null)}  onConfirm={handleDeleteConfirm} loading={busy} />}
      {editPublishedBlog && <EditModal blog={editPublishedBlog} onClose={() => setEditPublishedBlog(null)} onConfirm={handleEditPublishedConfirm} loading={busy} />}

      <div style={{ minHeight: '100vh', background: '#F6F4F1', paddingTop: 80 }}>

        {/* ── Top bar ── */}
        <div style={{
          background: 'linear-gradient(135deg, #2A483E, #3B5F54)',
          padding: 'clamp(2rem, 4vw, 3rem) clamp(1.25rem, 5vw, 3rem)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <FiShield style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                Admin Panel
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem, 4vw, 2.5rem)',
              fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em',
            }}>
              Journal Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Review, edit, and curate blog submissions.
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #EDE8E3',
          position: 'sticky', top: 80, zIndex: 30,
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            padding: '0.6rem 1.25rem',
            display: 'flex', gap: '0.4rem', alignItems: 'center',
          }}>
            {TAB_BTN('pending',   '🕐 Pending',    pending.length,   '#D97706')}
            {TAB_BTN('published', '✅ Published',  published.length, '#2A483E')}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>

          {/* Loading */}
          {loadingData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: 90, borderRadius: 14,
                  background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          )}

          {/* Pending tab */}
          {!loadingData && tab === 'pending' && (
            <AnimatePresence mode="popLayout">
              {pending.length === 0
                ? <EmptyState icon={FiClock} msg="No pending submissions right now." />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pending.map(blog => (
                      <PendingRow
                        key={blog._id}
                        blog={blog}
                        busy={busy}
                        onPreview={setPreviewBlog}
                        onAccept={handleAccept}
                        onEdit={setEditBlog}
                        onReject={setRejectBlog}
                      />
                    ))}
                  </div>
                )
              }
            </AnimatePresence>
          )}

          {/* Published tab */}
          {!loadingData && tab === 'published' && (
            <>
              {/* ── Search & Filter action bar ── */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: '0.75rem', marginBottom: '1.5rem',
              }}>
                <div style={{
                  display: 'flex', flexWrap: 'wrap',
                  gap: '0.75rem', alignItems: 'stretch',
                }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
                    <FiSearch style={{
                      position: 'absolute', left: '0.85rem', top: '50%',
                      transform: 'translateY(-50%)', fontSize: '0.9rem',
                      color: '#9A9A9A', pointerEvents: 'none',
                    }} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title or author\u2026"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem 0.65rem 2.4rem',
                        border: '1.5px solid #E8E0D8',
                        borderRadius: 10,
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#333',
                        background: '#fff',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3B5F54';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59,95,84,0.10)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E8E0D8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* City dropdown */}
                  <div style={{ position: 'relative', flex: '0 0 auto', minWidth: 160 }}>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.2rem 0.65rem 0.9rem',
                        border: '1.5px solid #E8E0D8',
                        borderRadius: 10,
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                        appearance: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#333',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3B5F54';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59,95,84,0.10)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E8E0D8';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="All">All Cities</option>
                      {uniqueCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <FiChevronDown style={{
                      position: 'absolute', right: '0.8rem', top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                      color: '#9A9A9A', fontSize: '0.85rem',
                    }} />
                  </div>
                </div>

                {/* Result count */}
                <p style={{
                  fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 500,
                  fontFamily: 'var(--font-sans)', margin: 0,
                }}>
                  Showing {filteredPublished.length} of {published.length} published posts
                </p>
              </div>

              {/* ── Published list ── */}
              <AnimatePresence mode="popLayout">
                {published.length === 0
                  ? <EmptyState icon={FiBookOpen} msg="No published blogs yet." />
                  : filteredPublished.length === 0
                    ? (
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: '0.75rem',
                        padding: '4rem 1rem', textAlign: 'center',
                      }}>
                        <FiSearch style={{ fontSize: '2.2rem', color: 'rgba(59,95,84,0.2)' }} />
                        <p style={{ color: '#9A9A9A', fontSize: '0.9rem', maxWidth: 320 }}>
                          No published posts match your search criteria.
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); setFilterCity('All'); }}
                          style={{
                            background: 'rgba(59,95,84,0.10)', color: '#3B5F54',
                            border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem',
                            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    )
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredPublished.map(blog => (
                          <PublishedRow
                            key={blog._id}
                            blog={blog}
                            busy={busy}
                            onPreview={setPreviewBlog}
                            onEdit={setEditPublishedBlog}
                            onDelete={setDeleteBlog}
                          />
                        ))}
                      </div>
                    )
                }
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </>
  );
}
