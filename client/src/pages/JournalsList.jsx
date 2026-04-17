import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';

export default function JournalsList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const res = await api.get('/journals');
      setJournals(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', background: '#F8F4EF', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#2A483E', marginBottom: '2rem', textAlign: 'center', fontSize: '2.5rem' }}>
          Travel Journals
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading journals...</p>
        ) : journals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 12 }}>
            <FiBookOpen style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
            <p style={{ color: '#666', fontSize: '1.2rem', margin: 0 }}>No journals published yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {journals.map((j, i) => (
              <motion.div
                key={j._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: '#fff',
                  padding: '2.5rem',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  border: '1px solid #E8E0D8'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                    {j.author?.profilePicture ? (
                      <img src={j.author.profilePicture} alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3B5F54', color: '#fff', fontWeight: 'bold' }}>
                        {j.author?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{j.author?.name}</h3>
                    <small style={{ color: '#999' }}>{new Date(j.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</small>
                  </div>
                </div>
                
                <h2 style={{ fontFamily: 'var(--font-serif)', color: '#2A483E', fontSize: '1.8rem', marginTop: 0, marginBottom: '1rem' }}>
                  {j.title}
                </h2>
                
                <p style={{ 
                  color: '#4A4A4A', 
                  lineHeight: 1.8, 
                  fontSize: '1.05rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {j.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
