"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface Hikma {
    arabe: string;
    fr: string;
    translit?: string;
    source: string;
}

interface HikmaCardProps {
    hikma: Hikma;
    isLiked?: boolean;
    onFavorite?: () => void;
    onShare?: () => void;
    onDownload?: () => void;
}

export function HikmaCard({ hikma, isLiked, onFavorite, onShare, onDownload }: HikmaCardProps) {
    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-emerald-200/20 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 overflow-hidden rounded-[2.5rem]">
            <CardContent className="pt-16 pb-20 px-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={hikma.arabe}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-emerald-50 font-arabic leading-relaxed">
                            {hikma.arabe}
                        </h1>

                        <div className="space-y-4">
                            <p className="text-xl font-medium text-slate-700 dark:text-slate-200">
                                {hikma.fr}
                            </p>
                            {hikma.translit && (
                                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                                    {hikma.translit}
                                </p>
                            )}
                        </div>

                        <p className="text-xs uppercase tracking-widest font-semibold opacity-60 text-emerald-700 dark:text-emerald-400">
                            {hikma.source}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 mt-12 justify-center">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        onClick={onFavorite}
                    >
                        <Heart className={cn("w-5 h-5 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-slate-400")} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        onClick={onDownload}
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                    <Button
                        className="rounded-full h-12 px-6 bg-emerald-500 hover:bg-emerald-600 shadow-lg"
                        onClick={onShare}
                    >
                        <Share2 className="w-5 h-5 mr-2" />
                        Partager
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
