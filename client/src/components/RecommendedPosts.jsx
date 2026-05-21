import { Link } from 'react-router-dom';

export default function RecommendedPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="pm-reco" aria-label="Recommended posts">
      <p className="pm-reco__title">You Might Also Enjoy:</p>
      <div className="pm-reco__grid">
        {posts.map((p) => {
          const img = p.images?.[0]?.url;
          return (
            <Link key={p._id} to={`/journal/${p._id}`} className="pm-reco__card">
              <div className="pm-reco__media">
                {img ? <img src={img} alt="" loading="lazy" /> : <div className="pm-reco__mediaFallback" />}
              </div>
              <div className="pm-reco__body">
                <p className="pm-reco__eyebrow">{p.category || p.city || 'Travel Journal'}</p>
                <p className="pm-reco__headline">{p.title}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

