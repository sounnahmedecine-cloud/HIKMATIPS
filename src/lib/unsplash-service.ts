const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const BASE = 'https://api.unsplash.com';

const QUERIES: Record<string, string[]> = {
  hadith:        ['mosque architecture', 'arabic calligraphy', 'islamic architecture interior'],
  coran:         ['quran mosque light', 'arabic calligraphy gold', 'mosque dome'],
  ramadan:       ['crescent moon night', 'mosque lantern night', 'ramadan islamic'],
  citadelle:     ['night sky stars mosque', 'islamic architecture night', 'mosque minaret'],
  rabbana:       ['sky clouds light serene', 'sunrise mountain mist', 'ocean horizon calm'],
  thematique:    ['landscape nature mountain', 'desert dunes', 'forest light serene'],
  'recherche-ia':['landscape nature serene', 'islamic architecture', 'mountain calm'],
  default:       ['mosque architecture', 'islamic geometric pattern', 'arabic architecture'],
};

export async function fetchUnsplashBackground(category: string): Promise<string | null> {
  if (!ACCESS_KEY) return null;
  const pool = QUERIES[category] ?? QUERIES.default;
  const query = pool[Math.floor(Math.random() * pool.length)];
  try {
    const res = await fetch(
      `${BASE}/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&content_filter=high`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.urls?.regular as string) ?? null;
  } catch {
    return null;
  }
}

export async function fetchUnsplashGallery(query: string, count = 12): Promise<string[]> {
  if (!ACCESS_KEY) return [];
  try {
    const res = await fetch(
      `${BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait&content_filter=high`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results as { urls: { regular: string } }[]).map(r => r.urls.regular);
  } catch {
    return [];
  }
}
