import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { normaliseImageKey } from '../utils/siteImageKeys';

/**
 * Admin-replaceable site images (landing hero, about collage, journal hero,
 * city covers …). Each image has a stable key; when the admin has not replaced
 * it, components fall back to their built-in default image.
 *
 * The map is cached in localStorage so custom images show immediately on
 * repeat visits, then refreshed from the API in the background.
 */
const SiteImagesContext = createContext(null);

const CACHE_KEY = 'phdmusafir_site_images';
const EDIT_MODE_KEY = 'phdmusafir_image_edit_mode';

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; }
};

export function SiteImagesProvider({ children }) {
  const [images, setImages] = useState(readCache);
  const [editMode, setEditModeState] = useState(() => {
    try { return localStorage.getItem(EDIT_MODE_KEY) !== 'off'; } catch { return true; }
  });

  // Refresh from the API on load
  useEffect(() => {
    let alive = true;
    api.get('/site-images')
      .then((res) => { if (alive) setImages(res.data.data || {}); })
      .catch(() => { /* keep cached / default images */ });
    return () => { alive = false; };
  }, []);

  // Keep the cache in sync
  useEffect(() => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(images)); } catch { /* ignore */ }
  }, [images]);

  const setEditMode = useCallback((on) => {
    setEditModeState(on);
    try { localStorage.setItem(EDIT_MODE_KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
  }, []);

  /** Upload a new image for a key (admin only). */
  const setImage = useCallback(async (key, file) => {
    const k = normaliseImageKey(key);
    const form = new FormData();
    form.append('image', file);
    const res = await api.put(`/admin/site-images/${encodeURIComponent(k)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.data.data.imageUrl;
    setImages((prev) => ({ ...prev, [k]: url }));
    return url;
  }, []);

  /** Revert a key to its built-in default image (admin only). */
  const resetImage = useCallback(async (key) => {
    const k = normaliseImageKey(key);
    await api.delete(`/admin/site-images/${encodeURIComponent(k)}`);
    setImages((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    images,
    setImage,
    resetImage,
    editMode,
    setEditMode,
  }), [images, setImage, resetImage, editMode, setEditMode]);

  return (
    <SiteImagesContext.Provider value={value}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  const ctx = useContext(SiteImagesContext);
  if (!ctx) throw new Error('useSiteImages must be used within a SiteImagesProvider');
  return ctx;
}

/** The current URL for a site image key, or the fallback when not replaced. */
export function useSiteImage(key, fallback) {
  const { images } = useSiteImages();
  return images[normaliseImageKey(key)] || fallback;
}
