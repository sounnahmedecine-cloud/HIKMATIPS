"use client"

import { useState, useEffect, useCallback } from "react"
import { HikmaCard } from "@/components/HikmaCard"
import { motion, AnimatePresence } from "framer-motion"
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getFavorites, toggleFavorite } from "@/lib/utils"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    },
    {
        arabe: "فَاصْبِرْ صَبْرًا جَمِيلًا",
        fr: "Endure d'une belle patience.",
        source: "Sourate Al-Ma'arij 70:5"
    },
    {
        arabe: "وَقُولُوا لِلنَّاسِ حُسْنًا",
        fr: "Et parlez aux gens avec bonté.",
        source: "Sourate Al-Baqarah 2:83"
    }
];

export function HomeScreen() {
    const [currentHikma, setCurrentHikma] = useState(MOCK_HIKMAS[0]);
    const [background, setBackground] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const cloudinaryImages = PlaceHolderImages.filter(img =>
        img.imageUrl.includes('cloudinary.com') ||
        img.imageUrl.includes('dzagwz94z') ||
        img.imageUrl.includes('dhjwimevi') ||
        img.imageUrl.includes('db2ljqpdt')
    );

    const handleShuffle = useCallback(() => {
        // Pick random content that isn't the current one if possible
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * MOCK_HIKMAS.length);
        } while (MOCK_HIKMAS.length > 1 && MOCK_HIKMAS[nextIndex].fr === currentHikma.fr);

        setCurrentHikma(MOCK_HIKMAS[nextIndex]);

        // Pick random background
        if (cloudinaryImages.length > 0) {
            let nextBgIndex;
            do {
                nextBgIndex = Math.floor(Math.random() * cloudinaryImages.length);
            } while (cloudinaryImages.length > 1 && cloudinaryImages[nextBgIndex].imageUrl === background);
            setBackground(cloudinaryImages[nextBgIndex].imageUrl);
        }
    }, [currentHikma, background, cloudinaryImages]);

    useEffect(() => {
        setFavorites(getFavorites().map(f => f.fr));

        // Initial setup based on date
        const today = new Date();
        const dateSeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();

        const dailyIndex = dateSeed % MOCK_HIKMAS.length;
        setCurrentHikma(MOCK_HIKMAS[dailyIndex]);

        if (cloudinaryImages.length > 0) {
            const bgIndex = dateSeed % cloudinaryImages.length;
            setBackground(cloudinaryImages[bgIndex].imageUrl);
        }
    }, []);

    const handleFavorite = (hikma: any) => {
        const isLiked = toggleFavorite(hikma);
        setFavorites(prev => isLiked ? [...prev, hikma.fr] : prev.filter(f => f !== hikma.fr));
    };

    const handleShare = async () => {
        const previewEl = document.getElementById(`hikma-card-main`);
        if (!previewEl) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(previewEl, {
                useCORS: true,
                allowTaint: false,
                scale: 3,
                backgroundColor: null,
            });

            const base64Data = canvas.toDataURL('image/png').split(',')[1];
            const fileName = `hikma_share_${Date.now()}.png`;

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: 'Hikma du jour',
                text: `${currentHikma.fr} - ${currentHikma.source}`,
                files: [savedFile.uri],
            });
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Le partage a échoué.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        const previewEl = document.getElementById(`hikma-card-main`);
        if (!previewEl) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(previewEl, {
                useCORS: true,
                allowTaint: false,
                scale: 3,
                backgroundColor: null,
            });

            const dataUrl = canvas.toDataURL('image/png');

            if (window.hasOwnProperty('Capacitor')) {
                const base64Data = dataUrl.split(',')[1];
                const fileName = `hikma_${Date.now()}.png`;

                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });

                toast({ title: "Succès", description: "Image enregistrée !" });
            } else {
                const link = document.createElement('a');
                link.download = `hikma_${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Le téléchargement a échoué.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden pt-12 pb-24 bg-slate-50 dark:bg-slate-950">
            {/* Header Title */}
            <div className="text-center space-y-1 z-20 px-6">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-[0.2em] uppercase font-display drop-shadow-sm">
                    Inspiration Hikma
                </h2>
                <div className="w-12 h-1 bg-purple-400 mx-auto rounded-full" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col justify-center items-center relative z-10 px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentHikma.fr + background}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full h-full max-w-sm flex items-center justify-center"
                    >
                        <div id="hikma-card-main" className="w-full h-[65vh] shadow-2xl rounded-[40px] overflow-hidden">
                            <HikmaCard
                                hikma={currentHikma}
                                background={background}
                                isLiked={favorites.includes(currentHikma.fr)}
                                onFavorite={() => handleFavorite(currentHikma)}
                                onShare={handleShare}
                                onDownload={handleDownload}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Shuffle Button Button */}
            <div className="z-20 flex flex-col items-center gap-3">
                <Button
                    onClick={handleShuffle}
                    className="group relative flex items-center gap-2 bg-white dark:bg-purple-900 border-2 border-purple-400 hover:bg-purple-400 hover:text-white dark:hover:bg-purple-400 text-purple-500 dark:text-purple-200 font-bold px-8 py-6 rounded-full shadow-xl transition-all active:scale-95"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-lg">Nouvelle Inspiration</span>

                    {/* Floating Sparkles for effect */}
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-purple-400 animate-pulse" />
                </Button>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Contenu & Design Aléatoire
                </p>
            </div>
        </div>
    )
}
