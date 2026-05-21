import { Link } from 'react-router-dom';

function NavCard({ label, post, align = 'left' }) {
  if (!post) return <div className="pm-post-nav__empty" />;
  const coverUrl = post.images?.[0]?.url;

  return (
    <Link
      to={`/journal/${post._id}`}
      className={`pm-post-nav__card pm-post-nav__card--${align}`}
      aria-label={`${label}: ${post.title}`}
    >
      <div className="pm-post-nav__thumb">
        {coverUrl ? <img src={coverUrl} alt="" loading="lazy" /> : <div className="pm-post-nav__thumbFallback" />}
      </div>
      <div className="pm-post-nav__meta">
        <p className="pm-post-nav__label">{label}</p>
        <p className="pm-post-nav__title">{post.title}</p>
      </div>
    </Link>
  );
}

export default function PostNavigation({ prevPost, nextPost }) {
  return (
    <section className="pm-post-nav" aria-label="Post navigation">
      <NavCard label="Previous Post" post={prevPost} align="left" />
      <NavCard label="Next Post" post={nextPost} align="right" />
    </section>
  );
}

