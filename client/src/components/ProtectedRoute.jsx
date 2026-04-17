import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any <Route element={...}> with this to require auth.
 * Redirects to /login if not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  // Still checking localStorage — show nothing briefly
  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

