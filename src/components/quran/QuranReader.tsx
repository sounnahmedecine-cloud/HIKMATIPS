'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    RECITERS,
    getMushafPageImageUrl,
    getSurahAudioUrl,
    resolveQuranAssetPath,
    type Surah,
} from '@/lib/quran-data';

interface QuranReaderProps {
    surah: Surah | null;
    onClose: () => void;
}

const AMBIANCE_BACKGROUND = '/hero-aube.png';

export default function QuranReader({ surah, onClose }: QuranReaderProps) {
    const [pageNumber, setPageNumber] = useState(1);
    const [direction, setDirection] = useState(1);
    const [imageLoading, setImageLoading] = useState(true);
    const [reciterId, setReciterId] = useState(RECITERS[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const isOpen = surah !== null;

    useEffect(() => {
        if (!surah) return;
        setPageNumber(surah.startPage);
        setImageLoading(true);
        setIsPlaying(false);
        setAudioLoading(false);
    }, [surah?.id]);

    useEffect(() => {
        setImageLoading(true);
    }, [pageNumber]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setIsPlaying(false);
    }, [reciterId, surah?.id]);

    const goToPrevPage = useCallback(() => {
        if (!surah) return;
        setDirection(-1);
        setPageNumber((p) => Math.max(surah.startPage, p - 1));
    }, [surah]);

    const goToNextPage = useCallback(() => {
        if (!surah) return;
        setDirection(1);
        setPageNumber((p) => Math.min(surah.endPage, p + 1));
    }, [surah]);

    const togglePlayback = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            setAudioLoading(true);
            audio.play().catch(() => setAudioLoading(false));
        }
    }, [isPlaying]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => goToNextPage(),
        onSwipedRight: () => goToPrevPage(),
        preventScrollOnSwipe: false,
        trackMouse: false,
        delta: 50,
    });

    const pageVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, rotateY: dir > 0 ? -14 : 14 }),
        center: { x: 0, opacity: 1, rotateY: 0 },
        exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, rotateY: dir > 0 ? 10 : -10 }),
    };

    return (
        <AnimatePresence>
            {isOpen && surah && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50"
                    style={{
                        backgroundImage: `linear-gradient(rgba(6,10,20,0.35), rgba(6,10,20,0.55)), url(${resolveQuranAssetPath(AMBIANCE_BACKGROUND)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <audio
                        ref={audioRef}
                        src={getSurahAudioUrl(reciterId, surah.id)}
                        preload="none"
                        onCanPlay={() => setAudioLoading(false)}
                        onPlaying={() => { setIsPlaying(true); setAudioLoading(false); }}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />

                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="bg-background/92 backdrop-blur-md w-full h-[92vh] md:max-w-4xl md:rounded-t-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 flex-shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold tracking-tight truncate">{surah.nameFr}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Sourate {surah.id} · {surah.nameArabic}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Fermer le lecteur"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted/50 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div
                            {...swipeHandlers}
                            className="flex-1 flex items-start justify-center overflow-y-auto p-4"
                        >
                            <div style={{ perspective: 1200 }} className="relative">
                                {imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                                <AnimatePresence mode="wait" custom={direction} initial={false}>
                                    <motion.img
                                        key={pageNumber}
                                        src={getMushafPageImageUrl(pageNumber)}
                                        alt={`Page ${pageNumber} du Mushaf`}
                                        custom={direction}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.28, ease: 'easeOut' }}
                                        style={{ transformOrigin: direction > 0 ? 'left center' : 'right center' }}
                                        onLoad={() => setImageLoading(false)}
                                        className="max-h-[60vh] w-auto mx-auto rounded-lg shadow-lg"
                                    />
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="px-4 pt-2 pb-1 flex items-center justify-center gap-1.5 flex-shrink-0">
                            {RECITERS.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setReciterId(r.id)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                                        reciterId === r.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                    )}
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>

                        <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between flex-shrink-0">
                            <button
                                onClick={goToPrevPage}
                                disabled={pageNumber <= surah.startPage}
                                aria-label="Page précédente"
                                className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <button
                                onClick={togglePlayback}
                                aria-label={isPlaying ? 'Mettre en pause' : 'Écouter la récitation'}
                                className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
                            >
                                {audioLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={goToNextPage}
                                disabled={pageNumber >= surah.endPage}
                                aria-label="Page suivante"
                                className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="pb-3 text-center text-[11px] text-muted-foreground">
                            Page {pageNumber} / {surah.endPage}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
