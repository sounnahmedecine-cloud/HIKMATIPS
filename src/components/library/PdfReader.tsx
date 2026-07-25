'use client';

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    useEffect(() => {
        setNumPages(null);
        setPageNumber(1);
        setLoadError(null);
    }, [book?.id]);

    useEffect(() => {
        const update = () => setPageWidth(Math.min(680, window.innerWidth - 32));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const isOpen = book !== null;

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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                aria-label="Fermer le lecteur"
                                className="rounded-full bg-muted/50 hover:bg-muted w-9 h-9 flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto flex items-start justify-center p-4 bg-muted/10">
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
                                        width={pageWidth}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                        className="shadow-lg"
                                    />
                                </Document>
                            )}
                        </div>

                        <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
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
                                onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p))}
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
