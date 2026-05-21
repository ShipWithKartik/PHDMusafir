import { useState, useEffect, useCallback } from 'react';
import { FiMessageCircle, FiCornerDownRight, FiSend, FiTrash2, FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ── Helpers ─────────────────────────────────────────────── */
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── Single comment thread (recursive) ───────────────────── */
function CommentThread({
  comment,
  replies,
  allComments,
  postAuthorId,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPostAuthor = comment.author?._id === postAuthorId;
  const isOwnComment = currentUserId && comment.author?._id === currentUserId;

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(replyText.trim(), comment._id);
    setReplyText('');
    setShowReplyInput(false);
    setSubmitting(false);
  };

  // Thread replies for this comment
  const childReplies = replies.filter((r) => r.parentCommentId === comment._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      style={{
        marginLeft: depth > 0 ? 'clamp(1rem, 3vw, 2rem)' : 0,
        borderLeft: depth > 0 ? '2px solid #E8E0D8' : 'none',
        paddingLeft: depth > 0 ? 'clamp(0.75rem, 2vw, 1.25rem)' : 0,
        marginBottom: '0.25rem',
      }}
    >
      {/* Comment card */}
      <div
        style={{
          padding: '1rem 1.15rem',
          borderRadius: 12,
          background: isPostAuthor ? '#FDF8F1' : '#fff',
          border: isPostAuthor ? '1.5px solid #E8D8C4' : '1px solid #F0EDE8',
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Header — avatar + name + badge + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#3B5F54',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isPostAuthor ? '2px solid #C07A4F' : '1px solid #E8E0D8',
            }}
          >
            {comment.author?.profilePicture ? (
              <img
                src={comment.author.profilePicture}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Name + Author badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#2A483E',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {comment.author?.name || 'Unknown'}
            </span>
            {isPostAuthor && (
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#C07A4F',
                  background: 'rgba(192,122,79,0.1)',
                  border: '1px solid rgba(192,122,79,0.25)',
                  padding: '0.1em 0.5em',
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              >
                Author
              </span>
            )}
          </div>

          {/* Timestamp */}
          <span
            style={{
              fontSize: '0.68rem',
              color: '#9A9A9A',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}
          >
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        {/* Comment body */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            color: '#3A3A3A',
            margin: '0 0 0.6rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {comment.content}
        </p>

        {/* Actions — Reply + Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUserId && (
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: showReplyInput ? '#C07A4F' : '#9A9A9A',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                padding: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C07A4F')}
              onMouseLeave={(e) => {
                if (!showReplyInput) e.currentTarget.style.color = '#9A9A9A';
              }}
            >
              <FiCornerDownRight style={{ fontSize: '0.75rem' }} />
              Reply
            </button>
          )}
          {isOwnComment && (
            <button
              onClick={() => onDelete(comment._id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9A9A9A',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                padding: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9A9A9A')}
            >
              <FiTrash2 style={{ fontSize: '0.7rem' }} />
              Delete
            </button>
          )}
        </div>

        {/* Reply input (inline) */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitReply()}
                  placeholder={`Reply to ${comment.author?.name?.split(' ')[0] || 'this comment'}…`}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    color: '#333',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3B5F54')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E0D8')}
                  disabled={submitting}
                  autoFocus
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    background: replyText.trim() ? '#2A483E' : '#E8E0D8',
                    color: replyText.trim() ? '#fff' : '#9A9A9A',
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <FiSend style={{ fontSize: '0.85rem' }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Recursive child replies ── */}
      {childReplies.length > 0 && (
        <div style={{ marginTop: '0.25rem' }}>
          {childReplies.map((child) => (
            <CommentThread
              key={child._id}
              comment={child}
              replies={allComments.filter((c) => c.parentCommentId !== null)}
              allComments={allComments}
              postAuthorId={postAuthorId}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main CommentSection component ───────────────────────── */
export default function CommentSection({ targetId, targetModel, postAuthorId }) {
  const { user, isLoggedIn } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* Fetch comments */
  const fetchComments = useCallback(async () => {
    try {
      setError('');
      const res = await api.get(`/comments/${targetId}`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    if (targetId) fetchComments();
  }, [targetId, fetchComments]);

  /* Submit a new comment or reply */
  const handleSubmit = async (content, parentCommentId = null) => {
    try {
      setSubmitting(true);
      await api.post('/comments', {
        content,
        targetId,
        targetModel,
        parentCommentId,
      });
      await fetchComments(); // Refresh the list
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  /* Submit top-level comment */
  const handleTopLevelSubmit = async () => {
    if (!newComment.trim()) return;
    await handleSubmit(newComment.trim());
    setNewComment('');
  };

  /* Delete a comment */
  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  /* Build tree: top-level = parentCommentId is null */
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const allReplies = comments.filter((c) => c.parentCommentId);

  /* Shimmer skeleton */
  const shimBg = {
    background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
    backgroundSize: '200% 100%',
    animation: 'comment-shimmer 1.5s infinite',
    borderRadius: 6,
  };

  return (
    <div
      style={{
        marginTop: '3rem',
        paddingTop: '2.5rem',
        borderTop: '1px solid #E8E0D8',
      }}
    >
      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
        <FiMessageCircle style={{ fontSize: '1.15rem', color: '#3B5F54' }} />
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#2A483E',
            margin: 0,
          }}
        >
          Discussion
        </h3>
        {!loading && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9A9A9A',
              background: '#F0EDE8',
              borderRadius: 999,
              padding: '0.15em 0.55em',
            }}
          >
            {comments.length}
          </span>
        )}
      </div>

      {/* ── Top-level input ── */}
      {isLoggedIn ? (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Current user avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#3B5F54',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '0.25rem',
            }}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #E8E0D8',
                borderRadius: 10,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                lineHeight: 1.55,
                resize: 'vertical',
                outline: 'none',
                color: '#333',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B5F54';
                e.target.style.boxShadow = '0 0 0 3px rgba(59,95,84,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E8E0D8';
                e.target.style.boxShadow = 'none';
              }}
              disabled={submitting}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleTopLevelSubmit}
                disabled={submitting || !newComment.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: 8,
                  border: 'none',
                  background: newComment.trim() ? '#2A483E' : '#E8E0D8',
                  color: newComment.trim() ? '#fff' : '#9A9A9A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                <FiSend style={{ fontSize: '0.8rem' }} />
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Not logged in prompt */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '1rem 1.25rem',
            borderRadius: 10,
            background: '#F8F4EF',
            border: '1px solid #E8E0D8',
            marginBottom: '2rem',
          }}
        >
          <FiLogIn style={{ fontSize: '1rem', color: '#3B5F54', flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#6B6B6B', margin: 0, fontFamily: 'var(--font-sans)' }}>
            <Link
              to="/login"
              style={{ color: '#3B5F54', fontWeight: 700, textDecoration: 'underline' }}
            >
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: '1rem 1.15rem',
                borderRadius: 12,
                border: '1px solid #F0EDE8',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ ...shimBg, width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ ...shimBg, width: '30%', height: 12 }} />
                <div style={{ ...shimBg, width: '80%', height: 10 }} />
                <div style={{ ...shimBg, width: '55%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <p style={{ color: '#DC2626', fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}>
          {error}
        </p>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && comments.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '2.5rem 1rem',
            textAlign: 'center',
          }}
        >
          <FiMessageCircle style={{ fontSize: '2rem', color: 'rgba(59,95,84,0.15)' }} />
          <p style={{ color: '#9A9A9A', fontSize: '0.88rem', fontFamily: 'var(--font-sans)' }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* ── Comment list ── */}
      {!loading && !error && topLevel.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {topLevel.map((comment) => (
              <CommentThread
                key={comment._id}
                comment={comment}
                replies={allReplies}
                allComments={comments}
                postAuthorId={postAuthorId}
                currentUserId={user?._id}
                onReply={handleSubmit}
                onDelete={handleDelete}
                depth={0}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes comment-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
