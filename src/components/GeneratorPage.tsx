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
  HelpCircle,
  Copy,
  Check,
  Zap,
  Shuffle,
  LibraryBig,
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



import { getFavorites, toggleFavorite, cn, updateStreak } from '@/lib/utils';
import { growGarden, getGardenState } from '@/lib/garden';
import { PlantWidget } from '@/components/garden/PlantWidget';
import { GardenView } from '@/components/garden/GardenView';
import { NameSeedModal } from '@/components/garden/NameSeedModal';




type Content = {
  content: string;
  source: string;
  arabe?: string;
  surah?: number;
  ayah?: number;
};

const category: Category[] = ['hadith', 'ramadan', 'thematique', 'coran', 'recherche-ia', 'citadelle', 'rabbana'];

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia' | 'citadelle' | 'rabbana';

export default function GeneratorPage() {
  const [content, setContent] = useState<Content | null>({
    content: "Et rappelle, car le rappel profite aux croyants",
    source: "Sourate Adh-Dhâriyât, v. 55",
    arabe: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
    surah: 51,
    ayah: 55
  });

  // Quote history for swipe navigation
  const [contentHistory, setContentHistory] = useState<Content[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const handledGenerateParam = useRef(false);

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
  const [fontSize, setFontSize] = useState(22);
  const [fontFamily, setFontFamily] = useState("var(--font-display), sans-serif");
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [signature, setSignature] = useState('hikmaclips.woosenteur.fr');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isPremiumSheetOpen, setIsPremiumSheetOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isGardenOpen, setIsGardenOpen] = useState(false);
  const [isNameSeedOpen, setIsNameSeedOpen] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites().map(f => f.fr));
    updateStreak();
    growGarden('daily_open');

    // Palier de lumière toutes les 5 minutes passées activement sur l'app
    const TIME_TICK_MS = 5 * 60 * 1000;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        growGarden('time_spent');
      }
    }, TIME_TICK_MS);

    // Rituel de nommage de la graine, une seule fois. Pour un utilisateur deja
    // familier (onboarding deja vu), on peut le proposer tout de suite ; pour un
    // nouvel utilisateur, on attend la fin du tour de decouverte (voir plus bas).
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding) maybeOpenNamePrompt();

    return () => clearInterval(interval);
  }, []);

  const maybeOpenNamePrompt = useCallback(() => {
    const gardenState = getGardenState();
    if (!gardenState.namePromptShown) setIsNameSeedOpen(true);
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
    if (isLiked) growGarden('favorite', { hikmaId: hikma.fr });

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

    if (searchParams.get('generate') === '1' && !handledGenerateParam.current) {
      handledGenerateParam.current = true;
      window.setTimeout(() => {
        void handleGenerateAiContent();
        router.replace('/generateur');
      }, 250);
    }
  }, [searchParams]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    // Ouvre la feuille du bas pour que tous les éléments du tutoriel soient visibles
    setIsSheetOpen(true);
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

    // Nouvelle image à chaque génération, en parallèle du texte
    handleRandomBackground();

    // Consomme le buffer si disponible → réponse instantanée
    if (contentBuffer.length > 0) {
      const [next, ...rest] = contentBuffer;
      setContentBuffer(rest);
      setContent(next);
      growGarden('generate_image');
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
        growGarden('generate_image');
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
    const candidates = PlaceHolderImages.filter((item) => item.imageUrl !== background);
    const pool = candidates.length > 0 ? candidates : PlaceHolderImages;
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
        growGarden('share');

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

  const handleCopyText = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(`“${content.content}”\n— ${content.source}\n\nvia HikmaClips`);
    setHasCopied(true);
    toast({ title: 'Texte copié', description: 'La sagesse et sa source sont dans le presse-papiers.' });
    window.setTimeout(() => setHasCopied(false), 1800);
  }, [content, toast]);

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] overflow-hidden select-none md:flex md:flex-col md:bg-background">
      {/* Hidden file input for background upload */}
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Header with Sidebar Trigger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFAF7]/90 backdrop-blur-md border-b border-[#ECE8DF] shadow-sm overflow-hidden safe-area-top hidden md:flex [font-family:var(--font-hikma-ui)]">
        <div className="container mx-auto flex min-h-14 items-center justify-between px-3 sm:px-4 relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2 hidden md:flex text-[#3D4A42] hover:bg-[#F0ECE3] hover:text-[#14201A]">
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
                <Image src="/logo-hikmaclips.png" alt="HikmaClips" width={32} height={32} className="rounded-lg shadow-sm object-contain" />
                <span className="text-base sm:text-lg font-bold tracking-tight [font-family:var(--font-display)] md:hidden">
                  <span className="text-[#2E9E44]">Hikma</span><span className="text-[#F5960F]">Clips</span>
                </span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-[#3D4A42] hover:bg-[#F0ECE3] hover:text-[#14201A]"
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
            "hidden md:block border-r border-[#ECE8DF] bg-[#FBFAF7]/80 backdrop-blur-sm custom-scrollbar overflow-x-hidden transition-all duration-300 ease-in-out shrink-0 [font-family:var(--font-hikma-ui)]",
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
                "bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] p-0 md:p-2 shadow-2xl transition-all duration-300 relative overflow-hidden",
                "fixed inset-0 md:relative",
                format === 'story'
                  ? "md:h-[673px] md:w-[320px] lg:w-[340px] lg:h-[715px] md:rounded-[40px]"
                  : "md:h-[400px] md:w-[400px] lg:w-[450px] lg:h-[450px] md:rounded-2xl"
              )}
            >
              <div
                ref={previewRef}
                className={cn(
                  "relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)]",
                  "md:rounded-[32px]"
                )}
              >
                <img
                  src={background}
                  alt="Arrière-plan"
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                  crossOrigin="anonymous"
                  key={background}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/45 md:from-emerald-900/25 md:via-transparent md:to-amber-900/40" />
                <div className="absolute left-1/2 top-[32%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-[46px] md:hidden" />

                {(isGenerating && !content) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white/80">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-sm text-center">Génération...</p>
                  </div>
                )}

                {content && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-7 pb-40 pr-20 pt-28 md:px-10 md:pb-10 md:pt-10">
                    <div className="flex max-h-full w-full max-w-4xl flex-col items-start justify-center text-left md:items-center md:text-center">
                      {content.arabe && (
                        <p dir="rtl" className="mb-2.5 w-full pr-2 text-right text-[20px] leading-[1.5] text-white/90 [font-family:Amiri,serif] md:text-center md:text-[23px]">
                          {content.arabe}
                        </p>
                      )}
                      <div
                        className="px-0 font-bold leading-[1.08] tracking-[-0.035em] text-white drop-shadow-lg md:px-4"
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
                          className="mt-6 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/85 before:h-0.5 before:w-7 before:bg-white/70 before:content-[''] md:text-sm"
                        >
                          — {content?.source} —
                        </motion.p>
                      ) : (
                        <p className="mt-6 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/85 before:h-0.5 before:w-7 before:bg-white/70 before:content-[''] md:text-sm">
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
          "hidden md:flex fixed bottom-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#ECE8DF] px-6 py-3 items-center gap-4 transition-all duration-300 ease-in-out shadow-[0_-8px_24px_rgba(16,61,36,0.08)] [font-family:var(--font-hikma-ui)]",
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
                  ? "bg-[#2E9E44] text-white border-[#2E9E44] shadow-md"
                  : "bg-[#F5F1E8] text-[#7A857D] border-transparent hover:border-[#2E9E44]/30 hover:text-[#14201A]"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Topic input */}
        <div className="flex-1 flex items-center gap-2 bg-[#F5F1E8] rounded-full border border-[#ECE8DF] px-4 h-9">
          <Search className="w-4 h-4 text-[#9AA39B] flex-shrink-0" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateAiContent(); }}
            placeholder="Thème : patience, gratitude, amour..."
            className="flex-1 bg-transparent text-sm text-[#14201A] placeholder:text-[#9AA39B] outline-none"
          />
          {topic && <button onClick={() => setTopic('')} className="text-[#9AA39B] hover:text-[#14201A]"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="[&>button]:bg-[#F5F1E8] [&>button]:border-[#ECE8DF]">
            <PlantWidget onClick={() => setIsGardenOpen(true)} />
          </div>
          <button
            onClick={handleFavorite}
            className={cn("w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110",
              content && favorites.includes(content.content)
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-[#F5F1E8] border-[#ECE8DF] text-[#7A857D] hover:text-[#14201A]"
            )}
          >
            <Heart className={cn("w-4 h-4", content && favorites.includes(content.content) ? "fill-current" : "")} />
          </button>
          <button onClick={handleDownloadImage} className="w-9 h-9 rounded-full bg-[#F5F1E8] border border-[#ECE8DF] flex items-center justify-center text-[#7A857D] hover:text-[#14201A] transition-all hover:scale-110">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleShareImage} className="w-9 h-9 rounded-full bg-[#F5F1E8] border border-[#ECE8DF] flex items-center justify-center text-[#7A857D] hover:text-[#14201A] transition-all hover:scale-110">
            <Share2 className="w-4 h-4" />
          </button>

          {/* Generate button */}
          <button
            onClick={handleGenerateAiContent}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 h-9 rounded-full bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#2E9E44]/25 disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>

      {/* 4. MOBILE UI — Bottom Sheet ergonomics */}
      <div className="hidden">

        {/* TOP BAR: Réglages + Crown */}
        <div className="absolute top-0 left-0 right-0 z-40 flex justify-between items-center px-5 pt-12 pb-4 pointer-events-none">
          <Button
            id="legacy-tour-settings"
            variant="ghost"
            onClick={() => setIsSidebarOpen(true)}
            className="pointer-events-auto h-10 px-4 rounded-full bg-emerald-900/30 backdrop-blur-md border border-white/20 text-white flex items-center gap-2 shadow-lg"
            aria-label="Réglages"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Réglages</span>
          </Button>
          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSheetOpen(true);
                setTimeout(() => setShowTooltipGuide(true), 400);
              }}
              className="w-10 h-10 rounded-2xl bg-sky-900/30 backdrop-blur-md border border-white/20 text-sky-300 shadow-lg"
              aria-label="Revoir le tutoriel"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-amber-900/30 backdrop-blur-md border border-white/20 text-yellow-300 shadow-lg" aria-label="Premium">
              <Crown className="w-4 h-4" />
            </Button>
          </div>
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
          onLayoutMeasure={(measured) => setSheetHeight(measured.y.max - measured.y.min)}
        >
          {/* Handle — tap pour ouvrir/fermer */}
          <div
            className="flex flex-col items-center pt-3 pb-2 cursor-pointer"
            onClick={() => setIsSheetOpen(v => !v)}
          >
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          {/* CATÉGORIES — pills scrollables */}
          <div id="legacy-tour-categories" className="relative mb-4">
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
          <div id="legacy-tour-topic" className="mx-4 mb-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 h-12">
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
          <div id="legacy-tour-toolbar" className="mx-4 mb-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center px-1">
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
              id="legacy-tour-generate"
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

      {/* MOBILE UI — port fidèle de la direction « Gradient expressif » */}
      <div className="md:hidden [font-family:var(--font-hikma-ui)]">
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-4 pb-4 pt-[max(3.25rem,calc(env(safe-area-inset-top)+1.25rem))]">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              id="tour-agent"
              onClick={() => router.push('/settings')}
              className="flex h-8 items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 text-white shadow-sm backdrop-blur-[10px] active:scale-95"
              aria-label="Réglages"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em]">Réglages</span>
            </button>
            <PlantWidget id="tour-garden" onClick={() => setIsGardenOpen(true)} />
          </div>
          <button
            id="tour-premium"
            onClick={() => setIsPremiumSheetOpen(true)}
            className="pointer-events-auto flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-3 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-[10px] active:scale-95"
            aria-label="Découvrir Premium"
          >
            <Crown className="h-3.5 w-3.5 text-[#FFD27A]" /> Premium
          </button>
        </div>

        {/* Champ de saisie du thème */}
        <div
          id="tour-topic"
          className="pointer-events-none absolute left-4 right-4 z-40 flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 h-10 backdrop-blur-[10px] shadow-sm"
          style={{ top: 'max(6.25rem, calc(env(safe-area-inset-top) + 4.25rem))' }}
        >
          <Search className="h-4 w-4 text-white/70 flex-shrink-0" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); handleGenerateAiContent(); } }}
            placeholder="Thème : patience, gratitude, amour..."
            className="pointer-events-auto flex-1 bg-transparent text-sm text-white placeholder:text-white/55 outline-none min-w-0"
          />
          {topic && (
            <button
              onClick={() => setTopic('')}
              className="pointer-events-auto flex-shrink-0 text-white/60 hover:text-white active:scale-90"
              aria-label="Effacer le thème"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div id="tour-actions" className="absolute right-4 top-[42%] z-40 flex flex-col gap-3">
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="relative grid h-[46px] w-[46px] place-items-center rounded-full border border-white/35 bg-black/20 text-white shadow-[0_8px_20px_rgba(0,0,0,.16)] backdrop-blur-[8px] transition active:scale-90"
            aria-label="Choisir une image de fond"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#F5960F]" aria-hidden="true" />
          </button>
          <button
            onClick={handleFavorite}
            className={cn(
              "grid h-[46px] w-[46px] place-items-center rounded-full border backdrop-blur-[8px] transition active:scale-90",
              favorites.includes(content?.content || '')
                ? "border-red-200/60 bg-red-500/30 text-red-200"
                : "border-white/30 bg-white/15 text-white"
            )}
            aria-label={favorites.includes(content?.content || '') ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={cn("h-5 w-5", favorites.includes(content?.content || '') && "fill-current")} />
          </button>
          <button
            onClick={() => setIsShareSheetOpen(true)}
            className="grid h-[46px] w-[46px] place-items-center rounded-full border border-white bg-white text-[#15703A] shadow-[0_8px_20px_rgba(0,0,0,.22)] transition active:scale-90"
            aria-label="Partager ce clip"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-[6.75rem] left-0 right-0 z-30 text-center text-[10px] font-semibold tracking-[0.03em] text-white/85">
          swipe ↑ · nouveau clip
        </p>

        <nav
          id="tour-dock"
          className="absolute left-3.5 right-3.5 z-50 flex h-16 items-center justify-around rounded-[24px] border border-[#ECE8DF] bg-white px-1 shadow-[0_14px_32px_rgba(16,61,36,.24)]"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
          aria-label="Navigation principale"
        >
          <button onClick={() => setIsCategoryDrawerOpen(true)} className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#9AA39B] active:scale-90 transition">
            <LayoutGrid className="h-[18px] w-[18px]" />
            <span className="text-[8px] font-bold">Catégorie</span>
          </button>
          <button onClick={() => router.push('/recherche-hadiths')} className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#9AA39B]">
            <Search className="h-[18px] w-[18px]" />
            <span className="text-[8px] font-bold">Recherche</span>
          </button>
          <div className="relative h-full flex-1">
            <button
              id="tour-generate"
              onClick={handleGenerateAiContent}
              disabled={isGenerating}
              className="absolute left-1/2 top-0 grid h-[54px] w-[54px] -translate-x-1/2 -translate-y-3.5 place-items-center rounded-[18px] border-[3px] border-white bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white shadow-[0_10px_22px_rgba(46,158,68,.5)] transition active:scale-90 disabled:opacity-60"
              aria-label="Générer un nouveau clip"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" fill="currentColor" />}
            </button>
          </div>
          <button onClick={() => router.push('/livres')} className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#9AA39B] active:scale-90 transition">
            <LibraryBig className="h-[18px] w-[18px]" />
            <span className="text-[8px] font-bold">Biblio</span>
          </button>
          <button onClick={handleRandomBackground} className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#9AA39B] active:scale-90 transition">
            <Shuffle className="h-[18px] w-[18px]" />
            <span className="text-[8px] font-bold">Fond</span>
          </button>

        </nav>
      </div>

      <AnimatePresence>
        {isShareSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end bg-[#061009]/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareSheetOpen(false)}
          >
            <motion.section
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="w-full rounded-t-[32px] bg-[#FBFAF7] px-5 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] text-[#14201A] [font-family:var(--font-hikma-ui)]"
              onClick={(event) => event.stopPropagation()}
              aria-label="Partager ce clip"
            >
              <div className="mx-auto mb-4 mt-3 h-1.5 w-10 rounded-full bg-[#E2DDD2]" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold [font-family:var(--font-display)]">Partager ce clip</h2>
                <button onClick={() => setIsShareSheetOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-[#F0ECE3] text-[#7A857D]" aria-label="Fermer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 py-6 text-center text-white">
                <div className="absolute left-1/2 top-[40%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-[30px]" />
                <p className="relative text-lg font-bold leading-snug [font-family:var(--font-display)]">“{content?.content}”</p>
                <p className="relative mt-3 text-[8px] font-extrabold uppercase tracking-[0.2em] text-white/80">{content?.source}</p>
                <p className="relative mt-3 text-[8px] font-bold text-white/50">@hikmaclips</p>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {[
                  { label: 'WhatsApp', color: '#25D366', mark: 'W' },
                  { label: 'Instagram', color: '#E1306C', mark: '◎' },
                  { label: 'TikTok', color: '#111111', mark: '♪' },
                  { label: 'Plus', color: '#FFFFFF', mark: '•••' },
                ].map((network) => (
                  <button key={network.label} onClick={handleShareImage} className="flex flex-col items-center gap-2 text-[#3D4A42]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-black/5 text-base font-bold text-white shadow-sm" style={{ background: network.color, color: network.label === 'Plus' ? '#3D4A42' : '#FFFFFF' }}>{network.mark}</span>
                    <span className="text-[9px] font-semibold">{network.label}</span>
                  </button>
                ))}
              </div>

              <button onClick={handleDownloadImage} className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-sm font-bold text-white shadow-[0_12px_26px_rgba(46,158,68,.4)]">
                <Download className="h-4 w-4" /> Enregistrer en HD (9:16)
              </button>
              <button onClick={handleCopyText} className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#ECE8DF] bg-white text-[13px] font-bold text-[#3D4A42]">
                {hasCopied ? <Check className="h-4 w-4 text-[#2E9E44]" /> : <Copy className="h-4 w-4" />}
                {hasCopied ? 'Texte copié' : 'Copier le texte & la source'}
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPremiumSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end bg-[#061009]/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPremiumSheetOpen(false)}
          >
            <motion.section
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="relative w-full rounded-t-[32px] bg-[#FBFAF7] px-5 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] text-[#14201A] [font-family:var(--font-hikma-ui)]"
              onClick={(event) => event.stopPropagation()}
              aria-label="HikmaClips Premium"
            >
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-[#E2DDD2]" />
              <button onClick={() => setIsPremiumSheetOpen(false)} className="absolute right-5 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#F0ECE3] text-[#7A857D]" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto -mt-9 grid h-16 w-16 place-items-center rounded-[20px] border-4 border-[#FBFAF7] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white shadow-[0_12px_26px_rgba(46,158,68,.5)]">
                <Crown className="h-7 w-7" />
              </div>
              <div className="mt-3 text-center">
                <h2 className="text-[23px] font-bold tracking-tight [font-family:var(--font-display)]"><span className="text-[#15703A]">Hikma</span><span className="text-[#F5960F]">Clips</span> Premium</h2>
                <p className="mt-1 text-xs font-medium text-[#7A857D]">Diffuse la science sans limites.</p>
              </div>
              <div className="mt-5 space-y-3">
                {['Export HD 9:16 sans filigrane', 'Fonds & calligraphies exclusifs', "Générations illimitées par l'Agent", 'Signature personnalisée'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-[13px] font-semibold text-[#26302B]">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#E8F5EC] text-[#2E9E44]"><Check className="h-4 w-4" /></span>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-[15px] border border-[#ECE8DF] bg-white p-3"><p className="text-[10px] font-semibold text-[#9AA39B]">Mensuel</p><p className="mt-1 text-[17px] font-extrabold [font-family:var(--font-display)]">2,99 €<span className="text-[9px] font-semibold text-[#9AA39B]">/mois</span></p></div>
                <div className="relative rounded-[15px] border-2 border-[#2E9E44] bg-[#F3FAF4] p-3"><span className="absolute -top-2 right-2 rounded-full bg-[#2E9E44] px-2 py-0.5 text-[8px] font-extrabold text-white">-44%</span><p className="text-[10px] font-semibold text-[#2E9E44]">Annuel</p><p className="mt-1 text-[17px] font-extrabold [font-family:var(--font-display)]">19,99 €<span className="text-[9px] font-semibold text-[#9AA39B]">/an</span></p></div>
              </div>
              <button onClick={() => router.push('/pricing')} className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(46,158,68,.45)]">Essai gratuit 7 jours <span aria-hidden>→</span></button>
              <p className="mt-3 text-center text-[10px] font-medium text-[#9AA39B]">Puis 19,99 €/an · Résiliable à tout moment</p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

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

      <GardenView
        isOpen={isGardenOpen}
        onClose={() => setIsGardenOpen(false)}
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
          } else if (tool === 'tutorial') {
            setIsSheetOpen(true);
            setTimeout(() => setShowTooltipGuide(true), 400);
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
        <AlertDialogContent className="!bottom-3 !left-3 !right-3 !top-auto !w-auto !max-w-none !translate-x-0 !translate-y-0 gap-0 overflow-hidden rounded-[30px] border border-white/30 bg-[#FBFAF7] p-0 text-[#14201A] shadow-[0_28px_80px_rgba(3,34,17,.45)] [font-family:var(--font-hikma-ui)] md:!bottom-auto md:!left-1/2 md:!right-auto md:!top-1/2 md:!w-[440px] md:!-translate-x-1/2 md:!-translate-y-1/2">
          <section className="relative overflow-hidden bg-[linear-gradient(145deg,#0F5E32_0%,#2E9E44_62%,#F5960F_145%)] px-5 pb-5 pt-5 text-white">
            <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/15 blur-[2px]" />
            <div className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#F5960F]/30 blur-[30px]" />

            <button
              type="button"
              onClick={() => setShowSignInPopup(false)}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/15 text-white/85 backdrop-blur-md transition hover:bg-black/25"
              aria-label="Fermer la paywall"
            >
              <X className="h-4 w-4" />
            </button>

            <AlertDialogHeader className="relative items-start space-y-0 pr-11 text-left">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-[16px] border border-white/25 bg-white/15 shadow-[0_10px_26px_rgba(0,0,0,.16)] backdrop-blur-xl">
                  <Crown className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/75">HikmaClips Premium</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-white/90">
                    <Zap className="h-3 w-3" fill="currentColor" /> 10 clips offerts utilisés
                  </p>
                </div>
              </div>
              <AlertDialogTitle className="max-w-[310px] text-[27px] font-bold leading-[1.08] tracking-[-0.7px] text-white [font-family:var(--font-display)]">
                Continuez à diffuser la sagesse
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 max-w-[330px] text-[12px] font-medium leading-relaxed text-white/75">
                Passez en illimité et créez vos prochains clips sans interrompre votre inspiration.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {[
                ['∞', 'Clips illimités'],
                ['HD', 'Sans filigrane'],
                ['✦', 'Styles exclusifs'],
              ].map(([mark, label]) => (
                <div key={label} className="rounded-[14px] border border-white/15 bg-white/10 px-2 py-2.5 text-center backdrop-blur-md">
                  <p className="text-[13px] font-extrabold">{mark}</p>
                  <p className="mt-1 text-[8px] font-bold leading-tight text-white/75">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-h-[54vh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:max-h-[48vh]">
            <button
              type="button"
              onClick={() => {
                setShowSignInPopup(false);
                router.push('/pricing');
              }}
              className="flex w-full items-center justify-between rounded-[18px] bg-[#14201A] px-4 py-3.5 text-left text-white shadow-[0_12px_26px_rgba(20,32,26,.2)] transition active:scale-[.99]"
            >
              <span>
                <span className="block text-[13px] font-bold">Essayer Premium gratuitement</span>
                <span className="mt-1 block text-[9px] font-medium text-white/60">7 jours offerts · puis 19,99 €/an</span>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(145deg,#2E9E44,#F5960F)] text-base">→</span>
            </button>

            <div className="my-4 flex items-center gap-3 text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#A0A9A2] before:h-px before:flex-1 before:bg-[#E7E3DB] after:h-px after:flex-1 after:bg-[#E7E3DB]">
              Déjà membre ?
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                type="email"
                autoComplete="email"
                aria-label="Adresse email"
                placeholder="Votre email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                disabled={isConnecting}
                className="h-11 rounded-[14px] border-[#E7E3DB] bg-white px-3 text-[11px] shadow-none placeholder:text-[#A0A9A2] focus-visible:ring-[#2E9E44]"
              />
              <Input
                type="password"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                aria-label="Mot de passe"
                placeholder="Mot de passe"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={isConnecting}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                className="h-11 rounded-[14px] border-[#E7E3DB] bg-white px-3 text-[11px] shadow-none placeholder:text-[#A0A9A2] focus-visible:ring-[#2E9E44]"
              />
            </div>

            {authError && (
              <p className="mt-2 text-center text-[10px] font-semibold text-red-600 animate-shake">{authError}</p>
            )}

            <Button
              onClick={handleEmailAuth}
              className="mt-2.5 h-11 w-full rounded-[14px] bg-[#E8F5EC] text-[12px] font-bold text-[#15703A] shadow-none hover:bg-[#DDF0E3]"
              disabled={isConnecting}
            >
              {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
            </Button>

            <p className="mt-3 text-center text-[10px] font-medium text-[#8A948D]">
              {authMode === 'signup' ? (
                <>Déjà inscrit ? <button onClick={() => setAuthMode('login')} className="font-bold text-[#15703A] hover:underline">Connexion</button></>
              ) : (
                <>Nouveau ici ? <button onClick={() => setAuthMode('signup')} className="font-bold text-[#15703A] hover:underline">Créer un compte</button></>
              )}
            </p>
          </section>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tooltip Guide for first-time users */}
      <TooltipGuide
        isActive={showTooltipGuide}
        onComplete={() => { setShowTooltipGuide(false); maybeOpenNamePrompt(); }}
        onSkip={() => { setShowTooltipGuide(false); maybeOpenNamePrompt(); }}
      />

      <NameSeedModal isOpen={isNameSeedOpen} onDone={() => setIsNameSeedOpen(false)} />
    </div >
  );
}
