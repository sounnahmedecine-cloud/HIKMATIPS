'use client';

import { useEffect, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveAssetPath, type LibraryBook } from '@/lib/library-books';

pdfjs.GlobalWorkerOptions.workerSrc = resolveAssetPath('/pdf.worker.min.mjs');

interface PdfReaderProps {
    book: LibraryBook | null;
    onClose: () => void;
}

export default function PdfReader({ book, onClose }: PdfReaderProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pageWidth, setPageWidth] = useState(360);
    const [zoom, setZoom] = useState(1);

    const MIN_ZOOM = 1;
    const MAX_ZOOM = 2.5;
    const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.25).toFixed(2))), []);
    const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.25).toFixed(2))), []);

    useEffect(() => {
        setNumPages(null);
        setPageNumber(1);
        setLoadError(null);
        setZoom(1);
    }, [book?.id]);

    useEffect(() => {
        setZoom(1);
    }, [pageNumber]);

    useEffect(() => {
        const update = () => setPageWidth(Math.min(680, window.innerWidth - 32));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const isOpen = book !== null;

    const goToPrevPage = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
    const goToNextPage = useCallback(() => {
        setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
    }, [numPages]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => { if (zoom === 1) goToNextPage(); },
        onSwipedRight: () => { if (zoom === 1) goToPrevPage(); },
        preventScrollOnSwipe: false,
        trackMouse: false,
        delta: 50,
    });

    return (
        <AnimatePresence>
            {isOpen && book && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md"
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="bg-background w-full h-[92vh] md:max-w-4xl md:rounded-t-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 flex-shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold tracking-tight truncate">{book.title}</h3>
                                {book.author && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={zoom <= MIN_ZOOM}
                                    onClick={zoomOut}
                                    aria-label="Réduire"
                                    className="rounded-full bg-muted/50 hover:bg-muted w-9 h-9 disabled:opacity-30"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={zoom >= MAX_ZOOM}
                                    onClick={zoomIn}
                                    aria-label="Agrandir"
                                    className="rounded-full bg-muted/50 hover:bg-muted w-9 h-9 disabled:opacity-30"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    aria-label="Fermer le lecteur"
                                    className="rounded-full bg-muted/50 hover:bg-muted w-9 h-9"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div
                            {...swipeHandlers}
                            className={cn(
                                'flex-1 flex p-4 bg-muted/10 overflow-y-auto',
                                zoom > 1 ? 'overflow-x-auto justify-start items-start' : 'overflow-x-hidden justify-center items-start'
                            )}
                        >
                            {loadError ? (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <p className="text-sm font-medium">Impossible de charger ce livre.</p>
                                    <p className="text-xs">{loadError}</p>
                                </div>
                            ) : (
                                <Document
                                    file={encodeURI(resolveAssetPath(book.pdfPath))}
                                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                                    onLoadError={(err) => setLoadError(err.message)}
                                    loading={
                                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                    }
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        width={pageWidth * zoom}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                        className="shadow-lg mx-auto"
                                    />
                                </Document>
                            )}
                        </div>

                        <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={pageNumber <= 1}
                                onClick={goToPrevPage}
                                aria-label="Page précédente"
                                className="rounded-full disabled:opacity-30"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {numPages ? `Page ${pageNumber} / ${numPages}` : '—'}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!numPages || pageNumber >= numPages}
                                onClick={goToNextPage}
                                aria-label="Page suivante"
                                className="rounded-full disabled:opacity-30"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
