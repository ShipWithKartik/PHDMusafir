// Central place for static (non-post-driven) cover imagery.
// This intentionally avoids "latest post image" logic so UI cover images stay consistent.

const curatedCovers = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2400&auto=format&fit=crop',
];

function hashToIndex(str = '', modulo = 1) {
  const s = String(str);
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return modulo ? (h % modulo) : 0;
}

export function getStaticCoverForCity(cityName) {
  return curatedCovers[hashToIndex(cityName, curatedCovers.length)];
}

export function getStaticCoverForCategory(categoryName) {
  // Offset the hash slightly so category != city for same string.
  return curatedCovers[hashToIndex(`cat:${categoryName}`, curatedCovers.length)];
}

export const IMAGES = {
  homeHero: 'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg',
  journalHero: 'https://images.unsplash.com/photo-1512719994953-eabf50895df7?q=80&w=2670&auto=format&fit=crop',

  aboutCollage: [
    'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop',
  ],

  landing: {
    featured: [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2400&auto=format&fit=crop',
    ],
    trending: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1600&auto=format&fit=crop',
    ],
    destinations: [
      { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1586946529705-9795aab8f68a?q=80&w=2000&auto=format&fit=crop' },
      { name: 'Chandigarh', image: 'https://images.unsplash.com/photo-1613462847848-6f9e3b3d9c3b?q=80&w=2000&auto=format&fit=crop' },
      { name: 'Jammu', image: 'https://images.unsplash.com/photo-1564463836146-7e1e1b6c1a2c?q=80&w=2000&auto=format&fit=crop' },
      { name: 'Ropar', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop' },
      { name: 'Amritsar', image: 'https://images.unsplash.com/photo-1609851451287-9d8f3c9c4d8c?q=80&w=2000&auto=format&fit=crop' },
      { name: 'Shimla', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000&auto=format&fit=crop' },
    ],
  },
};

