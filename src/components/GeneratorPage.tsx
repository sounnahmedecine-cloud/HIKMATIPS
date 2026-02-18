'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

const category: Category[] = ['hadith', 'ramadan', 'thematique', 'coran', 'recherche-ia', 'citadelle'];

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia' | 'citadelle';

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

  const [category, setCategory] = useState<Category>('recherche-ia');
  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMobileTool, setActiveMobileTool] = useState<'font' | 'format' | 'background' | 'signature' | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    setIsGenerating(true);
    try {
      const result = await generateHadith({ category, topic });
      if (result && result.content) {
        setContent(result);
        if (!user) {
          setGenerationCount(prev => prev + 1);
        }
      } else {
        throw new Error('La génération a échoué ou n\'a retourné aucun contenu.');
      }
    } catch (error) {
      console.error("Erreur lors de la génération avec l'Agent Hikma:", error);
      toast({
        variant: 'destructive',
        title: 'L\'Agent est occupé',
        description:
          "Une erreur s'est produite lors de la communication avec l'Assistant Hikma. Veuillez réessayer.",
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

  const handleRandomBackground = () => {
    // Prioritize Cloudinary images that match the category
    const cloudinaryImages = PlaceHolderImages.filter(img => img.imageUrl.includes('cloudinary'));

    const relevantImages = (cloudinaryImages.length > 0 ? cloudinaryImages : PlaceHolderImages).filter(img => {
      const hint = img.imageHint.toLowerCase();
      if (category === 'hadith' || category === 'coran' || category === 'thematique') {
        return hint.includes('islamic') || hint.includes('nature') || hint.includes('serene') || hint.includes('abstract');
      }
      if (category === 'ramadan') {
        return hint.includes('ramadan') || hint.includes('islamic') || hint.includes('mosque') || hint.includes('lantern');
      }
      return true;
    });

    const pool = relevantImages.length > 0 ? relevantImages : (cloudinaryImages.length > 0 ? cloudinaryImages : PlaceHolderImages);
    const randomIndex = Math.floor(Math.random() * pool.length);
    setBackground(pool[randomIndex].imageUrl);
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

    } catch (error) {
      console.error('Le partage a échoué:', error);
      toast({
        variant: 'destructive',
        title: 'Partage indisponible',
        description: 'Le partage natif n\'est pas supporté sur cet appareil. Utilisez le bouton Télécharger.',
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
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none md:relative md:flex md:flex-col md:bg-background">
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
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95">
                <Image src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png" alt="HikmaClips" width={32} height={32} className="rounded-lg shadow-sm" />
                <span className="text-base sm:text-lg font-bold text-hikma-gradient tracking-tight font-display md:hidden">HikmaClips</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-10 h-10 md:hidden" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex pt-0 md:pt-14 overflow-hidden safe-area-top">
        {/* Persistent Sidebar for Desktop */}
        <aside className="hidden md:block w-80 border-r bg-background/50 backdrop-blur-sm overflow-y-auto custom-scrollbar p-6">
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
          "md:pb-24"
        )}>
          <div className="relative w-full h-full flex items-center justify-center p-0 md:p-4">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={cn(
                "bg-neutral-900 p-0 md:p-2 shadow-2xl transition-all duration-300 relative overflow-hidden",
                "fixed inset-0 md:relative",
                format === 'story'
                  ? "md:h-[673px] md:w-[320px] lg:w-[340px] lg:h-[715px] md:rounded-[40px]"
                  : "md:h-[400px] md:w-[400px] lg:w-[450px] lg:h-[450px] md:rounded-2xl"
              )}
            >
              <div
                ref={previewRef}
                className={cn(
                  "relative h-full w-full overflow-hidden bg-black",
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
                <div className="absolute inset-0 bg-black/50" />

                {(isGenerating && !content) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white/80">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-sm text-center">Génération...</p>
                  </div>
                )}

                {content && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-10 overflow-hidden">
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

      {/* 4. MOBILE FLOATING UI (Replaces multiple toolbars) */}
      <div className="md:hidden">
        {/* TOP TOOLS: Universal Search / Category */}
        <div className="absolute top-12 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <Button
              variant="ghost"
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="h-11 px-5 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] font-bold flex items-center gap-2 group shadow-xl"
              aria-label="Sélectionner la source"
            >
              <Sparkles className="w-4 h-4 text-[#FFFDD0] group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{category === 'recherche-ia' ? "Agent Hikma" : category}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsSidebarOpen(true)}
              className="h-11 px-5 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] font-bold flex items-center gap-2 group shadow-xl"
              aria-label="Paramètres"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Réglages</span>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="pointer-events-auto w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-yellow-400 shadow-xl" aria-label="Premium">
            <Crown className="w-5 h-5" />
          </Button>
        </div >

        {/* LEFT TOOLS: Design */}
        < div className="absolute left-6 bottom-32 z-40 flex flex-col gap-4" >
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all font-bold"
            aria-label="Galerie"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsToolsDrawerOpen(true)}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all font-bold"
            aria-label="Outils de design"
          >
            <Palette className="w-5 h-5" />
          </button>
          <button
            onClick={handleRandomBackground}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
            aria-label="Fond aléatoire"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div >

        {/* RIGHT TOOLS: Actions */}
        < div className="absolute right-6 bottom-32 z-40 flex flex-col gap-4" >
          <button
            onClick={handleFavorite}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
            aria-label="Favori"
          >
            <Heart className={cn("w-5 h-5 transition-colors", favorites.includes(content?.content || '') ? "fill-[#FFFDD0] text-[#FFFDD0]" : "")} />
          </button>
          <button
            onClick={handleShareImage}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
            aria-label="Partager"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-12 h-12 rounded-full bg-[#FFFDD0]/10 backdrop-blur-md border border-[#FFFDD0]/20 text-[#FFFDD0] shadow-2xl flex items-center justify-center active:scale-90 transition-all"
            aria-label="Télécharger"
          >
            <Download className="w-5 h-5" />
          </button>
        </div >

        {/* BOTTOM TOOLS: Main Action (Generate) */}
        < div className="absolute bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-4 px-4" >
          {/* Unified Search Input */}
          < div className="w-full max-w-sm" >
            <MobileTopicInput
              value={topic}
              onChange={setTopic}
              isVisible={true}
              placeholder={category === 'recherche-ia' ? "Rechercher avec l'Agent (ex: Parents)..." : "Sujet du rappel (patience, amour...)"}
              onEnter={handleGenerateAiContent}
              position={category === 'recherche-ia' ? 'top' : 'bottom'}
            />
          </div >

          {/* QUICK CATEGORY TILES (The requested 4 tiles) */}
          < div className="flex justify-center gap-3 w-full max-w-sm px-2" >
            {
              [
                { id: 'coran', icon: BookMarked, color: 'bg-[#FFFDD0]/10 text-[#FFFDD0] border-[#FFFDD0]/20', label: 'Coran' },
                { id: 'hadith', icon: BookOpen, color: 'bg-[#FFFDD0]/10 text-[#FFFDD0] border-[#FFFDD0]/20', label: 'Hadith' },
                { id: 'ramadan', icon: Moon, color: 'bg-[#FFFDD0]/10 text-[#FFFDD0] border-[#FFFDD0]/20', label: 'Mois' },
                { id: 'citadelle', icon: Sparkles, color: 'bg-[#FFFDD0]/10 text-[#FFFDD0] border-[#FFFDD0]/20', label: 'Douas' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as Category)}
                  className={cn(
                    "flex-1 py-2 rounded-2xl border flex flex-col items-center gap-1 transition-all active:scale-90",
                    category === cat.id
                      ? "bg-[#FFFDD0] text-purple-900 border-[#FFFDD0] ring-4 ring-[#FFFDD0]/20"
                      : cat.color
                  )}
                >
                  <cat.icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))
            }
          </div>

          <button
            onClick={handleGenerateAiContent}
            disabled={isGenerating}
            className={cn(
              "h-14 px-10 rounded-full bg-[#FFFDD0] text-purple-900 flex items-center gap-3 shadow-[0_10px_30px_rgba(255,253,208,0.3)] active:scale-95 transition-all w-full max-w-[280px] font-bold",
              isGenerating && "opacity-80"
            )}
            aria-label="Générer avec l'Agent Hikma"
          >
            {isGenerating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            <span className="font-bold tracking-tight">Générer avec l'Agent</span>
          </button>
        </div>
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
        onSelectCategory={setCategory}
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
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
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
            className="absolute right-2 top-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors z-50"
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
