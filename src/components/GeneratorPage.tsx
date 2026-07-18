'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Download,
  Loader2,
  Moon,
  BookOpen,
  Search,
  BookMarked,
  LogIn,
  LogOut,
  RefreshCw,
  LayoutGrid,
  Crown,
  Settings,
  Heart,
  Share2,
  Palette,
  User,
  Mail,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fetchUnsplashBackground } from '@/lib/unsplash-service';
import html2canvas from 'html2canvas';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateHadith } from '@/ai/flows/generate-hadith';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import OnboardingScreen from '@/components/OnboardingScreen';
import { SidebarContent, FormatSettings, FontSettings, FilterSettings } from './SidebarContent';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BottomControls } from '@/components/BottomControls';
import { MobileDrawer } from '@/components/studio/MobileDrawer';
import { MobileTopicInput } from '@/components/studio/MobileTopicInput';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { TooltipGuide } from '@/components/TooltipGuide';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { MobileLeftToolbar } from '@/components/studio/MobileLeftToolbar';
import { CategoryDrawer } from '@/components/CategoryDrawer';
import { ToolsDrawer } from '@/components/ToolsDrawer';
import { CloudinaryGallery } from '@/components/studio/CloudinaryGallery';
import { SwipeHintOverlay } from '@/components/SwipeHintOverlay';



import { getFavorites, toggleFavorite, cn } from '@/lib/utils';




type Content = {
  content: string;
  source: string;
  surah?: number;
  ayah?: number;
};

const category: Category[] = ['hadith', 'ramadan', 'thematique', 'coran', 'recherche-ia', 'citadelle', 'rabbana'];

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia' | 'citadelle' | 'rabbana';

export default function GeneratorPage() {
  const [content, setContent] = useState<Content | null>({
    content: "Et rappelle, car le rappel profite aux croyants",
    source: "Sourate Adh-Dhâriyât, v. 55",
    surah: 51,
    ayah: 55
  });

  // Quote history for swipe navigation
  const [contentHistory, setContentHistory] = useState<Content[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const [category, setCategory] = useState<Category>('rabbana');
  const [background, setBackground] = useState<string>(
    '/79756b65fbdbf142396e8ab50b551fea_aywvyt.jpg'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(320);
  const PEEK = 88; // hauteur visible quand fermé (handle + bouton générer)

  // Buffer de rappels pré-chargés
  const [contentBuffer, setContentBuffer] = useState<Content[]>([]);
  const isFillingBuffer = useRef(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMobileTool, setActiveMobileTool] = useState<'font' | 'format' | 'background' | 'signature' | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  // First-time user guidance
  const { isFirstTime, markAsGenerated } = useFirstTimeUser();
  const [showTooltipGuide, setShowTooltipGuide] = useState(false);

  // Studio Settings States
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState("'Amiri', serif");
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [signature, setSignature] = useState('hikmaclips.woosenteur.fr');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites().map(f => f.fr));
  }, []);

  const handleFavorite = () => {
    if (!content) return;
    const hikma = {
      fr: content.content,
      arabe: '', // IA output is French by default in this app
      source: content.source
    };
    const isLiked = toggleFavorite(hikma);
    setFavorites(prev => isLiked ? [...prev, hikma.fr] : prev.filter(f => f !== hikma.fr));

    toast({
      title: isLiked ? 'Ajouté aux favoris' : 'Retiré des favoris',
      description: isLiked ? 'Retrouvez cette pépite dans vos favoris.' : 'Contenu retiré de vos favoris.',
    });
  };

  const [showAnimations, setShowAnimations] = useState(true);

  // Image Filter States
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem('showAnimations');
    if (saved !== null) setShowAnimations(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('showAnimations', showAnimations.toString());
  }, [showAnimations]);

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    // Handle URL parameters
    const urlTopic = searchParams.get('topic');
    const urlCategory = searchParams.get('category');

    if (urlTopic) {
      setTopic(urlTopic);
    }
    if (urlCategory) {
      setCategory(urlCategory as Category);
    }
  }, [searchParams]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    // Show tooltip guide after onboarding for first-time users
    setTimeout(() => setShowTooltipGuide(true), 500);
  };

  // Remplit silencieusement le buffer avec N rappels pré-générés
  const fillBuffer = useCallback(async (cat: Category, t: string, count = 3) => {
    if (isFillingBuffer.current) return;
    isFillingBuffer.current = true;
    const items: Content[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const result = await generateHadith({ category: cat, topic: t });
        if (result?.content) items.push(result);
      } catch { /* silently ignore */ }
    }
    setContentBuffer(prev => [...prev, ...items]);
    isFillingBuffer.current = false;
  }, []);

  // Pré-charge le buffer au démarrage avec les Rabbana (local, instantané)
  useEffect(() => {
    fillBuffer('rabbana', '', 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');

  // handleSignIn removed (Google Auth)

  const handleEmailAuth = async () => {
    if (!auth || isConnecting) return;
    if (!authEmail || !authPassword) {
      setAuthError('Veuillez remplir tous les champs.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsConnecting(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        toast({
          title: 'Inscription réussie !',
          description: 'Bienvenue sur HikmaClips !',
        });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue !',
        });
      }
      setShowSignInPopup(false);
      setGenerationCount(0);
      setAuthEmail('');
      setAuthPassword('');
    } catch (error: any) {
      console.error('Erreur auth email:', error);
      let message = "Une erreur s'est produite.";
      if (error.code === 'auth/email-already-in-use') {
        message = 'Cet email est déjà utilisé. Essayez de vous connecter.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Adresse email invalide.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Email ou mot de passe incorrect.';
      }
      setAuthError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté.',
    });
  };


  const handleGenerateAiContent = async () => {
    if (!user && generationCount >= 10) {
      setShowSignInPopup(true);
      return;
    }

    // Consomme le buffer si disponible → réponse instantanée
    if (contentBuffer.length > 0) {
      const [next, ...rest] = contentBuffer;
      setContentBuffer(rest);
      setContent(next);
      if (!user) setGenerationCount(prev => prev + 1);
      if (isFirstTime) { markAsGenerated(); setShowTooltipGuide(false); }
      // Recharge 1 rappel en arrière-plan pour maintenir le buffer
      if (rest.length < 2) fillBuffer(category, topic, 2);
      return;
    }

    // Fallback : appel direct si buffer vide
    setIsGenerating(true);
    try {
      const result = await generateHadith({ category, topic });
      if (result && result.content) {
        setContent(result);
        if (!user) {
          setGenerationCount(prev => prev + 1);
        }
        // Recharge le buffer en arrière-plan
        fillBuffer(category, topic, 3);
      } else {
        throw new Error('La génération a échoué ou n\'a retourné aucun contenu.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: msg || 'Impossible de charger le contenu. Réessayez.',
      });
    } finally {
      setIsGenerating(false);
      // Mark as generated for first-time users
      if (isFirstTime) {
        markAsGenerated();
        setShowTooltipGuide(false);
      }
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
    touchStartY.current = null;
    touchStartX.current = null;

    // Only trigger if vertical swipe is dominant and > 60px
    if (Math.abs(deltaY) < 60 || deltaX > Math.abs(deltaY)) return;

    if (deltaY > 0) {
      // Swipe UP → generate new quote
      if (content) {
        setContentHistory(prev => [...prev, content]);
        setHistoryIndex(-1);
      }
      handleGenerateAiContent();
    } else {
      // Swipe DOWN → go back to previous quote
      if (contentHistory.length > 0) {
        const newIndex = historyIndex === -1 ? contentHistory.length - 1 : Math.max(0, historyIndex - 1);
        const prevContent = contentHistory[newIndex];
        if (prevContent) {
          setContent(prevContent);
          setHistoryIndex(newIndex);
          setAnimationKey(prev => prev + 1);
        }
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isLoadingBg, setIsLoadingBg] = useState(false);

  const handleRandomBackground = async () => {
    setIsLoadingBg(true);
    try {
      const url = await fetchUnsplashBackground(category);
      if (url) {
        setBackground(url);
        return;
      }
    } catch { /* fall through */ }
    finally {
      setIsLoadingBg(false);
    }
    // Fallback : images locales
    const pool = PlaceHolderImages;
    setBackground(pool[Math.floor(Math.random() * pool.length)].imageUrl);
  };

  const generateCanvas = async () => {
    const previewEl = previewRef.current;
    if (!previewEl || !content) return null;

    try {
      // Pour html2canvas, on s'assure que toutes les images sont chargées
      const canvas = await html2canvas(previewEl, {
        useCORS: true,
        allowTaint: false,
        scale: 3,
        logging: false,
        backgroundColor: '#000000',
      });
      return canvas;
    } catch (error) {
      console.error('La génération du canvas a échoué:', error);
      return null;
    }
  };

  const handleDownloadImage = useCallback(async () => {
    if (!content) {
      toast({
        variant: 'destructive',
        title: 'Impossible de préparer l\'image',
        description: 'Veuillez d\'abord choisir un contenu.',
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: 'Génération de l\'image en cours...',
      description: 'Veuillez patienter...',
    });

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas null');

      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `hikmaclips_${category}_${Date.now()}.png`;

      // Try native download first if on mobile
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });
        toast({
          title: 'Image sauvegardée !',
          description: `Enregistrée dans vos documents sous le nom ${fileName}`,
        });
      } catch (nativeError) {
        // Fallback to web download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        toast({
          title: 'Image téléchargée !',
          description: 'Votre image a été enregistrée via le navigateur.',
        });
      }
    } catch (error) {
      console.error('La génération de l\'image a échoué:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La génération de l\'image a échoué. Réessayez.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, category, toast]);

  const handleShareImage = useCallback(async () => {
    if (!content) {
      toast({
        variant: 'destructive',
        title: 'Impossible de partager',
        description: 'Veuillez d\'abord générer un contenu.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas null');

      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `hikma_${Date.now()}.png`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Attempt to share directly
      try {
        await Share.share({
          title: 'Ma Hikma du jour',
          text: `Découvrez cette sagesse sur HikmaClips : "${content.content}" - ${content.source}`,
          files: [savedFile.uri],
          dialogTitle: 'Partager avec...',
        });

        toast({
          title: 'Partage ouvert',
          description: 'Choisissez une application pour partager votre Hikma.',
        });
      } catch (shareError) {
        // Share API not available, fallback to download toast
        toast({
          title: 'Image prête à télécharger',
          description: 'Utilisez le bouton Télécharger pour sauvegarder l\'image.',
        });
      }

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue. Réessayez.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, toast]);

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-400 overflow-hidden select-none md:flex md:flex-col md:bg-background">
      {/* Hidden file input for background upload */}
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Header with Sidebar Trigger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10 shadow-sm overflow-hidden safe-area-top hidden md:flex">
        <div className="container mx-auto flex min-h-14 items-center justify-between px-3 sm:px-4 relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2 hidden md:flex">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <Sidebar
                topic={topic}
                setTopic={setTopic}
                onRandomBackground={handleRandomBackground}
                onUploadClick={() => document.getElementById('file-upload')?.click()}
                user={user}
                onSignIn={() => setShowSignInPopup(true)} // Modified to show email popup
                onSignOut={handleSignOut}
                onShare={handleShareImage}
                signature={signature}
                setSignature={setSignature}
                hideRedundant={true}
                isMobile={true}
              />
            </Sheet>
            {/* Center Logo on Mobile */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:ml-4">
              <a href="/generateur" className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95">
                <Image src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png" alt="HikmaClips" width={32} height={32} className="rounded-lg shadow-sm" />
                <span className="text-base sm:text-lg font-bold text-hikma-gradient tracking-tight font-display md:hidden">HikmaClips</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setIsDesktopSidebarOpen((v) => !v)}
                title={isDesktopSidebarOpen ? 'Fermer le panneau de réglages' : 'Ouvrir le panneau de réglages'}
              >
                {isDesktopSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </Button>
              <ThemeToggle />
              <div className="w-10 h-10 md:hidden" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex pt-0 md:pt-14 overflow-hidden safe-area-top">
        {/* Persistent Sidebar for Desktop — collapsible via header toggle */}
        <aside
          className={cn(
            "hidden md:block border-r bg-background/50 backdrop-blur-sm custom-scrollbar overflow-x-hidden transition-all duration-300 ease-in-out shrink-0",
            isDesktopSidebarOpen ? "w-80 p-6 opacity-100 overflow-y-auto" : "w-0 p-0 opacity-0 pointer-events-none border-r-0 overflow-y-hidden"
          )}
        >
          <SidebarContent
            topic={topic}
            setTopic={setTopic}
            onRandomBackground={handleRandomBackground}
            onUploadClick={() => document.getElementById('file-upload')?.click()}
            user={user}
            onSignIn={() => setShowSignInPopup(true)}
            onSignOut={handleSignOut}
            onShare={handleShareImage}
            format={format}
            setFormat={setFormat}
            fontFamily={fontFamily as any}
            setFontFamily={(f) => setFontFamily(f)}
            fontSize={fontSize}
            setFontSize={setFontSize}
            signature={signature}
            setSignature={setSignature}
            brightness={brightness}
            setBrightness={setBrightness}
            contrast={contrast}
            setContrast={setContrast}
            saturation={saturation}
            setSaturation={setSaturation}
            isStudio={true}
          />
        </aside>

        {/* Main Preview Container */}
        <main className={cn(
          "flex-1 preview-container relative overflow-hidden flex justify-center items-center",
          "md:pb-20"
        )}>
          <div className="relative w-full h-full flex items-center justify-center p-0 md:p-4">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={cn(
                "bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-400 p-0 md:p-2 shadow-2xl transition-all duration-300 relative overflow-hidden",
                "fixed inset-0 md:relative",
                format === 'story'
                  ? "md:h-[673px] md:w-[320px] lg:w-[340px] lg:h-[715px] md:rounded-[40px]"
                  : "md:h-[400px] md:w-[400px] lg:w-[450px] lg:h-[450px] md:rounded-2xl"
              )}
            >
              <div
                ref={previewRef}
                className={cn(
                  "relative h-full w-full overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-400",
                  "md:rounded-[32px]"
                )}
              >
                <img
                  src={background}
                  alt="Arrière-plan"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                  crossOrigin="anonymous"
                  key={background}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/25 via-transparent to-amber-900/40" />

                {(isGenerating && !content) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white/80">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-sm text-center">Génération...</p>
                  </div>
                )}

                {content && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-10 overflow-hidden md:pb-8 pb-[300px]">
                    <div className="text-center w-full max-w-4xl max-h-full flex flex-col justify-center">
                      <div
                        className="font-extrabold leading-tight tracking-tight px-4 text-white drop-shadow-lg"
                        style={{ fontSize: `${fontSize}px`, fontFamily }}
                      >
                        <AnimatePresence mode="wait">
                          {showAnimations ? (
                            <motion.div
                              key={animationKey + (content?.content || '')}
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.05 } },
                              }}
                            >
                              "
                              {(content?.content || '').split(' ').map((word, i) => (
                                <motion.span
                                  key={i}
                                  variants={{
                                    hidden: { opacity: 0, y: 10, filter: 'blur(8px)', scale: 0.9, rotate: -2 },
                                    visible: {
                                      opacity: 1,
                                      y: 0,
                                      filter: 'blur(0px)',
                                      scale: 1,
                                      rotate: 0,
                                      transition: {
                                        type: 'spring',
                                        damping: 12,
                                        stiffness: 100,
                                        duration: 0.5
                                      }
                                    },
                                  }}
                                  className="inline-block mr-2"
                                >
                                  {word}
                                </motion.span>
                              ))}
                              "
                            </motion.div>
                          ) : (
                            <div>"{content?.content}"</div>
                          )}
                        </AnimatePresence>
                      </div>
                      {showAnimations ? (
                        <motion.p
                          key={animationKey + (content?.source || '')}
                          initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          transition={{
                            delay: (content?.content || '').split(' ').length * 0.05 + 0.3,
                            duration: 0.8,
                            ease: "easeOut"
                          }}
                          className="mt-6 text-sm sm:text-lg font-bold italic tracking-widest uppercase opacity-70 text-white/90"
                        >
                          — {content?.source} —
                        </motion.p>
                      ) : (
                        <p className="mt-6 text-sm sm:text-lg font-bold italic tracking-widest uppercase opacity-70 text-white/90">
                          — {content?.source} —
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {signature && (
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[9px] font-medium tracking-wide text-white/40">
                      {signature}
                    </p>
                  </div>
                )}

                {/* Swipe hint animation for first-time users */}
                <SwipeHintOverlay />

                {!content && !isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center text-white/40 flex flex-col items-center gap-3">
                      <Sparkles className="w-8 h-8 opacity-20" />
                      <p className="text-sm">Votre Hikma apparaîtra ici.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



        </main>
      </div>

      {/* ── DESKTOP BOTTOM BAR ── */}
      <div
        className={cn(
          "hidden md:flex fixed bottom-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 px-6 py-3 items-center gap-4 transition-all duration-300 ease-in-out",
          isDesktopSidebarOpen ? "left-80" : "left-0"
        )}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {[
            { id: 'coran',      icon: BookMarked, label: 'Coran'   },
            { id: 'hadith',     icon: BookOpen,   label: 'Hadith'  },
            { id: 'citadelle',  icon: Sparkles,   label: 'Douas'   },
            { id: 'thematique', icon: LayoutGrid, label: 'Thème'   },
            { id: 'ramadan',    icon: Moon,       label: 'Ramadan' },
            { id: 'rabbana',    icon: Heart,      label: 'Rabbana' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id as Category); setContentBuffer([]); fillBuffer(cat.id as Category, topic, 3); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                category === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/60 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Topic input */}
        <div className="flex-1 flex items-center gap-2 bg-muted/60 rounded-full border border-border px-4 h-9">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateAiContent(); }}
            placeholder="Thème : patience, gratitude, amour..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 outline-none"
          />
          {topic && <button onClick={() => setTopic('')} className="text-muted-foreground/50 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleFavorite}
            className={cn("w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110",
              content && favorites.includes(content.content)
                ? "bg-red-500/20 border-red-400/50 text-red-500"
                : "bg-muted/60 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", content && favorites.includes(content.content) ? "fill-current" : "")} />
          </button>
          <button onClick={handleDownloadImage} className="w-9 h-9 rounded-full bg-muted/60 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleShareImage} className="w-9 h-9 rounded-full bg-muted/60 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110">
            <Share2 className="w-4 h-4" />
          </button>

          {/* Generate button */}
          <button
            onClick={handleGenerateAiContent}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>

      {/* 4. MOBILE UI — Bottom Sheet ergonomics */}
      <div className="md:hidden">

        {/* TOP BAR: Réglages + Crown */}
        <div className="absolute top-0 left-0 right-0 z-40 flex justify-between items-center px-5 pt-12 pb-4 pointer-events-none">
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(true)}
            className="pointer-events-auto h-10 px-4 rounded-full bg-emerald-900/30 backdrop-blur-md border border-white/20 text-white flex items-center gap-2 shadow-lg"
            aria-label="Réglages"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Réglages</span>
          </Button>
          <Button variant="ghost" size="icon" className="pointer-events-auto w-10 h-10 rounded-2xl bg-amber-900/30 backdrop-blur-md border border-white/20 text-yellow-300 shadow-lg" aria-label="Premium">
            <Crown className="w-4 h-4" />
          </Button>
        </div>

        {/* BOTTOM SHEET: swipeable */}
        <motion.div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-emerald-700/95 via-emerald-600/90 to-teal-600/85 backdrop-blur-2xl rounded-t-[2rem] border-t border-white/20 shadow-[0_-10px_40px_rgba(16,185,129,0.35)] cursor-grab active:cursor-grabbing"
          style={{ paddingBottom: 'max(3.5rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
          initial={{ y: sheetHeight - PEEK }}
          animate={{ y: isSheetOpen ? 0 : sheetHeight - PEEK }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: sheetHeight - PEEK }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.velocity.y < -300 || info.offset.y < -60) setIsSheetOpen(true);
            if (info.velocity.y > 300 || info.offset.y > 60) setIsSheetOpen(false);
          }}
          onLayoutMeasure={(measured) => setSheetHeight(measured.height)}
        >
          {/* Handle — tap pour ouvrir/fermer */}
          <div
            className="flex flex-col items-center pt-3 pb-2 cursor-pointer"
            onClick={() => setIsSheetOpen(v => !v)}
          >
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          {/* CATÉGORIES — pills scrollables */}
          <div className="relative mb-4">
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-emerald-700/90 to-transparent z-10 pointer-events-none" />
            <div className="flex overflow-x-auto gap-2 px-4 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'coran',        label: 'Coran'   },
                { id: 'hadith',       label: 'Hadith'  },
                { id: 'ramadan',      label: 'Ramadan' },
                { id: 'citadelle',    label: 'Douas'   },
                { id: 'thematique',   label: 'Thème'   },
                { id: 'rabbana',      label: 'Rabbana' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id as Category); setContentBuffer([]); fillBuffer(cat.id as Category, topic, 3); }}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-95",
                    category === cat.id
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                      : "bg-white/8 border border-white/10 text-white/60"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT THÈME */}
          <div className="mx-4 mb-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 h-12">
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); handleGenerateAiContent(); } }}
              placeholder="Thème : patience, gratitude..."
              className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/25 outline-none min-w-0"
            />
            {topic && (
              <button onClick={() => setTopic('')} className="flex-shrink-0 text-white/30 active:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* TOOLBAR SECONDAIRE */}
          <div className="mx-4 mb-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center px-1">
            {[
              { icon: ImageIcon, label: 'Galerie',  onClick: () => setIsGalleryOpen(true),       color: 'hover:text-primary' },
              { icon: Palette,   label: 'Design',   onClick: () => setIsToolsDrawerOpen(true),   color: 'hover:text-primary' },
              { icon: RefreshCw, label: 'Fond',     onClick: handleRandomBackground,              color: 'hover:text-primary', loading: isLoadingBg },
              { icon: Share2,    label: 'Partager', onClick: handleShareImage,                    color: 'hover:text-blue-400' },
              { icon: Download,  label: 'Sauver',   onClick: handleDownloadImage,                 color: 'hover:text-white'   },
            ].map((action, i, arr) => (
              <div key={action.label} className="flex items-center flex-1 justify-center">
                <button
                  onClick={action.onClick}
                  disabled={'loading' in action && action.loading}
                  className={cn("flex flex-col items-center justify-center w-full h-14 rounded-xl text-white/40 transition-all active:scale-90 disabled:opacity-40", action.color)}
                >
                  <action.icon className={cn("w-5 h-5 mb-0.5", 'loading' in action && action.loading ? 'animate-spin' : '')} />
                  <span className="text-[9px] font-medium">{action.label}</span>
                </button>
                {i < arr.length - 1 && <div className="w-px h-5 bg-white/10 flex-shrink-0" />}
              </div>
            ))}
            <div className="flex items-center flex-1 justify-center">
              <div className="w-px h-5 bg-white/10 flex-shrink-0 mr-0" />
              <button
                onClick={handleFavorite}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-14 rounded-xl transition-all active:scale-90",
                  favorites.includes(content?.content || '') ? "text-red-400" : "text-white/40 hover:text-red-400"
                )}
              >
                <Heart className={cn("w-5 h-5 mb-0.5", favorites.includes(content?.content || '') ? "fill-current" : "")} />
                <span className="text-[9px] font-medium">Aimer</span>
              </button>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <div className="w-px h-5 bg-white/10 flex-shrink-0 mr-0" />
              <button
                onClick={() => router.push('/favoris')}
                className="flex flex-col items-center justify-center w-full h-14 rounded-xl text-white/40 hover:text-yellow-400 transition-all active:scale-90"
              >
                <BookMarked className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium">Favoris</span>
              </button>
            </div>
          </div>

          {/* BOUTON GÉNÉRER — pleine largeur */}
          <div className="mx-4">
            <button
              onClick={handleGenerateAiContent}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_8px_24px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Génération...</>
                : <><Sparkles className="w-5 h-5" /> Je veux mon rappel du jour</>
              }
            </button>
          </div>
        </motion.div>
      </div>

      {/* Legacy Mobile Components (Kept for desktop or potential reuse, hidden by layout logic if needed) */}
      <div className="hidden">
        <MobileLeftToolbar
          onRandom={handleRandomBackground}
          onUpload={() => document.getElementById('file-upload')?.click()}
          onShare={handleShareImage}
          onDownload={handleDownloadImage}
          onFavorite={handleFavorite}
          isLiked={content ? favorites.includes(content.content) : false}
        />

        <BottomControls
          category={category}
          setCategory={setCategory}
          onGenerate={handleGenerateAiContent}
          isGenerating={isGenerating}
          onRandom={handleRandomBackground}
          onUpload={() => document.getElementById('file-upload')?.click()}
          onDownload={handleDownloadImage}
          onRessources={() => window.location.href = '/ressources'}
          onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
          onOpenToolsDrawer={() => setIsToolsDrawerOpen(true)}
        />
      </div>

      {/* Category Drawer */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)
        }
        category={category}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setContentBuffer([]);
          fillBuffer(cat, topic, 3);
        }}
      />

      {/* Tools Drawer */}
      <ToolsDrawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        onToolSelect={(tool) => {
          if (tool === 'font') {
            setActiveMobileTool('font');
          } else if (tool === 'format') {
            setActiveMobileTool('format');
          } else if (tool === 'gallery') {
            setIsGalleryOpen(true);
          } else if (tool === 'resources') {
            router.push('/ressources');
          } else if (tool === 'updates') {
            router.push('/updates');
          } else if (tool === 'feedback') {
            router.push('/feedback');
          } else if (tool === 'signature') {
            setActiveMobileTool('signature');
          } else if (tool === 'settings') {
            setIsSidebarOpen(true);
          }
        }}
      />

      <CloudinaryGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentBackground={background}
        onSelect={(url: string) => {
          setBackground(url);
          setIsGalleryOpen(false);
        }}
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

      {/* Sidebar / Settings */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <Sidebar
          topic={topic}
          setTopic={setTopic}
          onRandomBackground={handleRandomBackground}
          onUploadClick={() => document.getElementById('file-upload')?.click()}
          user={user}
          onSignIn={() => setShowSignInPopup(true)}
          onSignOut={() => signOut(auth)}
          onShare={handleShareImage}
          isStudio={true}
          format={format}
          setFormat={setFormat}
          fontFamily={fontFamily as any}
          setFontFamily={setFontFamily as any}
          fontSize={fontSize}
          setFontSize={setFontSize}
          signature={signature}
          setSignature={setSignature}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          saturation={saturation}
          setSaturation={setSaturation}
          isMobile={true}
        />
      </Sheet>

      {/* Auth Popups & Overlays */}
      <AlertDialog open={showSignInPopup} onOpenChange={(open) => {
        setShowSignInPopup(open);
        if (!open) {
          setAuthError('');
          setAuthEmail('');
          setAuthPassword('');
        }
      }}>
        <AlertDialogContent className="max-w-md overflow-hidden bg-background/95 backdrop-blur-xl border-purple-500/20">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 rounded-full w-9 h-9 bg-muted hover:bg-red-100 hover:text-red-600 text-muted-foreground border border-border transition-all z-50 shadow-sm"
            onClick={() => setShowSignInPopup(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fermer</span>
          </Button>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-2xl font-display text-center text-purple-800 dark:text-purple-100">
              Débloquez l'expérience complète
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground pt-2">
              Salam Aleykoum ! Vous avez atteint la limite de 10 générations gratuites.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Avantages */}
            <div className="space-y-3 bg-purple-50/50 dark:bg-purple-800/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-700">
              <h4 className="font-bold text-sm text-purple-700 dark:text-purple-200 flex items-center gap-2">
                <span className="bg-purple-200 dark:bg-purple-700 p-1 rounded-full text-[10px]">VIP</span>
                Pourquoi s'inscrire ?
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Générations illimitées avec l'IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Accès aux thèmes exclusifs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">✓</span> Sauvegarde de vos créations (Bientôt)
                </li>
              </ul>
            </div>

            {/* Message d'invitation */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                🚀 Soutenez le projet en invitant vos proches à tester HikmaClips !
              </p>
            </div>

            {/* Formulaire Auth */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <Input
                type="email"
                placeholder="Votre Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                disabled={isConnecting}
                className="bg-background/50"
              />
              <Input
                type="password"
                placeholder="Votre Mot de passe"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={isConnecting}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                className="bg-background/50"
              />

              {authError && (
                <p className="text-xs text-red-500 text-center font-medium animate-shake">{authError}</p>
              )}

              <Button
                onClick={handleEmailAuth}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-500/20"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {authMode === 'signup' ? "Créer mon compte gratuit" : 'Se connecter'}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-2">
                {authMode === 'signup' ? (
                  <>Déjà inscrit ? <button onClick={() => setAuthMode('login')} className="text-purple-500 font-bold hover:underline">Connexion</button></>
                ) : (
                  <>Pas de compte ? <button onClick={() => setAuthMode('signup')} className="text-purple-500 font-bold hover:underline">S'inscrire gratuitement</button></>
                )}
              </p>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tooltip Guide for first-time users */}
      <TooltipGuide
        isActive={showTooltipGuide && isFirstTime}
        onComplete={() => setShowTooltipGuide(false)}
        onSkip={() => setShowTooltipGuide(false)}
      />
    </div >
  );
}
