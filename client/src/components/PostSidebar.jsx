import { Link } from 'react-router-dom';

const fmtSlug = (s = '') => String(s).toLowerCase().trim().replace(/\s+/g, '-');

export default function PostSidebar({ cityCounts }) {
  const items = Object.entries(cityCounts || {})
    .filter(([city]) => city && city.trim())
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <aside className="pm-post-sidebar" aria-label="Sidebar">
      <div className="pm-post-sidebar__card">
        <p className="pm-post-sidebar__title">Categories</p>
        <div className="pm-post-sidebar__list">
          {items.length === 0 ? (
            <p className="pm-post-sidebar__empty">No categories yet.</p>
          ) : (
            items.map(([city, count]) => (
              <Link
                key={city}
                to={`/journal/${fmtSlug(city)}`}
                className="pm-post-sidebar__item"
              >
                <span className="pm-post-sidebar__itemName">{city}</span>
                <span className="pm-post-sidebar__count">{count}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

