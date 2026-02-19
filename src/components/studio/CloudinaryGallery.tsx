"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { X, Image as ImageIcon, Star, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CloudinaryGalleryProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
    currentBackground?: string
}

const CATEGORIES = [
    { id: 'all', label: 'Tous', emoji: '✨' },
    { id: 'islamic', label: 'Islamique', emoji: '🕌' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'night', label: 'Cosmos', emoji: '🌙' },
    { id: 'abstract', label: 'Abstraits', emoji: '🎨' },
];

function matchesCategory(hint: string, category: string): boolean {
    const h = hint.toLowerCase();
    switch (category) {
        case 'all': return true;
        case 'islamic':
            return h.includes('islamic') || h.includes('mosque') || h.includes('coran') ||
                   h.includes('islam') || h.includes('kaaba') || h.includes('ramadan') ||
                   h.includes('muslim') || h.includes('musulman') || h.includes('calligraphy');
        case 'nature':
            return h.includes('nature') || h.includes('mountain') || h.includes('ocean') ||
                   h.includes('forest') || h.includes('sun') || h.includes('golden') ||
                   (h.includes('serene') && !h.includes('islamic') && !h.includes('night'));
        case 'night':
            return h.includes('night') || h.includes('stars') || h.includes('galaxy') ||
                   h.includes('astronomy') || h.includes('sky');
        case 'abstract':
            return h.includes('abstract') || h.includes('gradient') ||
                   (h.includes('background') && !h.includes('islamic'));
        default: return false;
    }
}

const isCloudinary = (url: string) => url.includes('cloudinary.com');

export function CloudinaryGallery({ isOpen, onClose, onSelect, currentBackground }: CloudinaryGalleryProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const allImages = PlaceHolderImages;

    const filteredImages = useMemo(() => {
        return allImages.filter(img => matchesCategory(img.imageHint, selectedCategory));
    }, [allImages, selectedCategory]);

    const handleCategoryChange = useCallback((catId: string) => {
        setSelectedCategory(catId);
        // Scroll to top when changing category
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
        setShowScrollTop(false);
    }, []);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            setShowScrollTop(scrollRef.current.scrollTop > 200);
        }
    }, []);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-background flex flex-col"
                >
                    {/* Header compact */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 pt-12 pb-3 bg-background border-b border-border/40">
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Galerie</h3>
                            <p className="text-[11px] text-muted-foreground">
                                {filteredImages.length} fond{filteredImages.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Category Pills — scroll horizontal */}
                    <div className="flex-shrink-0 flex gap-2 px-3 py-2.5 overflow-x-auto bg-background border-b border-border/20"
                         style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                                    selectedCategory === cat.id
                                        ? "bg-emerald-600 text-white"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <span>{cat.emoji}</span>
                                <span>{cat.label}</span>
                                {selectedCategory === cat.id && (
                                    <span className="bg-white/25 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                        {filteredImages.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Grid — scroll natif plein écran */}
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
                        {filteredImages.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm">Aucune image dans cette catégorie.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1.5 p-2">
                                {filteredImages.map((img) => {
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
                        )}
                        {/* Espace en bas pour la navigation */}
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
