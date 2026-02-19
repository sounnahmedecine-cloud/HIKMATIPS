"use client"

import { useState, useMemo } from "react"
import { X, Image as ImageIcon, Star } from "lucide-react"
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
    { id: 'night', label: 'Nuit & Cosmos', emoji: '🌙' },
    { id: 'abstract', label: 'Abstraits', emoji: '🎨' },
];

function matchesCategory(hint: string, category: string): boolean {
    const h = hint.toLowerCase();
    switch (category) {
        case 'all':
            return true;
        case 'islamic':
            return h.includes('islamic') || h.includes('mosque') || h.includes('coran') ||
                   h.includes('islam') || h.includes('kaaba') || h.includes('ramadan') ||
                   h.includes('muslim') || h.includes('musulman') || h.includes('calligraphy');
        case 'nature':
            return h.includes('nature') || h.includes('mountain') || h.includes('ocean') ||
                   h.includes('forest') || h.includes('sun') || h.includes('golden') ||
                   (h.includes('serene') && !h.includes('islamic') && !h.includes('night') && !h.includes('abstract'));
        case 'night':
            return h.includes('night') || h.includes('stars') || h.includes('galaxy') ||
                   h.includes('astronomy') || h.includes('sky');
        case 'abstract':
            return h.includes('abstract') || h.includes('gradient') ||
                   (h.includes('background') && !h.includes('islamic'));
        default:
            return false;
    }
}

const isCloudinary = (url: string) =>
    url.includes('cloudinary.com') ||
    url.includes('dzagwz94z') ||
    url.includes('dhjwimevi') ||
    url.includes('db2ljqpdt') ||
    url.includes('dk93srhfb');

export function CloudinaryGallery({ isOpen, onClose, onSelect, currentBackground }: CloudinaryGalleryProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const allImages = PlaceHolderImages;

    const filteredImages = useMemo(() => {
        return allImages.filter(img => matchesCategory(img.imageHint, selectedCategory));
    }, [allImages, selectedCategory]);

    const cloudinaryCount = allImages.filter(img => isCloudinary(img.imageUrl)).length;

    return (
        <AnimatePresence>
            {isOpen && (
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
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="bg-background w-full h-[92vh] md:max-w-4xl md:rounded-t-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border/50 flex items-center justify-between bg-card/50 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Galerie d'images</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} disponible{filteredImages.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full bg-muted/50 hover:bg-muted w-9 h-9"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Category Tabs */}
                        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-border/30 bg-muted/10 flex-shrink-0">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0",
                                        selectedCategory === cat.id
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                            : "bg-background text-muted-foreground border border-border hover:border-emerald-600/40 hover:text-foreground"
                                    )}
                                >
                                    <span>{cat.emoji}</span>
                                    <span>{cat.label}</span>
                                    {selectedCategory === cat.id && (
                                        <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                                            {filteredImages.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Image Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filteredImages.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ImageIcon className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Aucune image dans cette catégorie.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filteredImages.map((img) => {
                                        const isPremium = isCloudinary(img.imageUrl);
                                        const isActive = currentBackground === img.imageUrl;
                                        return (
                                            <motion.div
                                                key={img.id}
                                                whileTap={{ scale: 0.97 }}
                                                className={cn(
                                                    "relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-md transition-all",
                                                    isActive && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                                                )}
                                                onClick={() => { onSelect(img.imageUrl); onClose(); }}
                                            >
                                                <img
                                                    src={img.imageUrl}
                                                    alt={img.description}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />

                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/70 opacity-80 group-hover:opacity-100 transition-opacity" />

                                                {/* Premium badge */}
                                                {isPremium && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="bg-amber-400/90 backdrop-blur-sm rounded-full p-1">
                                                            <Star className="w-2.5 h-2.5 text-amber-900 fill-amber-900" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Active indicator */}
                                                {isActive && (
                                                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        Actuel
                                                    </div>
                                                )}

                                                {/* Bottom description */}
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <p className="text-[10px] text-white/90 font-medium line-clamp-2 leading-tight">
                                                        {img.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">{cloudinaryCount}</span> images Premium HD
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {allImages.length} images au total
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
