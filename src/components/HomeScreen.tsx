"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getFavorites, toggleFavorite } from "@/lib/utils"
import {
    Sparkles,
    RefreshCw,
    Image as ImageIcon,
    Upload,
    Heart,
    Share2,
    Download,
    X,
    LayoutGrid,
    Crown,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CloudinaryGallery } from "@/components/studio/CloudinaryGallery"
import { CategoryDrawer } from "@/components/CategoryDrawer"

interface HikmaData {
    arabe: string;
    fr: string;
    source: string;
    category: string;
}

const ALL_MOCKS: HikmaData[] = [
    {
        arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        fr: "À côté de la difficulté est, certes, une facilité.",
        source: "Sourate Ash-Sharh 94:6",
        category: "Coran"
    },
    {
        arabe: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        fr: "Louange à Allah, Seigneur de l'univers.",
        source: "Sourate Al-Fatiha 1:2",
        category: "Coran"
    },
    {
        arabe: "وَتَوَكَّلْ عَلَى الْعَيِّ الْقَيُّومِ",
        fr: "Et place ta confiance en le Vivant qui ne meurt jamais.",
        source: "Sourate Al-Furqan 25:58",
        category: "Coran"
    },
    {
        arabe: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        fr: "Les actions ne valent que par les intentions.",
        source: "Sahih Bukhari",
        category: "Hadith"
    },
    {
        arabe: "يا مقلب القلوب ثبت قلبي على دينك",
        fr: "Ô Toi qui retournes les cœurs, raffermis mon cœur sur Ta religion.",
        source: "Sunan at-Tirmidhi",
        category: "Citadelle"
    },
    {
        arabe: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ",
        fr: "Le mois de Ramadan au cours duquel le Coran a été descendu.",
        source: "Sourate Al-Baqarah 2:185",
        category: "Ramadan"
    },
    {
        arabe: "فَاصْبِرْ صَبْرًا جَمِيلًا",
        fr: "Endure d'une belle patience.",
        source: "Sourate Al-Ma'arij 70:5",
        category: "Coran"
    }
];

export function HomeScreen() {
    const [currentHikma, setCurrentHikma] = useState(ALL_MOCKS[0]);
    const [background, setBackground] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);

    const cloudinaryImages = PlaceHolderImages.filter(img =>
        img.imageUrl.includes('cloudinary.com') ||
        img.imageUrl.includes('dzagwz94z') ||
        img.imageUrl.includes('dhjwimevi') ||
        img.imageUrl.includes('db2ljqpdt')
    );

    const handleShuffle = useCallback(() => {
        const pool = selectedCategory === "all"
            ? ALL_MOCKS
            : ALL_MOCKS.filter(h => h.category.toLowerCase() === selectedCategory.toLowerCase());

        const effectivePool = pool.length > 0 ? pool : ALL_MOCKS;

        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * effectivePool.length);
        } while (effectivePool.length > 1 && effectivePool[nextIndex].fr === currentHikma.fr);

        setCurrentHikma(effectivePool[nextIndex]);

        if (cloudinaryImages.length > 0) {
            let nextBgIndex;
            do {
                nextBgIndex = Math.floor(Math.random() * cloudinaryImages.length);
            } while (cloudinaryImages.length > 1 && cloudinaryImages[nextBgIndex].imageUrl === background);
            setBackground(cloudinaryImages[nextBgIndex].imageUrl);
        }
    }, [currentHikma, background, cloudinaryImages, selectedCategory]);

    useEffect(() => {
        setFavorites(getFavorites().map(f => f.fr));
        const today = new Date();
        const dateSeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();
        const dailyIndex = dateSeed % ALL_MOCKS.length;
        setCurrentHikma(ALL_MOCKS[dailyIndex]);

        if (cloudinaryImages.length > 0) {
            const bgIndex = dateSeed % cloudinaryImages.length;
            setBackground(cloudinaryImages[bgIndex].imageUrl);
        }
    }, []);

    const handleFavorite = () => {
        const isLiked = toggleFavorite(currentHikma);
        setFavorites(prev => isLiked ? [...prev, currentHikma.fr] : prev.filter(f => f !== currentHikma.fr));
    };

    const handleShare = async () => {
        if (!captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(captureRef.current, { useCORS: true, scale: 3 });
            const base64Data = canvas.toDataURL('image/png').split(',')[1];
            const fileName = `hikma_share_${Date.now()}.png`;

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: 'HikmaClips',
                text: `${currentHikma.fr} - ${currentHikma.source}`,
                files: [savedFile.uri],
            });
        } catch (error) {
            toast({ title: "Erreur", description: "Le partage a échoué.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(captureRef.current, { useCORS: true, scale: 3 });
            const dataUrl = canvas.toDataURL('image/png');

            if (window.hasOwnProperty('Capacitor')) {
                const base64Data = dataUrl.split(',')[1];
                await Filesystem.writeFile({
                    path: `hikma_${Date.now()}.png`,
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
            toast({ title: "Erreur", description: "Échec du téléchargement.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setBackground(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const isLiked = favorites.includes(currentHikma.fr);

    return (
        <div className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            {/* Background Image Container (for capture) */}
            <div ref={captureRef} className="absolute inset-0 w-full h-full overflow-hidden">
                {background && (
                    <img
                        src={background}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                )}
                {/* Overlays */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHikma.fr + background}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            {currentHikma.arabe && (
                                <p className="text-3xl sm:text-5xl font-arabic text-white mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-relaxed" dir="rtl">
                                    {currentHikma.arabe}
                                </p>
                            )}
                            <p className="text-xl sm:text-3xl font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-snug max-w-lg mx-auto">
                                {currentHikma.fr}
                            </p>
                            <div className="pt-2 opacity-60">
                                <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-white">
                                    — {currentHikma.source} —
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating UI Elements (NOT for capture) */}

            {/* 1. TOP UI: Premium & Info */}
            <div className="absolute top-12 left-6 right-6 z-30 flex justify-between items-start pointer-events-none">
                <Button
                    variant="ghost"
                    onClick={() => setIsCategoryOpen(true)}
                    className="pointer-events-auto h-11 px-5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white font-bold flex items-center gap-2 group shadow-xl"
                >
                    <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{currentHikma.category || "Inspiration"}</span>
                </Button>

                <Button variant="ghost" size="icon" className="pointer-events-auto w-11 h-11 rounded-2xl bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-yellow-400 shadow-xl">
                    <Crown className="w-5 h-5" />
                </Button>
            </div>

            {/* 2. LEFT SIDE UI: Sidebar design tools (Moved to bottom) */}
            <div className="absolute left-6 bottom-32 z-30 flex flex-col gap-4">
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Galerie Cloudinary"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Charger une image locale"
                >
                    <Upload className="w-5 h-5" />
                </button>

                <button
                    onClick={handleShuffle}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Changer aléatoirement"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* 3. RIGHT SIDE UI: Action tools (Moved to bottom) */}
            <div className="absolute right-6 bottom-32 z-30 flex flex-col gap-4">
                <button
                    onClick={handleFavorite}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Ajouter aux favoris"
                >
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-[#FFFDD0] text-[#FFFDD0]" : ""}`} />
                </button>

                <button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Partager"
                >
                    <Share2 className="w-5 h-5" />
                </button>

                <button
                    onClick={handleDownload}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Télécharger"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            {/* Drawers & Popups */}
            <CloudinaryGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelect={(url) => {
                    setBackground(url);
                    setIsGalleryOpen(false);
                }}
            />

            <CategoryDrawer
                isOpen={isCategoryOpen}
                onClose={() => setIsCategoryOpen(false)}
                category={selectedCategory as any}
                onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    // Shuffle after changing category to show relevant content
                    setTimeout(handleShuffle, 300);
                }}
            />

            {/* Mobile Navigation Indicator / Margin Fix */}
            <div className="absolute bottom-24 left-0 right-0 pointer-events-none" />
        </div>
    )
}
