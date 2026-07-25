"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSwipeable } from "react-swipeable";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getFavorites, toggleFavorite, cn, updateStreak, getCollections, addToCollection, type Collection } from "@/lib/utils"
import {
    Zap,
    Image as ImageIcon,
    Upload,
    RefreshCw,
    Share2,
    Download,
    X,
    LayoutGrid,
    Crown,
    Heart,
    BookMarked,
    BookOpen,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Menu,
    Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CloudinaryGallery } from "@/components/studio/CloudinaryGallery"
import { CategoryDrawer } from "@/components/CategoryDrawer"
import { DesignToolsDrawer } from "@/components/DesignToolsDrawer"
import { MobileTopicInput } from "@/components/studio/MobileTopicInput"
import OnboardingScreen from '@/components/OnboardingScreen'
import { generateHadith, generateExplanation } from '@/ai/flows/generate-hadith'
import { useAuth, useUser } from '@/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
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
        arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        fr: "À côté de la difficulté est, certes, une facilité.",
        source: "Sourate Ash-Sharh 94:6",
        category: "Coran"
    },
    {
        arabe: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        fr: "Louange à Allah, Seigneur de l'univers.",
        source: "Sourate Al-Fatiha 1:2",
        category: "Coran"
    },
    {
        arabe: "وَتَوَكَّلْ عَلَى الْعَيِّ الْقَيُّومِ",
        fr: "Et place ta confiance en le Vivant qui ne meurt jamais.",
        source: "Sourate Al-Furqan 25:58",
        category: "Coran"
    },
    {
        arabe: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
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
        arabe: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ",
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
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showSignInPopup, setShowSignInPopup] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("recherche-ia");
    const [topic, setTopic] = useState("");
    const [generationCount, setGenerationCount] = useState(0);
    const [buffer, setBuffer] = useState<HikmaData[]>([]);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hikmaHistory, setHikmaHistory] = useState<HikmaData[]>([ALL_MOCKS[0]]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [explanationText, setExplanationText] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [showCollectionPicker, setShowCollectionPicker] = useState(false);
    const [userCollections, setUserCollections] = useState<Collection[]>([]);
    const speakRef = useRef<SpeechSynthesisUtterance | null>(null);
    const historyIndexRef = useRef(0);
    const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoScrollFnRef = useRef<() => void>(() => {});
    const isMountedRef = useRef(true);

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

    const setHikmaWithHistory = useCallback((newHikma: HikmaData) => {
        const idx = historyIndexRef.current;
        setHikmaHistory(prev => [...prev.slice(0, idx + 1), newHikma]);
        const nextIdx = idx + 1;
        setHistoryIndex(nextIdx);
        historyIndexRef.current = nextIdx;
        setCurrentHikma(newHikma);
    }, []);

    const fetchToBuffer = async (cat: string, t: string) => {
        try {
            const result = await generateHadith({ category: cat as any, topic: t });
            if (result && result.content) {
                return {
                    arabe: result.arabe || "",
                    fr: result.content,
                    source: result.source,
                    category: cat
                };
            }
        } catch (e) {
            console.error("Buffer fetch error:", e);
        }
        return null;
    };

    const refillBuffer = useCallback(async (cat: string, t: string, count = 2) => {
        if (isBuffering) return;
        setIsBuffering(true);
        const newItems: HikmaData[] = [];
        for (let i = 0; i < count; i++) {
            const item = await fetchToBuffer(cat, t);
            if (item) newItems.push(item);
        }
        if (!isMountedRef.current) return;
        setBuffer(prev => [...prev, ...newItems]);
        if (!isMountedRef.current) return;
        setIsBuffering(false);
    }, [isBuffering]);

    // silent=true suppresses the error toast and uses a mock fallback (used by auto-scroll)
    const handleGenerateAiContent = async (silent = false) => {
        if (!user && generationCount >= 10) {
            setShowSignInPopup(true);
            return;
        }

        if (buffer.length > 0) {
            const nextItem = buffer[0];
            const remaining = buffer.slice(1);
            setBuffer(remaining);
            setHikmaWithHistory(nextItem);
            if (!user) setGenerationCount(prev => prev + 1);
            if (remaining.length < 2) refillBuffer(selectedCategory, topic, 2);
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateHadith({ category: selectedCategory as any, topic });
            if (result && result.content) {
                setHikmaWithHistory({
                    arabe: result.arabe || "",
                    fr: result.content,
                    source: result.source,
                    category: selectedCategory
                });
                if (!user) setGenerationCount(prev => prev + 1);
                refillBuffer(selectedCategory, topic, 2);
            }
        } catch (error) {
            if (!silent) {
                toast({
                    variant: 'destructive',
                    title: 'L\'Agent est occupé',
                    description: "Veuillez réessayer dans un instant.",
                });
            } else {
                // Auto-scroll fallback: show a random local hikma silently
                const randomMock = ALL_MOCKS[Math.floor(Math.random() * ALL_MOCKS.length)];
                setHikmaWithHistory(randomMock);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSpeak = useCallback(() => {
        if (!('speechSynthesis' in window)) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const text = `${currentHikma.fr}. Source : ${currentHikma.source}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speakRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    }, [isSpeaking, currentHikma]);

    const handleExplain = useCallback(async () => {
        if (isExplaining) return;
        setIsExplaining(true);
        setShowExplanation(true);
        setExplanationText('');
        try {
            const explanation = await generateExplanation(currentHikma.fr, currentHikma.source);
            setExplanationText(explanation);
        } catch {
            setExplanationText("Impossible de générer une explication pour le moment. Réessayez.");
        } finally {
            setIsExplaining(false);
        }
    }, [currentHikma, isExplaining]);

    const handleAddToCollection = useCallback((collectionId: string) => {
        const success = addToCollection(collectionId, { ...currentHikma });
        setShowCollectionPicker(false);
        toast({ title: success ? 'Ajouté à la collection !' : 'Déjà dans cette collection' });
    }, [currentHikma, toast]);

    const handlePasswordReset = async () => {
        if (!auth || !authEmail) {
            setAuthError('Entrez votre email pour réinitialiser le mot de passe.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, authEmail);
            toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail.' });
        } catch {
            setAuthError("Impossible d'envoyer l'email de réinitialisation.");
        }
    };

    const isNativeApp = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

    const handleGoogleAuth = async () => {
        if (!auth) return;
        // signInWithPopup is not supported in Capacitor WebView — use email/password on native
        if (isNativeApp) {
            setAuthError('Connexion Google non disponible sur mobile. Utilisez email + mot de passe.');
            return;
        }
        setIsConnecting(true);
        setAuthError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast({ title: 'Connexion réussie', description: 'Bienvenue sur HikmaClips !' });
            setShowSignInPopup(false);
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setAuthError('Erreur lors de la connexion Google.');
            }
        } finally {
            setIsConnecting(false);
        }
    };

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
                const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                await sendEmailVerification(cred.user);
                toast({ title: 'Inscription réussie !', description: 'Un email de vérification a été envoyé.' });
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
        handleGenerateAiContent();
        handleShuffleBackground();
    }, [handleGenerateAiContent, handleShuffleBackground]);

    const handlePrev = useCallback(() => {
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            historyIndexRef.current = prevIdx;
            setHistoryIndex(prevIdx);
            setCurrentHikma(hikmaHistory[prevIdx]);
        }
    }, [historyIndex, hikmaHistory]);

    const handleNext = useCallback(() => {
        if (historyIndex < hikmaHistory.length - 1) {
            const nextIdx = historyIndex + 1;
            historyIndexRef.current = nextIdx;
            setHistoryIndex(nextIdx);
            setCurrentHikma(hikmaHistory[nextIdx]);
            handleShuffleBackground();
        } else {
            handleFullShuffle();
        }
    }, [historyIndex, hikmaHistory, handleShuffleBackground, handleFullShuffle]);

    const toggleAutoScroll = useCallback(() => {
        setIsAutoScrolling(prev => {
            if (prev) {
                if (autoScrollIntervalRef.current) {
                    clearInterval(autoScrollIntervalRef.current);
                    autoScrollIntervalRef.current = null;
                }
                return false;
            } else {
                autoScrollIntervalRef.current = setInterval(() => {
                    autoScrollFnRef.current();
                }, 5000);
                return true;
            }
        });
    }, []);

    const swipeHandlers = useSwipeable({
        onSwipedUp: () => handleFullShuffle(),
        preventScrollOnSwipe: true,
        trackMouse: false,
        trackTouch: true,
        delta: 60,
        swipeDuration: 500,
    });

    // Auto-scroll uses silent mode to avoid error toasts
    useEffect(() => {
        autoScrollFnRef.current = () => {
            handleGenerateAiContent(true);
            handleShuffleBackground();
        };
    }, [handleGenerateAiContent, handleShuffleBackground]);

    useEffect(() => {
        return () => { if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current); };
    }, []);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        setShowExplanation(false);
    }, [currentHikma]);

    useEffect(() => {
        updateStreak();
        const hasSeen = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) setShowOnboarding(true);

        setFavorites(getFavorites().map(f => f.fr));
        setUserCollections(getCollections());

        const today = new Date();
        const dateSeed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();
        const dailyIndex = dateSeed % ALL_MOCKS.length;
        const dailyHikma = ALL_MOCKS[dailyIndex];
        setCurrentHikma(dailyHikma);
        setHikmaHistory([dailyHikma]);
        setHistoryIndex(0);
        historyIndexRef.current = 0;

        const validImages = PlaceHolderImages.filter(img =>
            img.imageUrl.includes('cloudinary.com') ||
            img.imageUrl.includes('dzagwz94z') ||
            img.imageUrl.includes('dhjwimevi') ||
            img.imageUrl.includes('db2ljqpdt')
        );

        if (validImages.length > 0) {
            const bgIndex = Math.floor(Math.random() * validImages.length);
            setBackground(validImages[bgIndex].imageUrl);
        }

        refillBuffer("recherche-ia", "", 2);

        return () => {
            isMountedRef.current = false;
            window.speechSynthesis?.cancel();
        };
    }, []);

    useEffect(() => {
        const onGenerate = () => handleGenerateAiContent();
        const onTools = () => setIsToolsOpen(true);
        window.addEventListener('hikma:generate', onGenerate);
        window.addEventListener('hikma:tools', onTools);
        return () => {
            window.removeEventListener('hikma:generate', onGenerate);
            window.removeEventListener('hikma:tools', onTools);
        };
    }, [handleGenerateAiContent]);

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
            const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
            await Share.share({ title: 'HikmaClips', text: `${currentHikma.fr} - ${currentHikma.source}`, files: [savedFile.uri] });
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
                await Filesystem.writeFile({ path: `hikma_${Date.now()}.png`, data: base64Data, directory: Directory.Documents, recursive: true });
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

    // Tool menu items
    const toolMenuItems = [
        { icon: <Share2 className="w-5 h-5" />, label: 'Partager', action: () => { setIsToolsMenuOpen(false); handleShare(); } },
        { icon: <Download className="w-5 h-5" />, label: 'Sauver', action: () => { setIsToolsMenuOpen(false); handleDownload(); } },
        { icon: <ImageIcon className="w-5 h-5" />, label: 'Galerie', action: () => { setIsToolsMenuOpen(false); setIsGalleryOpen(true); } },
        { icon: <Upload className="w-5 h-5" />, label: 'Photo', action: () => { setIsToolsMenuOpen(false); fileInputRef.current?.click(); } },
        { icon: <RefreshCw className="w-5 h-5" />, label: 'Fond', action: () => { handleShuffleBackground(); setIsToolsMenuOpen(false); } },
        { icon: <BookOpen className="w-5 h-5" />, label: 'Expliquer', action: () => { setIsToolsMenuOpen(false); handleExplain(); }, active: showExplanation },
        { icon: <BookMarked className="w-5 h-5" />, label: 'Collection', action: () => { setIsToolsMenuOpen(false); setUserCollections(getCollections()); setShowCollectionPicker(true); } },
        { icon: <Sliders className="w-5 h-5" />, label: 'Filtres', action: () => { setIsToolsMenuOpen(false); setIsToolsOpen(true); } },
    ];

    return (
        <div
            {...swipeHandlers}
            className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none touch-none"
        >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            {/* Background + Hikma content (for capture) */}
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
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-32 pb-8 text-center">
                    {isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-50">
                            <Loader2 className="w-10 h-10 animate-spin text-white mb-2" />
                            <p className="text-white text-sm font-medium">Votre Hikma est en cours...</p>
                        </div>
                    )}
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

            {/* ───── TOP BAR ─────
                3-column flex: [Category] [Thème - centered] [Crown]
                Using flex-1 on sides ensures true centering */}
            <div className="absolute top-0 left-0 right-0 z-[60]" style={{ paddingTop: 'max(env(safe-area-inset-top), 14px)' }}>
                <div className="flex items-center gap-2 px-4 pb-2">
                    {/* Left */}
                    <div className="flex-1 flex justify-start">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCategoryOpen(true)}
                            className="h-9 px-3 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 text-white font-bold flex items-center gap-1.5 shadow-lg"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="text-[9px] uppercase font-extrabold tracking-widest truncate max-w-[72px]">
                                {selectedCategory === 'recherche-ia' ? "Agent" : selectedCategory}
                            </span>
                        </Button>
                    </div>

                    {/* Center — topic input, truly centered */}
                    <div className="flex-none w-[152px]">
                        <MobileTopicInput
                            value={topic}
                            onChange={setTopic}
                            isVisible={true}
                            placeholder="Thème..."
                            onEnter={handleGenerateAiContent}
                            position="top"
                        />
                    </div>

                    {/* Right */}
                    <div className="flex-1 flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSignInPopup(true)}
                            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 text-yellow-400 shadow-lg"
                        >
                            <Crown className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ───── RIGHT SIDE — 2 essential inline actions ───── */}
            <div
                className="absolute right-4 z-40 flex flex-col gap-3"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "w-11 h-11 rounded-full backdrop-blur-md border shadow-2xl flex items-center justify-center active:scale-90 transition-all",
                        isLiked
                            ? "bg-red-500/30 border-red-400/60 text-red-400"
                            : "bg-black/30 border-white/20 text-white"
                    )}
                    aria-label="Favori"
                >
                    <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                </button>

                <button
                    onClick={handleSpeak}
                    className={cn(
                        "w-11 h-11 rounded-full backdrop-blur-md border shadow-2xl flex items-center justify-center active:scale-90 transition-all",
                        isSpeaking
                            ? "bg-blue-500/30 border-blue-400/60 text-blue-400"
                            : "bg-black/30 border-white/20 text-white"
                    )}
                    aria-label={isSpeaking ? "Arrêter la lecture" : "Écouter"}
                >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* ───── BOTTOM ROW — clearly above the nav bar ─────
                Uses calc to clear the ~88px bottom nav + safe area */}
            <div
                className="absolute left-0 right-0 z-40 flex items-center justify-center gap-2 px-3"
                style={{ bottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
            >
                {/* Auto-scroll play/pause */}
                <button
                    onClick={toggleAutoScroll}
                    className={cn(
                        "w-11 h-11 rounded-full backdrop-blur-xl border shadow-lg flex items-center justify-center active:scale-90 transition-all shrink-0",
                        isAutoScrolling
                            ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-400"
                            : "bg-black/40 border-white/20 text-white/80"
                    )}
                    aria-label="Lecture automatique"
                >
                    {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Prev */}
                <button
                    onClick={handlePrev}
                    disabled={historyIndex === 0}
                    className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 shrink-0"
                    aria-label="Citation précédente"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Generate — main CTA */}
                <button
                    onClick={() => handleGenerateAiContent()}
                    disabled={isGenerating}
                    className="h-12 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-2 active:scale-95 transition-all font-bold shadow-lg shadow-emerald-500/40 disabled:opacity-70 min-w-0 flex-1 max-w-[180px] justify-center"
                >
                    {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    ) : (
                        <Zap className="w-5 h-5 fill-white shrink-0" />
                    )}
                    <span className="text-sm font-bold truncate">Agent Hikma</span>
                </button>

                {/* Next */}
                <button
                    onClick={handleNext}
                    className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all shrink-0"
                    aria-label="Citation suivante"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Tools hamburger */}
                <button
                    onClick={() => setIsToolsMenuOpen(true)}
                    className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white/80 flex items-center justify-center active:scale-90 transition-all shrink-0"
                    aria-label="Outils"
                >
                    <Menu className="w-4 h-4" />
                </button>
            </div>

            {/* ───── TOOLS SLIDE-UP MENU ───── */}
            <AnimatePresence>
                {isToolsMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[80] bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsToolsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                            className="absolute bottom-0 left-0 right-0 bg-slate-900/98 backdrop-blur-2xl rounded-t-3xl p-6"
                            style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                            <h3 className="text-white font-bold text-base mb-4">Outils</h3>
                            {/* Padding at bottom clears the bottom nav bar (~80px) */}

                            <div className="grid grid-cols-4 gap-3">
                                {toolMenuItems.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={item.action}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95",
                                            item.active ? "bg-amber-500/30 border border-amber-400/40" : "bg-white/10 hover:bg-white/20"
                                        )}
                                    >
                                        <span className={item.active ? "text-amber-400" : "text-white"}>{item.icon}</span>
                                        <span className="text-[10px] text-white/70 font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ───── MODE ÉTUDIANT PANEL ───── */}
            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                        className="absolute bottom-0 left-0 right-0 z-[70] bg-slate-900/97 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 max-h-[70vh] overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                                <h3 className="text-white font-bold text-base">Mode Étudiant</h3>
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">IA</span>
                            </div>
                            <button
                                onClick={() => setShowExplanation(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {isExplaining ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                    <p className="text-white/60 text-sm">L'Agent analyse ce texte sacré...</p>
                                </div>
                            ) : (
                                <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-light">
                                    {explanationText}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-white/10">
                            <p className="text-[10px] text-white/30 text-center">— Analyse générée par l'Agent Hikma (IA) —</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ───── COLLECTION PICKER ───── */}
            <AnimatePresence>
                {showCollectionPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end"
                        onClick={() => setShowCollectionPicker(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                            className="w-full bg-slate-900 rounded-t-3xl p-6 space-y-4"
                            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-base">Ajouter à une collection</h3>
                                <button onClick={() => setShowCollectionPicker(false)} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {userCollections.length === 0 ? (
                                <p className="text-white/50 text-sm text-center py-4">Aucune collection. Créez-en une dans l'onglet Collections.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {userCollections.map(col => (
                                        <button key={col.id} onClick={() => handleAddToCollection(col.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left">
                                            <span className="text-xl">{col.emoji}</span>
                                            <div>
                                                <p className="text-white font-medium text-sm">{col.name}</p>
                                                <p className="text-white/50 text-xs">{col.items.length} hikma(s)</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drawers */}
            <CloudinaryGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelect={(url) => { setBackground(url); setIsGalleryOpen(false); }}
            />

            <CategoryDrawer
                isOpen={isCategoryOpen}
                onClose={() => setIsCategoryOpen(false)}
                category={selectedCategory as any}
                onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setBuffer([]);
                    setTimeout(handleGenerateAiContent, 300);
                }}
            />

            <DesignToolsDrawer
                isOpen={isToolsOpen}
                onClose={() => setIsToolsOpen(false)}
                filters={filters}
                setFilters={setFilters}
            />

            <AnimatePresence>
                {showOnboarding && (
                    <OnboardingScreen onComplete={() => {
                        setShowOnboarding(false);
                        localStorage.setItem('hasSeenOnboarding', 'true');
                    }} />
                )}
            </AnimatePresence>

            {/* Auth Popup */}
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
                        <AlertDialogTitle className="text-2xl font-bold text-center">HikmaClips Premium</AlertDialogTitle>
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
                        {!isNativeApp && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-3 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                                    onClick={handleGoogleAuth}
                                    disabled={isConnecting}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Continuer avec Google
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
                                </div>
                            </>
                        )}
                        <Input placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} disabled={isConnecting} />
                        <Input type="password" placeholder="Mot de passe" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} disabled={isConnecting} />
                        {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleEmailAuth} disabled={isConnecting}>
                            {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
                        </Button>
                        {authMode === 'login' && (
                            <button className="w-full text-xs text-muted-foreground hover:text-primary hover:underline" onClick={handlePasswordReset} type="button">
                                Mot de passe oublié ?
                            </button>
                        )}
                        <button className="w-full text-xs text-muted-foreground hover:underline" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                            {authMode === 'login' ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
