// Small UI primitives for the admin dashboard panels (same look as the
// buttons and empty states in pages/AdminDashboard.jsx).

export function Btn({ onClick, color = '#3B5F54', bg, icon: Icon, children, small, disabled, title }) {
  const baseColor = bg || `${color}14`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
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

export function EmptyState({ icon: Icon, msg }) {
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

export function SkeletonList({ count = 4, height = 90 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height, borderRadius: 14,
          background: 'linear-gradient(90deg,#ede8e3 25%,#f5f0eb 50%,#ede8e3 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}
