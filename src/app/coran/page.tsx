'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { HikmaLibraryHeader } from '@/components/HikmaLibraryHeader';
import { HikmaAppDock } from '@/components/HikmaAppDock';
import { SurahList } from '@/components/quran/SurahList';
import type { Surah } from '@/lib/quran-data';

const QuranReader = dynamic(() => import('@/components/quran/QuranReader'), { ssr: false });

export default function CoranPage() {
  const [openSurah, setOpenSurah] = useState<Surah | null>(null);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      <HikmaLibraryHeader active="quran" />

      <main className="relative mx-auto -mt-4 min-h-[calc(100vh-158px)] max-w-2xl rounded-t-[30px] bg-[#FBFAF7] pb-32">
        <SurahList onSelectSurah={setOpenSurah} />
      </main>

      <HikmaAppDock active="library" />

      <QuranReader surah={openSurah} onClose={() => setOpenSurah(null)} />
    </div>
  );
}
