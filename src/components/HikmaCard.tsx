"use client"

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
        <div className="w-full h-full flex flex-col items-center justify-between py-12 px-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={hikma.arabe}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                >
                    {hikma.arabe && (
                        <p className="text-4xl leading-relaxed font-arabic" dir="rtl">
                            {hikma.arabe}
                        </p>
                    )}
                    <div className="w-16 h-px bg-current opacity-20" />
                    <p className="text-lg leading-relaxed max-w-md">
                        {hikma.fr}
                    </p>
                    <p className="text-sm opacity-60 mt-4">
                        {hikma.source}
                    </p>
                </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-8 justify-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 bg-white/50 backdrop-blur-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log("Favorite clicked");
                        onFavorite?.();
                    }}
                >
                    <Heart className={cn("w-5 h-5 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-slate-400")} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 bg-white/50 backdrop-blur-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log("Download clicked");
                        onDownload?.();
                    }}
                >
                    <Download className="w-5 h-5" />
                </Button>
                <Button
                    className="rounded-full h-12 px-6 bg-purple-400 hover:bg-purple-500 shadow-lg text-white"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log("Share clicked");
                        onShare?.();
                    }}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Partager
                </Button>
            </div>
        </div>
    )
}
