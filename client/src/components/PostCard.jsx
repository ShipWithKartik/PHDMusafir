import { Link } from 'react-router-dom';

export default function PostCard({ to, image, category, title, subtitle, variant = 'vertical' }) {
  const vertical = variant === 'vertical';
  const safeImage = image || '/images/default.svg';

  return (
    <Link
      to={to}
      className={[
        'group rounded-2xl border border-[rgba(232,224,216,0.95)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[var(--shadow)] overflow-hidden',
        'flex flex-col h-full',
      ].join(' ')}
    >
      {/* Image (fixed height, bounded) */}
      <div className="w-full h-64 sm:h-72 md:h-80 overflow-hidden">
        <img
          src={safeImage}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover rounded-none transition-transform duration-700 group-hover:scale-[1.05]"
        />
      </div>

      {/* Content (equal height cards) */}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {category && (
          <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-[#C07A4F] mb-3">
            {category}
          </p>
        )}
        <p className="font-serif text-[1.2rem] md:text-[1.35rem] font-bold leading-relaxed text-[#1A1A1A] line-clamp-2">
          {title}
        </p>
        {subtitle && (
          <p className="mt-3 text-[0.9rem] font-medium text-[rgba(45,45,45,0.65)]">
            {subtitle}
          </p>
        )}

        {/* Spacer to keep bottoms aligned when needed */}
        <div className="mt-auto" />
      </div>
    </Link>
  );
}

