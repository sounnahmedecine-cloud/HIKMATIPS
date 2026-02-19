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
    background?: string;
    onFavorite?: () => void;
    onShare?: () => void;
    onDownload?: () => void;
}

export function HikmaCard({ hikma, isLiked, background, onFavorite, onShare, onDownload }: HikmaCardProps) {
    return (
        <div className="w-full h-full relative flex flex-col items-center justify-between py-16 px-6 overflow-hidden rounded-[40px] shadow-2xl bg-black">
            {/* Background Image */}
            {background && (
                <img
                    src={background}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    crossOrigin="anonymous"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={hikma.fr}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center"
                    >
                        {hikma.arabe && (
                            <p className="text-4xl sm:text-5xl leading-relaxed font-arabic text-white mb-8 drop-shadow-md" dir="rtl">
                                {hikma.arabe}
                            </p>
                        )}
                        <div className="w-16 h-1 bg-white/30 rounded-full mb-8" />
                        <p className="text-xl sm:text-2xl font-medium leading-relaxed max-w-md text-white drop-shadow-md">
                            {hikma.fr}
                        </p>
                        <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase opacity-60 mt-8 text-white/80">
                            — {hikma.source} —
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 flex gap-6 mb-4 justify-center items-center w-full">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 border-white/20 hover:bg-white/10 bg-black/20 backdrop-blur-md shadow-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        onFavorite?.();
                    }}
                >
                    <Heart className={cn("w-6 h-6 transition-colors", isLiked ? "fill-emerald-500 text-emerald-500" : "text-white/70")} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 border-white/20 hover:bg-white/10 bg-black/20 backdrop-blur-md shadow-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        onDownload?.();
                    }}
                >
                    <Download className="w-6 h-6 text-white/70" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 border-white/20 hover:bg-white/10 bg-black/20 backdrop-blur-md shadow-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        onShare?.();
                    }}
                >
                    <Share2 className="w-6 h-6 text-white/70" />
                </Button>
            </div>
        </div>
    )
}
