'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SURAHS, type Surah } from '@/lib/quran-data';

interface SurahListProps {
    onSelectSurah: (surah: Surah) => void;
}

export function SurahList({ onSelectSurah }: SurahListProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return SURAHS;
        return SURAHS.filter(
            (s) =>
                s.nameFr.toLowerCase().includes(q) ||
                s.nameSimple.toLowerCase().includes(q) ||
                s.nameArabic.includes(q) ||
                String(s.id).includes(q)
        );
    }, [query]);

    return (
        <div className="px-4 pt-4">
            <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une sourate..."
                    className="w-full rounded-2xl border border-border/60 bg-card py-3 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2"
                />
            </div>

            <div className="flex flex-col gap-2 pb-32">
                {filtered.map((surah) => (
                    <button
                        key={surah.id}
                        type="button"
                        onClick={() => onSelectSurah(surah)}
                        className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
                    >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {surah.id}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{surah.nameFr}</span>
                            <span className="block text-xs text-muted-foreground">
                                {surah.versesCount} versets · {surah.revelationPlace === 'makkah' ? 'Mecquoise' : 'Médinoise'}
                            </span>
                        </span>
                        <span className="shrink-0 text-lg font-semibold text-muted-foreground [font-family:var(--font-arabic,serif)]">
                            {surah.nameArabic}
                        </span>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">Aucune sourate trouvée.</p>
                )}
            </div>
        </div>
    );
}
