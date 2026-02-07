export interface DetailedHadith {
    id: number;
    hadithNumber?: number;
    french: string;
    source: string;
    reference: {
        book?: number;
        hadith?: number;
    };
}

export interface HadithBook {
    hadiths: DetailedHadith[];
}

const BOOKS = ['abudawud', 'bukhari', 'ibnmajah', 'malik', 'muslim', 'nasai'];

export async function searchHadiths(query: string): Promise<DetailedHadith[]> {
    if (!query || query.length < 3) return [];

    const results: DetailedHadith[] = [];
    const q = query.toLowerCase();

    for (const bookName of BOOKS) {
        try {
            const response = await fetch(`/data/hadiths/${bookName}.json`);
            if (!response.ok) continue;

            const data: HadithBook = await response.json();
            const matches = data.hadiths.filter(h =>
                h.french.toLowerCase().includes(q)
            );

            results.push(...matches.slice(0, 20)); // Limit per book to avoid too many results

            if (results.length >= 100) break;
        } catch (error) {
            console.error(`Error searching in ${bookName}:`, error);
        }
    }

    return results;
}
