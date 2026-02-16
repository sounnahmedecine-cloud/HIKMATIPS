"use client"

import { useState } from "react"
import { X, Check, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CloudinaryGalleryProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
}

const CATEGORIES = [
    { id: 'all', label: 'Tous' },
    { id: 'light', label: 'Légers' },
    { id: 'dark', label: 'Sombres' },
    { id: 'color', label: 'Colorés' },
    { id: 'abstract', label: 'Abstraits' },
    { id: 'nature', label: 'Nature' },
];

export function CloudinaryGallery({ isOpen, onClose, onSelect }: CloudinaryGalleryProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Improved cloudinary filter
    const cloudinaryImages = PlaceHolderImages.filter(img =>
        img.imageUrl.includes('cloudinary.com') ||
        img.imageUrl.includes('dzagwz94z') ||
        img.imageUrl.includes('dhjwimevi') ||
        img.imageUrl.includes('db2ljqpdt')
    );

    const filteredImages = cloudinaryImages.filter(img => {
        if (selectedCategory === 'all') return true;
        const hint = img.imageHint.toLowerCase();
        if (selectedCategory === 'dark') return hint.includes('night') || hint.includes('dark');
        if (selectedCategory === 'light') return hint.includes('light') || hint.includes('white') || hint.includes('soft');
        return hint.includes(selectedCategory);
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-0 bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-background w-full h-full md:max-w-4xl md:h-[90vh] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50">
                            <div>
                                <h3 className="text-2xl font-black font-display tracking-tight">Thèmes Premium</h3>
                                <p className="text-sm text-muted-foreground">Sélectionnez votre ambiance spirituelle</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full bg-muted/50 hover:bg-muted"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Category Selector */}
                        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-border/30 bg-muted/10">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2",
                                        selectedCategory === cat.id
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-background text-muted-foreground border-border hover:border-muted-foreground/30"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Image Grid */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredImages.map((img) => (
                                    <motion.div
                                        key={img.id}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative aspect-[9/16] rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all"
                                        onClick={() => onSelect(img.imageUrl)}
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt={img.description}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/60 opacity-60" />

                                        {/* Overlay content */}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest truncate mb-1">
                                                {img.id.split('-')[0]}
                                            </p>
                                            <p className="text-xs text-white font-medium line-clamp-2 leading-tight">
                                                {img.description}
                                            </p>
                                        </div>

                                        {/* Selection indicator if active (could be added) */}
                                    </motion.div>
                                ))}
                            </div>

                            {filteredImages.length === 0 && (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ImageIcon className="w-12 h-12 mb-2" />
                                    <p>Aucune image dans cette catégorie.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted/30 border-t flex items-center justify-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 overflow-hidden">
                                        <img src={cloudinaryImages[i]?.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                                +{cloudinaryImages.length} images premium exclusives en HD
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
