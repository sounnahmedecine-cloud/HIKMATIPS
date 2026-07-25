'use client';

import { motion } from 'framer-motion';
import { LIBRARY_BOOKS, resolveAssetPath, type LibraryBook } from '@/lib/library-books';

interface BookShelfProps {
    onSelectBook: (book: LibraryBook) => void;
}

const BACKGROUND_PATH = '/bibilio/bibilotehque virutel.png';

// Percentages of the 941x1672 background image. Measured from the actual shelf-board
// edges (brightness transitions) rather than eyeballed, so book bottoms rest flush on
// each board's top surface (the "floor" of each compartment).
const SHELF_SLOTS: Record<0 | 1 | 2, { top: string; height: string }> = {
    0: { top: '27.9%', height: '12.8%' },
    1: { top: '42.0%', height: '12.6%' },
    2: { top: '56.2%', height: '12.5%' },
};

// Horizontal position of each of the 3 books within a shelf row (percent of width,
// centered on each third of the usable compartment span).
const SLOT_LEFT: Record<0 | 1 | 2, string> = {
    0: '16%',
    1: '42%',
    2: '68%',
};

export function BookShelf({ onSelectBook }: BookShelfProps) {
    return (
        <div className="relative w-full aspect-[941/1672]">
            <img
                src={resolveAssetPath(BACKGROUND_PATH)}
                alt="Étagère de la bibliothèque"
                className="absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
                draggable={false}
            />

            {LIBRARY_BOOKS.map((book) => {
                const shelf = SHELF_SLOTS[book.shelfIndex];
                const left = SLOT_LEFT[book.slotIndex];
                return (
                    <motion.button
                        key={book.id}
                        type="button"
                        onClick={() => onSelectBook(book)}
                        aria-label={book.title}
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ y: -4 }}
                        className="absolute flex items-end justify-center w-[22%]"
                        style={{ top: shelf.top, height: shelf.height, left }}
                    >
                        <img
                            src={resolveAssetPath(book.coverPath)}
                            alt={book.title}
                            className="h-full w-auto max-w-full object-contain"
                            style={{ filter: 'drop-shadow(0 8px 6px rgba(0,0,0,.45))' }}
                            draggable={false}
                        />
                    </motion.button>
                );
            })}
        </div>
    );
}
