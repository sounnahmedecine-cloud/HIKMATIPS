"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSwipeable } from "react-swipeable";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getFavorites, toggleFavorite, cn } from "@/lib/utils"
import {
    Sparkles,
    Image as ImageIcon,
    Upload,
    RefreshCw,
    Share2,
    Download,
    X,
    LayoutGrid,
    Crown,
    Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CloudinaryGallery } from "@/components/studio/CloudinaryGallery"
import { CategoryDrawer } from "@/components/CategoryDrawer"
import { DesignToolsDrawer } from "@/components/DesignToolsDrawer"
import OnboardingScreen from '@/components/OnboardingScreen'
import { useAuth, useUser } from '@/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showSignInPopup, setShowSignInPopup] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Auth States
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [authError, setAuthError] = useState('');

    // Design Filters State
    const [filters, setFilters] = useState({
        brightness: 100,
        contrast: 100,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        showSignature: false,
        signatureText: "hikmatips_app"
    });

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);

    const handleEmailAuth = async () => {
        if (!auth || isConnecting) return;
        if (!authEmail || !authPassword) {
            setAuthError('Veuillez remplir tous les champs.');
            return;
        }
        setIsConnecting(true);
        setAuthError('');

        try {
            if (authMode === 'signup') {
                await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                toast({ title: 'Inscription réussie !', description: 'Bienvenue sur HikmaClips !' });
            } else {
                await signInWithEmailAndPassword(auth, authEmail, authPassword);
                toast({ title: 'Connexion réussie', description: 'Bienvenue !' });
            }
            setShowSignInPopup(false);
        } catch (error: any) {
            let message = "Une erreur s'est produite.";
            if (error.code === 'auth/email-already-in-use') message = 'Email déjà utilisé.';
            else if (error.code === 'auth/invalid-credential') message = 'Identifiants incorrects.';
            setAuthError(message);
        } finally {
            setIsConnecting(false);
        }
    };

    const cloudinaryImages = PlaceHolderImages.filter(img =>
        img.imageUrl.includes('cloudinary.com') ||
        img.imageUrl.includes('dzagwz94z') ||
        img.imageUrl.includes('dhjwimevi') ||
        img.imageUrl.includes('db2ljqpdt')
    );

    const handleShuffleText = useCallback(() => {
        const pool = selectedCategory === "all"
            ? ALL_MOCKS
            : ALL_MOCKS.filter(h => h.category.toLowerCase() === selectedCategory.toLowerCase());

        const effectivePool = pool.length > 0 ? pool : ALL_MOCKS;

        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * effectivePool.length);
        } while (effectivePool.length > 1 && effectivePool[nextIndex].fr === currentHikma.fr);

        setCurrentHikma(effectivePool[nextIndex]);
    }, [currentHikma, selectedCategory]);

    const handleShuffleBackground = useCallback(() => {
        if (cloudinaryImages.length > 0) {
            let nextBgIndex;
            do {
                nextBgIndex = Math.floor(Math.random() * cloudinaryImages.length);
            } while (cloudinaryImages.length > 1 && cloudinaryImages[nextBgIndex].imageUrl === background);
            setBackground(cloudinaryImages[nextBgIndex].imageUrl);
        }
    }, [background, cloudinaryImages]);

    const handleFullShuffle = useCallback(() => {
        handleShuffleText();
        handleShuffleBackground();
    }, [handleShuffleText, handleShuffleBackground]);

    const swipeHandlers = useSwipeable({
        onSwipedUp: () => handleFullShuffle(),
        preventScrollOnSwipe: true,
        trackMouse: true,
        trackTouch: true,
        delta: 10,
        swipeDuration: 500,
    });

    // Initial setup - runs only once
    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) setShowOnboarding(true);

        setFavorites(getFavorites().map(f => f.fr));

        // Set daily Hikma only once on mount
        const today = new Date();
        const dateSeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();
        const dailyIndex = dateSeed % ALL_MOCKS.length;
        setCurrentHikma(ALL_MOCKS[dailyIndex]);

        // Filter images internally to avoid dependency on outer scope variable `cloudinaryImages`
        // which would cause linter warnings or stale closures if we put it in deps
        const validImages = PlaceHolderImages.filter(img =>
            img.imageUrl.includes('cloudinary.com') ||
            img.imageUrl.includes('dzagwz94z') ||
            img.imageUrl.includes('dhjwimevi') ||
            img.imageUrl.includes('db2ljqpdt')
        );

        if (validImages.length > 0) {
            const bgIndex = dateSeed % validImages.length;
            setBackground(validImages[bgIndex].imageUrl);
        }
    }, []); // Empty dependency array ensures this runs strictly once

    // Event listeners configuration
    useEffect(() => {
        // Listen for events from bottom nav
        const onGenerate = () => handleShuffleText();
        const onTools = () => setIsToolsOpen(true);

        window.addEventListener('hikma:generate', onGenerate);
        window.addEventListener('hikma:tools', onTools);

        return () => {
            window.removeEventListener('hikma:generate', onGenerate);
            window.removeEventListener('hikma:tools', onTools);
        };
    }, [handleShuffleText]); // Depends on handleShuffleText which updates when hikma changes, but won't trigger the INIT logic loop anymore

    const handleFavorite = () => {
        if (!user && favorites.length >= 3) {
            setShowSignInPopup(true);
            return;
        }
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
        <div
            {...swipeHandlers}
            className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none touch-none"
        >
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
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%)` }}
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-6 pointer-events-none"
                        >
                            {currentHikma.arabe && (
                                <p className="text-3xl sm:text-5xl font-arabic text-white mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-relaxed" dir="rtl">
                                    {currentHikma.arabe}
                                </p>
                            )}
                            <p
                                className="text-xl sm:text-3xl font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-snug max-w-lg mx-auto"
                                style={{ fontFamily: filters.fontFamily }}
                            >
                                {currentHikma.fr}
                            </p>
                            <div className="pt-2 opacity-60">
                                <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-white">
                                    — {currentHikma.source} —
                                </p>
                            </div>

                            {/* TikTok Signature Overlay (Only in Capture/Preview) */}
                            {filters.showSignature && (
                                <div className="mt-8 flex items-center justify-center gap-2 opacity-80 scale-110">
                                    <div className="p-1 rounded-full bg-black/40 backdrop-blur-md">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-1.44.07-2.94.81-4.2 1.02-1.76 2.85-2.97 4.86-3.23.81-.1 1.63-.1 2.44.05.11 4.39-.06 8.8.05 13.19 2.62.51 5.39-1.32 5.67-3.86.06-1.08-.04-2.18-.55-3.13-.59-1.03-1.67-1.74-2.82-1.89l-.01-4.03c1.64.01 3.27.42 4.73 1.17l.02-8.3c1.51-.44 3.01-.6 4.6-.54V.02Z" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-widest drop-shadow-md">
                                        @{filters.signatureText}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating UI Elements (NOT for capture) */}

            {/* 1. TOP UI: Premium & Info */}
            <div className="absolute top-12 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
                <Button
                    variant="ghost"
                    onClick={() => setIsCategoryOpen(true)}
                    className="pointer-events-auto h-11 px-5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white font-bold flex items-center gap-2 group shadow-xl"
                >
                    <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{currentHikma.category || "Inspiration"}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSignInPopup(true)}
                    className="pointer-events-auto w-11 h-11 rounded-2xl bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-yellow-400 shadow-xl"
                >
                    <Crown className="w-5 h-5" />
                </Button>
            </div>

            {/* 2. LEFT SIDE UI: Sidebar design tools (Moved to bottom) */}
            <div className="absolute left-6 bottom-40 z-40 flex flex-col gap-4">
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
                    onClick={handleShuffleBackground}
                    className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
                    aria-label="Changer l'image de fond"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* 3. RIGHT SIDE UI: Action tools (Moved to bottom) */}
            <div className="absolute right-6 bottom-40 z-40 flex flex-col gap-4">
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "w-12 h-12 rounded-full backdrop-blur-md border shadow-2xl flex items-center justify-center active:scale-90 transition-all",
                        isLiked
                            ? "bg-red-500/20 border-red-500/50 text-red-500"
                            : "bg-[#FFFDD0]/10 border-[#FFFDD0]/20 text-[#FFFDD0]"
                    )}
                    aria-label="Ajouter aux favoris"
                >
                    <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
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
                    setTimeout(handleShuffleText, 300);
                }}
            />

            <DesignToolsDrawer
                isOpen={isToolsOpen}
                onClose={() => setIsToolsOpen(false)}
                filters={filters}
                setFilters={setFilters}
            />

            {/* Onboarding Screen */}
            <AnimatePresence>
                {showOnboarding && (
                    <OnboardingScreen onComplete={() => {
                        setShowOnboarding(false);
                        localStorage.setItem('hasSeenOnboarding', 'true');
                    }} />
                )}
            </AnimatePresence>

            {/* Login Popup */}
            <AlertDialog open={showSignInPopup} onOpenChange={setShowSignInPopup}>
                <AlertDialogContent className="max-w-md bg-background/95 backdrop-blur-xl border border-primary/20 rounded-[32px] overflow-hidden">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full bg-muted/80 hover:bg-muted shadow-sm z-50"
                        onClick={() => setShowSignInPopup(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <AlertDialogHeader className="pt-6">
                        <div className="flex justify-center mb-2">
                            <div className="p-3 rounded-2xl bg-primary/10">
                                <Crown className="w-8 h-8 text-yellow-500 animate-pulse" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-center">
                            HikmaClips Premium
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center px-4">
                            Connectez-vous gratuitement pour débloquer :
                            <span className="block mt-2 text-xs font-semibold space-y-1">
                                <span className="block">✨ Thèmes & Arrière-plans exclusifs</span>
                                <span className="block">🖋️ Signature personnalisée illimitée</span>
                                <span className="block">🚀 Partage haute qualité sans limites</span>
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            disabled={isConnecting}
                        />
                        <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            disabled={isConnecting}
                        />
                        {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                        <Button
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={handleEmailAuth}
                            disabled={isConnecting}
                        >
                            {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
                        </Button>
                        <button
                            className="w-full text-xs text-muted-foreground hover:underline"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        >
                            {authMode === 'login' ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Mobile Navigation Indicator / Margin Fix */}
            <div className="absolute bottom-24 left-0 right-0 pointer-events-none" />
        </div>
    )
}
