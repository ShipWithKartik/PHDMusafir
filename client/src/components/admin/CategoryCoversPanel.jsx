import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiImage, FiUploadCloud, FiRotateCcw, FiChevronDown, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import { fetchCategoryCovers, invalidateCategoryCovers } from '../../services/coverService';
import { Btn, SkeletonList } from './AdminUi';
import { fieldStyle } from './adminStyles';

// Same list as the Blog model's category enum
const CATEGORIES = ['Picnic', 'Party', 'Family', 'Nature', 'Adventure', 'Culture', 'Food', 'Heritage', 'Spiritual', 'Other'];

/**
 * Admin panel for choosing the cover image of each Journal category.
 * A cover can apply to every city ("All cities") or override one city.
 */
export default function CategoryCoversPanel({ cities = [] }) {
  const [covers, setCovers]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [scopeCity, setScopeCity] = useState(''); // '' = all cities
  const [busyKey, setBusyKey]     = useState(null);
  const fileRef    = useRef(null);
  const pendingCat = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      invalidateCategoryCovers();
      setCovers(await fetchCategoryCovers({ force: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const findCover = (category, city) =>
    covers.find((c) => c.categoryKey === category.toLowerCase() && c.cityKey === (city || '').toLowerCase());

  const pickFile = (category) => {
    pendingCat.current = category;
    fileRef.current?.click();
  };

  const handleFile = async (file) => {
    if (fileRef.current) fileRef.current.value = '';
    const category = pendingCat.current;
    if (!file || !category) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be 10 MB or smaller.');
      return;
    }
    try {
      setBusyKey(category);
      const form = new FormData();
      form.append('category', category);
      form.append('city', scopeCity);
      form.append('image', file);
      await api.put('/admin/category-covers', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${category} cover updated ✓`);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update cover');
    } finally {
      setBusyKey(null);
    }
  };

  const handleReset = async (cover, category) => {
    const scope = scopeCity ? ` for ${scopeCity}` : '';
    if (!window.confirm(`Remove the custom ${category} cover${scope}? It will fall back to the default image.`)) return;
    try {
      setBusyKey(category);
      await api.delete(`/admin/category-covers/${cover._id}`);
      toast.success('Cover reset to default');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not reset cover');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div>
      {/* ── Scope selector + help ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <select
            value={scopeCity}
            onChange={(e) => setScopeCity(e.target.value)}
            style={{ ...fieldStyle, width: '100%', paddingRight: '2.2rem', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">All cities (default cover)</option>
            {cities.map((c) => <option key={c} value={c}>Only in {c}</option>)}
          </select>
          <FiChevronDown style={{
            position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: '#9A9A9A', fontSize: '0.85rem',
          }} />
        </div>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#888', margin: 0, flex: '1 1 300px' }}>
          <FiInfo style={{ flexShrink: 0 }} />
          {scopeCity
            ? `Covers set here only apply to ${scopeCity} and override the all-cities cover.`
            : 'Covers set here apply to the category in every city, unless a city has its own override.'}
        </p>
      </div>

      {loading ? <SkeletonList count={3} height={200} /> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {CATEGORIES.map((category, i) => {
            const own = findCover(category, scopeCity);          // cover at the selected scope
            const inherited = scopeCity ? findCover(category, '') : null; // all-cities cover
            const shown = own || inherited;
            const busy = busyKey === category;

            let status = 'Default image';
            if (own) status = scopeCity ? `Custom for ${scopeCity}` : 'Custom (all cities)';
            else if (inherited) status = 'Using all-cities cover';

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                style={{
                  background: '#fff', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid #F0EDE8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '16 / 10', background: '#EDEAE6' }}>
                  {shown ? (
                    <img src={shown.imageUrl} alt={category} style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      opacity: busy ? 0.5 : 1, transition: 'opacity 0.2s',
                    }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#9A9A9A',
                    }}>
                      <FiImage style={{ fontSize: '1.8rem', opacity: 0.6 }} />
                      <span style={{ fontSize: '0.72rem', textAlign: 'center', padding: '0 1rem' }}>
                        Uses the latest post image / site default
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
                    pointerEvents: 'none',
                  }} />
                  <h3 style={{
                    position: 'absolute', left: '0.9rem', bottom: '0.7rem', margin: 0,
                    fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700,
                    color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}>{category}</h3>
                </div>
                <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  <span style={{
                    alignSelf: 'flex-start',
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '0.2em 0.6em', borderRadius: 999,
                    background: own ? '#EDF6F1' : '#F5F0EB',
                    color: own ? '#2A7A54' : '#7A5C3E',
                    border: `1px solid ${own ? '#C1E4D0' : '#DDD5C8'}`,
                  }}>{status}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <Btn small icon={FiUploadCloud} color="#1D4ED8" bg="#DBEAFE" disabled={!!busyKey} onClick={() => pickFile(category)}>
                      {busy ? 'Saving…' : own ? 'Replace' : 'Upload cover'}
                    </Btn>
                    {own && (
                      <Btn small icon={FiRotateCcw} color="#DC2626" bg="#FEE2E2" disabled={!!busyKey} onClick={() => handleReset(own, category)}>
                        Reset
                      </Btn>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
