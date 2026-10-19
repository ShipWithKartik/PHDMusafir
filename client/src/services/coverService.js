import { useEffect, useState } from 'react';
import api from './api';

// Admin-managed Journal category covers.
// The list is small, so it is fetched once per page load and shared; every
// component using useCategoryCovers() is notified when it changes.
let cache = null;
let inflight = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(cache || []));

export const fetchCategoryCovers = async ({ force = false } = {}) => {
  if (cache && !force) return cache;
  if (!inflight || force) {
    inflight = api.get('/covers/categories')
      .then((res) => { cache = res.data.data || []; notify(); return cache; })
      .catch(() => { cache = cache || []; return cache; }) // covers are optional — never block a page
      .finally(() => { inflight = null; });
  }
  return inflight;
};

/** Drop the cached list (call after the admin changes a cover). */
export const invalidateCategoryCovers = () => { cache = null; };

/** Re-fetch the covers and update every component that shows them. */
export const refreshCategoryCovers = () => fetchCategoryCovers({ force: true });

/**
 * Upload a category cover (admin only).
 * city '' → applies to the category in every city; otherwise a city override.
 */
export const setCategoryCover = async ({ category, city = '', file }) => {
  const form = new FormData();
  form.append('category', category);
  form.append('city', city);
  form.append('image', file);
  await api.put('/admin/category-covers', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  await refreshCategoryCovers();
};

/** Remove a custom category cover (admin only). */
export const deleteCategoryCover = async (id) => {
  await api.delete(`/admin/category-covers/${id}`);
  await refreshCategoryCovers();
};

/** Find the exact cover document for a category at a scope ('' = all cities). */
export const findCategoryCover = (covers, category, city = '') =>
  covers?.find((x) => x.categoryKey === (category || '').toLowerCase() && x.cityKey === (city || '').toLowerCase()) || null;

/**
 * Resolve the admin cover for a category, preferring a city-specific
 * override over the global cover. Returns null when none is set.
 */
export const resolveCategoryCover = (covers, category, city = '') => {
  if (!covers?.length || !category) return null;
  const cityCover = city && findCategoryCover(covers, category, city);
  if (cityCover) return cityCover.imageUrl;
  const globalCover = findCategoryCover(covers, category, '');
  return globalCover ? globalCover.imageUrl : null;
};

/** React hook — returns the cover list ([] until loaded), kept live. */
export function useCategoryCovers() {
  const [covers, setCovers] = useState(cache || []);
  useEffect(() => {
    let alive = true;
    const onChange = (list) => { if (alive) setCovers(list); };
    listeners.add(onChange);
    fetchCategoryCovers().then(onChange);
    return () => { alive = false; listeners.delete(onChange); };
  }, []);
  return covers;
}
