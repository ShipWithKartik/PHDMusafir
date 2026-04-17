import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data.data;
      loginUser(userData, token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--travel-blue)',
              margin: 0,
            }}>
              PHD<span style={{ color: '#D4CDBC' }}>Musafir</span>
            </h1>
          </Link>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: '#9A9A9A',
            fontSize: '0.9rem',
            marginTop: '0.5rem',
          }}>
            Welcome back, traveller.
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
            Sign In
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9A9A', marginBottom: '0.5rem' }}>
                <FiMail style={{ color: '#3B5F54' }} /> Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or admin username"
                required
                disabled={loading}
                style={{
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
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
                onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9A9A', marginBottom: '0.5rem' }}>
                <FiLock style={{ color: '#3B5F54' }} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
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
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B5F54'}
                onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
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
                background: 'linear-gradient(135deg, #3B5F54, #2A483E)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 8px 28px rgba(59,95,84,0.40)',
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
              ) : <FiLogIn />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#9A9A9A' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3B5F54', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

