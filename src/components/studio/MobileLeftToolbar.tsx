'use client';

import React from 'react';
import {
    Image as ImageIcon,
    Upload,
    Share2,
    Download,
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
    const btnBase = "w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-black/30 backdrop-blur-xl text-white border border-white/10 active:scale-95 transition-all";

    return (
        <div
            className="fixed left-4 z-30 flex flex-col gap-3 md:hidden pointer-events-auto"
            style={{ top: 'calc(50% + max(0px, env(safe-area-inset-top) / 2))', transform: 'translateY(-50%)' }}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onRandom(); }}
                className={btnBase}
                aria-label="Image au hasard"
            >
                <ImageIcon className="w-5 h-5" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onUpload(); }}
                className={btnBase}
                aria-label="Importer une image"
            >
                <Upload className="w-5 h-5" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
                className={cn(
                    btnBase,
                    isLiked && "bg-red-500/80 border-red-400/30 shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                )}
                aria-label="Ajouter aux favoris"
            >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className={btnBase}
                aria-label="Partager"
            >
                <Share2 className="w-5 h-5" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDownload(); }}
                className={btnBase}
                aria-label="Télécharger"
            >
                <Download className="w-5 h-5" />
            </button>
        </div>
    );
}
