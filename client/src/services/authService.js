import api from './api';

const TOKEN_KEY = 'phdmusafir_token';
const USER_KEY = 'phdmusafir_user';

/* ─── Token helpers ────────────────────────────────────── */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/* ─── API calls ────────────────────────────────────────── */

/**
 * Register a new user.
 */
export const register = async ({ name, email, password }) => {
  const res = await api.post('/auth/register', { name, email, password });
  const { token, ...user } = res.data.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return res.data;
};

/**
 * Login with email + password.
 */
export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  const { token, ...user } = res.data.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return res.data;
};

/**
 * Fetch the current user's profile.
 */
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

/**
 * Toggle a bookmark for a specific story ID.
 */
export const toggleBookmark = async (storyId) => {
  const res = await api.post(`/users/bookmark/${storyId}`);
  return res.data;
};

/**
 * Fetch the user's populated bookmarks.
 */
export const getBookmarks = async () => {
  const res = await api.get('/users/bookmarks');
  return res.data;
};
