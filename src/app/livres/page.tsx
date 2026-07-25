'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { HikmaLibraryHeader } from '@/components/HikmaLibraryHeader';
import { HikmaAppDock } from '@/components/HikmaAppDock';
import { BookShelf } from '@/components/library/BookShelf';
import type { LibraryBook } from '@/lib/library-books';

const PdfReader = dynamic(() => import('@/components/library/PdfReader'), { ssr: false });

export default function LivresPage() {
  const [openBook, setOpenBook] = useState<LibraryBook | null>(null);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      <HikmaLibraryHeader active="books" />

      <main className="relative mx-auto -mt-4 min-h-[calc(100vh-158px)] max-w-2xl pb-32">
        <BookShelf onSelectBook={setOpenBook} />
      </main>

      <HikmaAppDock active="library" />

      <PdfReader book={openBook} onClose={() => setOpenBook(null)} />
    </div>
  );
}
