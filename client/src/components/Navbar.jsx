import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiCompass, FiHome, FiLogIn, FiLogOut, FiBook, FiShield, FiPenTool } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logoutUser } = useAuth();
  const isHero = pathname === '/' || pathname === '/discover';
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll position */
  useEffect(() => {
    if (!isHero) { setScrolled(true); return; }
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, [isHero]);

  const frosted = scrolled || !isHero;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const navLink = (to, label, Icon, matchPrefix = false) => {
    const isActive = matchPrefix ? pathname.startsWith(to) : pathname === to;
    return (
      <Link
        to={to}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.9rem',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.22s ease',
          letterSpacing: '0.01em',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
          background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
          borderBottom: isActive ? '1px solid rgba(255,255,255,0.45)' : '1px solid transparent',
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
      >
        <Icon style={{ fontSize: '0.95rem', flexShrink: 0 }} />
        {label}
      </Link>
    );
  };

  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.45s ease, backdrop-filter 0.45s ease, border-color 0.45s ease',
      background: frosted ? 'rgba(0,0,0,0.2)' : 'transparent',
      backdropFilter: frosted ? 'blur(12px)' : 'blur(0px)',
      WebkitBackdropFilter: frosted ? 'blur(12px)' : 'blur(0px)',
      borderBottom: frosted ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      height: 80,
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 1.25rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✈️</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            PHDMusafir
          </span>
        </Link>

        {/* Nav links + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {navLink('/', 'Home', FiHome)}
          {navLink('/discover', 'Discover', FiCompass)}
          {/* Journal — visible to everyone */}
          {navLink('/journal', 'Journal', FiBook, true)}
          {/* Write a Blog — only logged-in non-admin users */}
          {isLoggedIn && user?.role !== 'admin' && navLink('/write-blog', 'Write a Blog', FiPenTool, true)}
          {/* Share Story — only logged-in non-admin users */}
          {isLoggedIn && user?.role !== 'admin' && navLink('/upload', 'Share Story', FiUploadCloud)}
          {/* Admin — only the admin */}
          {user?.role === 'admin' && navLink('/admin', 'Admin', FiShield)}

          {/* Divider */}
          <div style={{
            width: 1,
            height: 20,
            background: 'rgba(255,255,255,0.25)',
            margin: '0 0.5rem',
          }} />

          {isLoggedIn ? (
            /* Logged in: avatar + logout */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.8rem 0.3rem 0.4rem',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'background 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                {/* Avatar */}
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#fff',
                  maxWidth: 90,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <FiLogOut />
              </button>
            </div>
          ) : (
            /* Not logged in: Sign In link */
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.1rem',
                borderRadius: 10,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.22s ease',
                color: '#fff',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <FiLogIn style={{ fontSize: '1rem' }} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

