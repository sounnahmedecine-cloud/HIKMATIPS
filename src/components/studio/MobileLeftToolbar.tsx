'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Upload,
    Share2,
    Download,
    ChevronUp,
    Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLeftToolbarProps {
    onRandom: () => void;
    onUpload: () => void;
    onShare: () => void;
    onDownload: () => void;
    onFavorite?: () => void;
    isLiked?: boolean;
}

export function MobileLeftToolbar({ onRandom, onUpload, onShare, onDownload, onFavorite, isLiked }: MobileLeftToolbarProps) {
    return (
        <div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 md:hidden pointer-events-auto"
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRandom();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-purple-500 text-white border-2 border-purple-400 active:scale-95 transition-all"
                aria-label="Image au hasard"
            >
                <ImageIcon className="w-7 h-7" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onUpload();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-purple-500 text-white border-2 border-purple-400 active:scale-95 transition-all"
                aria-label="Importer une image"
            >
                <Upload className="w-7 h-7" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.();
                }}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-2 active:scale-95 transition-all text-white",
                    isLiked ? "bg-red-500 border-red-400" : "bg-purple-500 border-purple-400"
                )}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-pink-600 text-white border-2 border-pink-400 active:scale-95 transition-all"
                aria-label="Partager"
            >
                <Share2 className="w-7 h-7" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-blue-600 text-white border-2 border-blue-400 active:scale-95 transition-all"
                aria-label="Télécharger"
            >
                <Download className="w-7 h-7" />
            </button>
        </div>
    );
}
