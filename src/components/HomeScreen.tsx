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
    Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CloudinaryGallery } from "@/components/studio/CloudinaryGallery"
import { CategoryDrawer } from "@/components/CategoryDrawer"

const MOCK_HIKMAS = [
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
        arabe: "فَاصْبِرْ صَبْرًا جَمِيلًا",
        fr: "Endure d'une belle patience.",
        source: "Sourate Al-Ma'arij 70:5",
        category: "Coran"
    },
    {
        arabe: "وَقُولُوا لِلنَّاسِ حُسْنًا",
        fr: "Et parlez aux gens avec bonté.",
        source: "Sourate Al-Baqarah 2:83",
        category: "Coran"
    }
];

export function HomeScreen() {
    const [currentHikma, setCurrentHikma] = useState(MOCK_HIKMAS[0]);
    const [background, setBackground] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
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
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * MOCK_HIKMAS.length);
        } while (MOCK_HIKMAS.length > 1 && MOCK_HIKMAS[nextIndex].fr === currentHikma.fr);

        setCurrentHikma(MOCK_HIKMAS[nextIndex]);

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
        const today = new Date();
        const dateSeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();
        const dailyIndex = dateSeed % MOCK_HIKMAS.length;
        setCurrentHikma(MOCK_HIKMAS[dailyIndex]);

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
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHikma.fr + background}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {currentHikma.arabe && (
                                <p className="text-4xl sm:text-5xl font-arabic text-white mb-6 drop-shadow-2xl leading-relaxed" dir="rtl">
                                    {currentHikma.arabe}
                                </p>
                            )}
                            <p className="text-2xl sm:text-3xl font-medium text-white drop-shadow-2xl leading-snug max-w-lg mx-auto">
                                {currentHikma.fr}
                            </p>
                            <p className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase opacity-60 text-white/90">
                                — {currentHikma.source} —
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Watermark */}
                <div className="absolute bottom-10 left-0 right-0 text-center opacity-30 select-none">
                    <p className="text-[10px] font-bold tracking-[0.5em] text-white uppercase">HIKMACLIPS</p>
                </div>
            </div>

            {/* Floating UI Elements (Not for capture) */}

            {/* Top Right: Progress/Premium (Placeholder) */}
            <div className="absolute top-12 right-6 z-30">
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-yellow-400">
                    <Crown className="w-6 h-6" />
                </Button>
            </div>

            {/* Bottom Left: Category Badge */}
            <div className="absolute bottom-12 left-6 z-30">
                <Button
                    variant="ghost"
                    onClick={() => setIsCategoryOpen(true)}
                    className="h-12 px-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold flex items-center gap-2 group"
                >
                    <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-sm uppercase tracking-wider">{currentHikma.category || "Généralités"}</span>
                </Button>
            </div>

            {/* Right Side: Design Tools */}
            <div className="absolute bottom-32 right-6 z-30 flex flex-col gap-4">
                {/* Choose Image from Gallery */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsGalleryOpen(true)}
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <ImageIcon className="w-6 h-6" />
                </Button>

                {/* Upload Local Image */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <Upload className="w-6 h-6" />
                </Button>

                {/* Random Designs (Shuffle both) */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShuffle}
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <RefreshCw className="w-6 h-6" />
                </Button>
            </div>

            {/* Bottom: Main Actions */}
            <div className="absolute bottom-12 right-6 z-30 flex items-center gap-4">
                {/* Favorite */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavorite}
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <Heart className={`w-6 h-6 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>

                {/* Share */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <Share2 className="w-6 h-6" />
                </Button>

                {/* Close/Back or More Actions */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl hover:bg-white/40 active:scale-95 transition-all"
                >
                    <X className="w-6 h-6" />
                </Button>
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
                category="thematique" // Placeholder as we use a list
                onSelectCategory={(cat) => {
                    // Logic to change mock data pool based on category
                    toast({ title: "Sélection", description: `Catégorie ${cat} activée.` });
                }}
            />
        </div>
    )
}
