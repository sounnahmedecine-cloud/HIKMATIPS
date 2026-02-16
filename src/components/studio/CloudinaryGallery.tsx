"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion, AnimatePresence } from "framer-motion"

interface CloudinaryGalleryProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
}

export function CloudinaryGallery({ isOpen, onClose, onSelect }: CloudinaryGalleryProps) {
    const cloudinaryImages = PlaceHolderImages.filter(img => img.imageUrl.includes('cloudinary'))

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-background border border-border w-full max-w-2xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-4 border-b flex items-center justify-between bg-card">
                            <div>
                                <h3 className="text-xl font-bold font-display">Galerie Hikma</h3>
                                <p className="text-xs text-muted-foreground">Choisissez une image d'arrière-plan premium</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {cloudinaryImages.map((img) => (
                                    <motion.div
                                        key={img.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all"
                                        onClick={() => onSelect(img.imageUrl)}
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt={img.description}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-white font-medium truncate">{img.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border-t text-center">
                            <p className="text-[11px] text-muted-foreground italic">
                                Toutes ces images sont optimisées pour vos rappels spirituels.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
