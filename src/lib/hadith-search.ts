import Fuse from 'fuse.js';

export interface DetailedHadith {
    id: number;
    hadithNumber?: number;
    french: string;
    source: string;
    reference: {
        book?: number;
        hadith?: number;
    };
    score?: number; // relevance score (lower is better)
    bookName?: string; // human-readable book name
}

export interface HadithBook {
    metadata?: {
        title?: string;
        length?: number;
    };
    hadiths: DetailedHadith[];
}

const BOOKS: { key: string; label: string }[] = [
    { key: 'bukhari', label: 'Sahih al-Bukhari' },
    { key: 'muslim', label: 'Sahih Muslim' },
    { key: 'abudawud', label: 'Sunan Abu Dawud' },
    { key: 'nasai', label: "Sunan An-Nasa'i" },
    { key: 'ibnmajah', label: 'Sunan Ibn Majah' },
    { key: 'malik', label: 'Muwatta Malik' },
];

// Cache loaded books to avoid re-fetching
const bookCache: Map<string, HadithBook> = new Map();

function getBasePath(): string {
    const envBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
    if (envBase) return envBase;
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/HIKMATIPS')) {
        return '/HIKMATIPS';
    }
    return '';
}

async function loadBook(bookKey: string): Promise<HadithBook | null> {
    if (bookCache.has(bookKey)) return bookCache.get(bookKey)!;

    try {
        const base = getBasePath();
        const response = await fetch(`${base}/data/hadiths/${bookKey}.json`);
        if (!response.ok) return null;

        const data: HadithBook = await response.json();
        bookCache.set(bookKey, data);
        return data;
    } catch (error) {
        console.error(`Error loading ${bookKey}:`, error);
        return null;
    }
}

/**
 * Original search function — enhanced with book labels and scoring.
 * Searches across all 6 books using substring matching.
 */
export async function searchHadiths(query: string): Promise<DetailedHadith[]> {
    if (!query || query.length < 3) return [];

    const results: DetailedHadith[] = [];
    const q = query.toLowerCase();

    for (const book of BOOKS) {
        try {
            const data = await loadBook(book.key);
            if (!data) continue;

            const matches = data.hadiths
                .filter(h => h.french.toLowerCase().includes(q))
                .map(h => ({
                    ...h,
                    bookName: book.label,
                }));

            results.push(...matches.slice(0, 20));

            if (results.length >= 100) break;
        } catch (error) {
            console.error(`Error searching in ${book.key}:`, error);
        }
    }

    return results;
}

/**
 * Advanced fragment-based search.
 * Prioritizes hadiths that START with the fragment, then fuzzy matches.
 * Returns results sorted by relevance.
 */
export async function searchHadithByFragment(
    fragment: string,
    maxResults: number = 30
): Promise<DetailedHadith[]> {
    if (!fragment || fragment.length < 3) return [];

    const q = fragment.toLowerCase().trim();

    // Collect all hadiths from all books
    const allHadiths: DetailedHadith[] = [];

    for (const book of BOOKS) {
        const data = await loadBook(book.key);
        if (!data) continue;

        for (const h of data.hadiths) {
            allHadiths.push({
                ...h,
                bookName: book.label,
            });
        }
    }

    // Phase 1: Exact "starts with" matches (highest priority)
    const startsWithMatches = allHadiths.filter(h =>
        h.french.toLowerCase().startsWith(q)
    ).map(h => ({ ...h, score: 0 }));

    // Phase 2: Contains the fragment verbatim (near the beginning is better)
    const containsMatches = allHadiths.filter(h => {
        const lower = h.french.toLowerCase();
        return !lower.startsWith(q) && lower.includes(q);
    }).map(h => {
        const index = h.french.toLowerCase().indexOf(q);
        return { ...h, score: 0.1 + (index / h.french.length) * 0.4 };
    });

    // Phase 3: Fuzzy search for near-matches (if we need more results)
    let fuzzyMatches: DetailedHadith[] = [];

    const directMatchIds = new Set([
        ...startsWithMatches.map(h => `${h.bookName}-${h.id}`),
        ...containsMatches.map(h => `${h.bookName}-${h.id}`),
    ]);

    if (startsWithMatches.length + containsMatches.length < maxResults) {
        const fuse = new Fuse(allHadiths, {
            keys: ['french'],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 3,
            ignoreLocation: false,
            distance: 200,
        });

        const fuseResults = fuse.search(fragment);

        fuzzyMatches = fuseResults
            .filter(r => !directMatchIds.has(`${r.item.bookName}-${r.item.id}`))
            .slice(0, maxResults)
            .map(r => ({
                ...r.item,
                score: 0.5 + (r.score || 0),
            }));
    }

    // Combine all results sorted by score
    const combined = [
        ...startsWithMatches,
        ...containsMatches.sort((a, b) => (a.score || 0) - (b.score || 0)),
        ...fuzzyMatches,
    ];

    return combined.slice(0, maxResults);
}
