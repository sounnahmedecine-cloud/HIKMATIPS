"use client"

import { useState, useCallback, useRef } from "react"
import { X, ChevronUp, Star } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CloudinaryGalleryProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
    currentBackground?: string
}

const isCloudinary = (url: string) => url.includes('cloudinary.com');

export function CloudinaryGallery({ isOpen, onClose, onSelect, currentBackground }: CloudinaryGalleryProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const allImages = PlaceHolderImages;

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            setShowScrollTop(scrollRef.current.scrollTop > 200);
        }
    }, []);

    const scrollToTop = useCallback(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-background flex flex-col"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 pt-12 pb-3 bg-background border-b border-border/40">
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Galerie</h3>
                            <p className="text-[11px] text-muted-foreground">
                                {allImages.length} fond{allImages.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Grid — toutes les images, scroll natif */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-scroll"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            overscrollBehavior: 'contain',
                            paddingBottom: 'env(safe-area-inset-bottom)',
                        }}
                    >
                        <div className="grid grid-cols-3 gap-1.5 p-2">
                            {allImages.map((img) => {
                                const isActive = currentBackground === img.imageUrl;
                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => { onSelect(img.imageUrl); onClose(); }}
                                        className={cn(
                                            "relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer active:opacity-70 transition-opacity",
                                            isActive && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background"
                                        )}
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt={img.description}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {/* Dark overlay */}
                                        <div className="absolute inset-0 bg-black/20" />

                                        {/* Active badge */}
                                        {isActive && (
                                            <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                                                ✓
                                            </div>
                                        )}

                                        {/* Premium star */}
                                        {isCloudinary(img.imageUrl) && (
                                            <div className="absolute top-1.5 right-1.5">
                                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 drop-shadow" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-6" />
                    </div>

                    {/* Bouton scroll to top */}
                    <AnimatePresence>
                        {showScrollTop && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={scrollToTop}
                                className="absolute bottom-8 right-4 w-10 h-10 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center z-10"
                            >
                                <ChevronUp className="w-5 h-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
