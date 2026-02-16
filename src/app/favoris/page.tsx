"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, Trash2, Bookmark } from "lucide-react"
import { getFavorites, toggleFavorite, Hikma } from "@/lib/utils"

export default function FavorisPage() {
    const [favorites, setFavorites] = useState<Hikma[]>([]);

    useEffect(() => {
        setFavorites(getFavorites());
    }, []);

    const handleRemove = (hikma: Hikma) => {
        toggleFavorite(hikma);
        setFavorites(getFavorites());
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-32">
            <header className="text-center pt-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-purple-50 tracking-tight">
                    Mes <span className="text-purple-400">Favoris</span>
                </h1>
                <p className="text-slate-500 mt-2">Tes pépites de sagesse enregistrées</p>
            </header>

            <AnimatePresence mode="popLayout">
                {favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                    >
                        <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Aucun favori pour le moment.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {favorites.map((hikma, idx) => (
                            <motion.div
                                key={hikma.fr}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-lg font-arabic text-purple-600 dark:text-purple-400 leading-relaxed line-clamp-1">
                                                {hikma.arabe}
                                            </p>
                                            <p className="text-slate-700 dark:text-slate-200 font-medium line-clamp-2">
                                                {hikma.fr}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                                    {hikma.source}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="p-3 text-slate-500 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
                                                onClick={() => handleRemove(hikma)}
                                                aria-label="Supprimer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-3 text-slate-500 hover:text-purple-600 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
                                                aria-label="Partager"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
