import { useParams, Navigate } from 'react-router-dom';
import BlogDetail from './BlogDetail';

const isObjectId = (s = '') => /^[0-9a-fA-F]{24}$/.test(String(s));

/**
 * /journal/:slug — router for two cases:
 *   1. MongoDB ObjectId  → render BlogDetail directly
 *   2. City slug         → redirect to /journal/city/:slug (CityJournal — the polished UI)
 */
export default function JournalSlug() {
  const { slug } = useParams();

  if (isObjectId(slug)) {
    return <BlogDetail />;
  }

  // Redirect legacy /journal/<city-slug> → /journal/city/<city-slug>
  return <Navigate to={`/journal/city/${slug}`} replace />;
}

