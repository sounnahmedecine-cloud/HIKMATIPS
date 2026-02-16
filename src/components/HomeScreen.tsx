"use client"

import { useState, useEffect } from "react"
// ...
import { useSwipeable } from "react-swipeable"
import { HikmaCard } from "@/components/HikmaCard"
import { motion, AnimatePresence } from "framer-motion"

const MOCK_HIKMAS = [
    {
        arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        fr: "À côté de la difficulté est, certes, une facilité.",
        source: "Sourate Ash-Sharh 94:6"
    },
    {
        arabe: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        fr: "Louange à Allah, Seigneur de l'univers.",
        source: "Sourate Al-Fatiha 1:2"
    },
    {
        arabe: "وَتَوَكَّلْ عَلَى الْعَيِّ الْقَيُّومِ",
        fr: "Et place ta confiance en le Vivant qui ne meurt jamais.",
        source: "Sourate Al-Furqan 25:58"
    }
];

import { getFavorites, toggleFavorite } from "@/lib/utils"

export function HomeScreen() {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        setFavorites(getFavorites().map(f => f.fr));
    }, []);

    const handleFavorite = (hikma: any) => {
        const isLiked = toggleFavorite(hikma);
        setFavorites(prev => isLiked ? [...prev, hikma.fr] : prev.filter(f => f !== hikma.fr));
    };

    const nextHikma = () => {
        setDirection(1);
        setIndex((prev) => (prev + 1) % MOCK_HIKMAS.length);
    };

    const prevHikma = () => {
        setDirection(-1);
        setIndex((prev) => (prev - 1 + MOCK_HIKMAS.length) % MOCK_HIKMAS.length);
    };

    const handlers = useSwipeable({
        onSwipedLeft: nextHikma,
        onSwipedRight: prevHikma,
        trackMouse: true
    });

    return (
        <div {...handlers} className="h-full w-full flex flex-col justify-center items-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full h-full flex items-center justify-center p-4"
                >
                    <HikmaCard
                        hikma={MOCK_HIKMAS[index]}
                        isLiked={favorites.includes(MOCK_HIKMAS[index].fr)}
                        onFavorite={() => handleFavorite(MOCK_HIKMAS[index])}
                        onShare={() => console.log("Share", index)}
                        onDownload={() => console.log("Download", index)}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Pagination Indicators */}
            <div className="absolute bottom-32 flex gap-2">
                {MOCK_HIKMAS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-emerald-500 w-4' : 'bg-slate-300 dark:bg-slate-700'}`}
                    />
                ))}
            </div>
        </div>
    )
}
