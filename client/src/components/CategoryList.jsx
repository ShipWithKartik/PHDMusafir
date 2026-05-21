import { Link, useLocation } from 'react-router-dom';

const fmtSlug = (s = '') => String(s).toLowerCase().trim().replace(/\s+/g, '-');

export default function CategoryList({ title = 'Categories', items = [] }) {
  const loc = useLocation();
  const activeSlug = (loc.pathname.split('/')[2] || '').toLowerCase(); // /journal/:slug

  return (
    <div className="rounded-2xl border border-[rgba(232,224,216,0.95)] bg-white/85 shadow-[var(--shadow-sm)] backdrop-blur-md p-4">
      <p className="text-[0.7rem] font-extrabold tracking-[0.22em] uppercase text-[#6B6B6B] mb-3">
        {title}
      </p>

      <div className="flex flex-col gap-1">
        {items.map(({ name, count }) => {
          const slug = fmtSlug(name);
          const active = slug === activeSlug;
          return (
            <Link
              key={name}
              to={`/journal/${slug}`}
              className={[
                'group flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-all duration-300',
                active ? 'bg-[rgba(59,95,84,0.12)]' : 'hover:bg-[rgba(59,95,84,0.08)]',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={[
                    'inline-block w-2 h-2 rounded-[3px] transition-all duration-300',
                    active ? 'bg-[var(--primary)]' : 'bg-[rgba(59,95,84,0.35)] group-hover:bg-[var(--primary)]',
                  ].join(' ')}
                />
                <span className="min-w-0 truncate font-serif text-[0.95rem] font-semibold text-[#2A483E]">
                  {name}
                </span>
              </span>

              <span className="shrink-0 text-[0.75rem] font-extrabold text-[rgba(45,45,45,0.65)] bg-[rgba(212,205,188,0.35)] border border-[rgba(232,224,216,0.95)] px-2.5 py-0.5 rounded-full">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

