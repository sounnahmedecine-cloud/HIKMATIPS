'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Upload,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLeftToolbarProps {
    onRandom: () => void;
    onUpload: () => void;
}

export function MobileLeftToolbar({ onRandom, onUpload }: MobileLeftToolbarProps) {
    return (
        <div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-6 md:hidden pointer-events-auto"
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRandom();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-emerald-600 text-white border-2 border-emerald-400 active:scale-95 transition-all"
                aria-label="Image au hasard"
            >
                <ImageIcon className="w-7 h-7" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onUpload();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-emerald-600 text-white border-2 border-emerald-400 active:scale-95 transition-all"
                aria-label="Importer une image"
            >
                <Upload className="w-7 h-7" />
            </button>
        </div>
    );
}
