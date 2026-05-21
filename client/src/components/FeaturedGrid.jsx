import PostCard from './PostCard';

export default function FeaturedGrid({ items }) {
  const list = (items || []).slice(0, 4);
  return (
    <section className="pm-section" style={{ background: '#ffffff' }}>
      <div className="pm-container">
        <div style={{ textAlign: 'center', marginBottom: '6.5rem' }}>
          <p className="pm-eyebrow">
            Editor’s Picks
          </p>
          <h2 className="pm-title">
            Featured Stories
          </h2>
          <p className="pm-body" style={{ margin: '0 auto', textAlign: 'center' }}>
            A curated slice of journeys—beautiful places, small details, and stories worth bookmarking.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {list.map((it) => (
            <PostCard key={it.title} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}

