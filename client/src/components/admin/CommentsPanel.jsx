import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiMessageCircle, FiTrash2, FiSearch, FiChevronDown, FiCornerDownRight, FiExternalLink, FiRefreshCw,
} from 'react-icons/fi';
import api from '../../services/api';
import { Btn, EmptyState, SkeletonList } from './AdminUi';
import { fieldStyle } from './adminStyles';

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/**
 * Admin moderation queue for comments on Stories and Posts.
 * Deleting a comment also removes every reply beneath it.
 */
export default function CommentsPanel() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState(null);
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('All'); // 'All' | 'Story' | 'Blog'

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/comments');
      setComments(res.data.data || []);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = comments;
    if (type !== 'All') list = list.filter((c) => c.targetModel === type);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.content?.toLowerCase().includes(q) ||
        c.author?.name?.toLowerCase().includes(q) ||
        c.author?.email?.toLowerCase().includes(q) ||
        c.target?.title?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [comments, type, search]);

  const replyCount = (id) => comments.filter((c) => c.parentCommentId === id).length;

  const handleDelete = async (comment) => {
    const replies = replyCount(comment._id);
    const extra = replies ? ` and its ${replies} direct ${replies === 1 ? 'reply' : 'replies'}` : '';
    if (!window.confirm(`Delete this comment by ${comment.author?.name || 'unknown user'}${extra}? This cannot be undone.`)) return;
    try {
      setBusyId(comment._id);
      const res = await api.delete(`/admin/comments/${comment._id}`);
      const n = res.data?.deleted || 1;
      toast.success(n > 1 ? `Deleted ${n} comments` : 'Comment deleted');
      await load(); // replies may have been removed too
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete comment');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {/* ── Search & filter bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'stretch' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
            <FiSearch style={{
              position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.9rem', color: '#9A9A9A', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comment text, author or post title…"
              style={{ ...fieldStyle, width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: 160 }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...fieldStyle, width: '100%', paddingRight: '2.2rem', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="All">Stories & Posts</option>
              <option value="Story">Stories only</option>
              <option value="Blog">Posts only</option>
            </select>
            <FiChevronDown style={{
              position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: '#9A9A9A', fontSize: '0.85rem',
            }} />
          </div>
          <Btn icon={FiRefreshCw} color="#555" bg="#F4F4F4" onClick={load} disabled={loading}>Refresh</Btn>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#9A9A9A', fontWeight: 500, margin: 0 }}>
          Showing {filtered.length} of {comments.length} comments · newest first
        </p>
      </div>

      {loading ? <SkeletonList count={4} height={96} /> : comments.length === 0 ? (
        <EmptyState icon={FiMessageCircle} msg="No comments yet." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiSearch} msg="No comments match your search." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => {
              const isStory = c.targetModel === 'Story';
              const replies = replyCount(c._id);
              return (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: '#fff', borderRadius: 14, border: '1px solid #F0EDE8',
                    padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    {/* Meta line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem', fontSize: '0.75rem', color: '#888' }}>
                      <strong style={{ color: '#2A483E' }}>{c.author?.name || 'Deleted user'}</strong>
                      {c.author?.email && <span>{c.author.email}</span>}
                      <span style={{ color: '#ccc' }}>·</span>
                      <span>{fmtDateTime(c.createdAt)}</span>
                      {c.parentCommentId && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#B45309' }}>
                          <FiCornerDownRight style={{ fontSize: '0.72rem' }} /> reply
                        </span>
                      )}
                      {replies > 0 && (
                        <span style={{ color: '#9A9A9A' }}>{replies} {replies === 1 ? 'reply' : 'replies'}</span>
                      )}
                    </div>

                    {/* Content */}
                    <p style={{
                      fontSize: '0.88rem', color: '#3A3A3A', lineHeight: 1.6, margin: '0 0 0.55rem',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {c.content}
                    </p>

                    {/* Target */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                      <span style={{
                        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '0.15em 0.55em', borderRadius: 999,
                        background: isStory ? '#F5F0EB' : '#EDF6F1',
                        color: isStory ? '#7A5C3E' : '#2A7A54',
                        border: `1px solid ${isStory ? '#DDD5C8' : '#C1E4D0'}`,
                      }}>
                        {isStory ? 'Story' : 'Post'}
                      </span>
                      {c.target ? (
                        !isStory && c.target.status === 'accepted' ? (
                          <Link to={`/journal/${c.targetId}`} target="_blank" rel="noreferrer"
                            style={{ color: '#1D4ED8', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {c.target.title} <FiExternalLink style={{ fontSize: '0.7rem' }} />
                          </Link>
                        ) : (
                          <span style={{ color: '#555', fontWeight: 600 }}>{c.target.title}</span>
                        )
                      ) : (
                        <span style={{ color: '#9A9A9A', fontStyle: 'italic' }}>post no longer exists</span>
                      )}
                      {c.target?.city && <span style={{ color: '#9A9A9A' }}>📍 {c.target.city}</span>}
                    </div>
                  </div>

                  <Btn small icon={FiTrash2} color="#DC2626" bg="#FEE2E2" disabled={!!busyId} onClick={() => handleDelete(c)}>
                    {busyId === c._id ? 'Deleting…' : 'Delete'}
                  </Btn>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
