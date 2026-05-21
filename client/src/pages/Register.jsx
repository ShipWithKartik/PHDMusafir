import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = res.data.data;
      loginUser(userData, token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #E8E0D8',
    outline: 'none',
    fontSize: '0.95rem',
    color: '#2D2D2D',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#9A9A9A',
    marginBottom: '0.5rem',
  };

  const focusIn = (e) => (e.target.style.borderColor = '#3B5F54');
  const focusOut = (e) => (e.target.style.borderColor = '#E8E0D8');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
      background: 'linear-gradient(160deg, #F8F4EF 0%, #F8F9FA 50%, #EFF4F8 100%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'var(--travel-blue)',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              PHD<span style={{ color: '#D4CDBC', fontStyle: 'italic' }}>Musafir</span>
            </h1>
          </Link>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: '#9A9A9A',
            fontSize: '0.9rem',
            marginTop: '0.5rem',
          }}>
            Begin your journey with us.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.04)',
          padding: '2.25rem 2rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#2A483E',
            marginBottom: '1.75rem',
            textAlign: 'center',
          }}>
            Create Account
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 12, padding: '0.7rem 1rem',
                color: '#DC2626', fontSize: '0.82rem', marginBottom: '1.25rem',
              }}
            >
              <FiAlertCircle style={{ flexShrink: 0 }} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Name */}
            <div>
              <label style={labelStyle}><FiUser style={{ color: '#3B5F54' }} /> Full Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" required disabled={loading}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}><FiMail style={{ color: '#3B5F54' }} /> Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={loading}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}><FiLock style={{ color: '#3B5F54' }} /> Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters" required disabled={loading}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            {/* Confirm */}
            <div>
              <label style={labelStyle}><FiLock style={{ color: '#3B5F54' }} /> Confirm Password</label>
              <input
                type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required disabled={loading}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.9rem',
                marginTop: '0.5rem',
                borderRadius: 14,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #2A483E, #3B5F54)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 8px 28px rgba(30,58,95,0.35)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <svg style={{ animation: 'spin 0.8s linear infinite', height: '1.1rem', width: '1.1rem' }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <FiUserPlus />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#9A9A9A' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3B5F54', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

