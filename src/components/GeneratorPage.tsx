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
  Share2,
  Play,
  Pause,
  Volume2,
  User,
  Mail,
  Menu,
  Music,
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
import { generateHadith } from '@/ai/flows/generate-hadith';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import OnboardingScreen from '@/components/OnboardingScreen';
import { SidebarContent, FormatSettings, FontSettings } from './SidebarContent';
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


import { cn } from '@/lib/utils';


type Content = {
  content: string;
  source: string;
  surah?: number;
  ayah?: number;
};

type Reciter = {
  id: string;
  name: string;
  url: string;
};

const RECITERS: Reciter[] = [
  { id: 'alafasy', name: 'Al-Afasy', url: 'https://everyayah.com/data/Alafasy_128kbps/' },
  { id: 'almuaiqly', name: 'Al-Muaiqly', url: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps/' },
  { id: 'alijaber', name: 'Ali Jaber', url: 'https://everyayah.com/data/Ali_Jaber_64kbps/' },
];

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia';

export default function GeneratorPage() {
  const [content, setContent] = useState<Content | null>({
    content: "Et rappelle, car le rappel profite aux croyants",
    source: "Sourate Adh-Dhâriyât, v. 55",
    surah: 51,
    ayah: 55
  });

  const [category, setCategory] = useState<Category>('coran');
  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMobileTool, setActiveMobileTool] = useState<'font' | 'format' | 'background' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  // First-time user guidance
  const { isFirstTime, markAsGenerated } = useFirstTimeUser();
  const [showTooltipGuide, setShowTooltipGuide] = useState(false);

  // Studio Settings States
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("'Amiri', serif");
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [signature, setSignature] = useState('hikmaclips.woosenteur.fr');
  const [showAnimations, setShowAnimations] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('showAnimations');
    if (saved !== null) setShowAnimations(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('showAnimations', showAnimations.toString());
  }, [showAnimations]);

  // Audio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    // if (!hasSeenOnboarding) {
    //   setShowOnboarding(true);
    // }

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
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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

  const formatAudioId = (num: number) => num.toString().padStart(3, '0');

  const togglePlayAudio = () => {
    if (!content?.surah || !content?.ayah) return;

    if (!audioRef.current) {
      const fileName = `${formatAudioId(content.surah)}${formatAudioId(content.ayah)}.mp3`;
      const url = `${selectedReciter.url}${fileName}`;
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Reset audio when content or reciter changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [content?.surah, content?.ayah, selectedReciter]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);


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
    const relevantImages = PlaceHolderImages.filter(img => {
      const hint = img.imageHint.toLowerCase();
      if (category === 'hadith' || category === 'coran' || category === 'thematique') {
        return hint.includes('islamic') || hint.includes('nature') || hint.includes('serene') || hint.includes('abstract');
      }
      if (category === 'ramadan') {
        return hint.includes('ramadan') || hint.includes('islamic') || hint.includes('mosque') || hint.includes('lantern');
      }
      return true;
    });

    const pool = relevantImages.length > 0 ? relevantImages : PlaceHolderImages;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setBackground(pool[randomIndex].imageUrl);
  };

  const generateCanvas = async () => {
    const previewEl = previewRef.current;
    if (!previewEl || !content) return null;

    try {
      const canvas = await html2canvas(previewEl, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
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
    <div className="layout-immersive bg-background overflow-hidden flex flex-col">
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
            signature={signature}
            setSignature={setSignature}
            showAnimations={showAnimations}
            setShowAnimations={setShowAnimations}
          />
        </aside>

        {/* Main Preview Container */}
        <main className={cn(
          "flex-1 preview-container relative overflow-hidden flex justify-center",
          "items-center pb-24 sm:pb-32" // Adjusted padding for better vertical centering
        )}>
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
            <div
              className={cn(
                "bg-neutral-900 p-1 sm:p-2 shadow-2xl ring-4 ring-primary/5 transition-all duration-300 relative overflow-hidden",
                format === 'story'
                  ? "h-[calc(100vh-180px)] w-auto aspect-[9/16] sm:w-[280px] sm:h-[590px] md:w-[320px] md:h-[673px] lg:w-[340px] lg:h-[715px] rounded-[30px] sm:rounded-[40px]"
                  : "h-[calc(100vh-180px)] w-auto aspect-square sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] rounded-2xl"
              )}
            >
              <div
                ref={previewRef}
                className={cn(
                  "relative h-full w-full overflow-hidden bg-black",
                  format === 'story' ? "rounded-[22px] sm:rounded-[32px]" : "rounded-xl"
                )}
              >
                <Image
                  src={background}
                  alt="Arrière-plan"
                  fill
                  className="object-cover"
                  data-ai-hint="abstract serene"
                  priority
                  unoptimized
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
                  <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                    <div className="text-center w-full max-w-4xl">
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

          {/* Audio Controls Overlay */}
          {content?.surah && content?.ayah && (
            <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-xl border border-primary/20 p-3 rounded-2xl shadow-xl z-30">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayAudio}
                className="w-12 h-12 rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </Button>

              <div className="flex flex-col gap-1 min-w-[120px]">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Récitateur</span>
                </div>
                <select
                  value={selectedReciter.id}
                  onChange={(e) => {
                    const r = RECITERS.find(rec => rec.id === e.target.value);
                    if (r) setSelectedReciter(r);
                  }}
                  className="bg-transparent text-sm font-bold border-none focus:ring-0 p-0"
                  aria-label="Sélectionner un récitateur"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 border-l border-primary/10 pl-4">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-primary"
                  aria-label="Ajuster le volume"
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Left Toolbar */}
      <MobileLeftToolbar
        onRandom={handleRandomBackground}
        onUpload={() => document.getElementById('file-upload')?.click()}
        onShare={handleShareImage}
        onDownload={handleDownloadImage}
      />
      <MobileTopicInput
        value={topic}
        onChange={setTopic}
        isVisible={category === 'recherche-ia'}
        placeholder="Un thème précis pour votre Agent ?"
        onEnter={handleGenerateAiContent}
      />

      <MobileDrawer
        isOpen={activeMobileTool !== null}
        onClose={() => setActiveMobileTool(null)}
        title={
          activeMobileTool === 'font' ? 'Typographie' :
            activeMobileTool === 'format' ? 'Format & Style' :
              activeMobileTool === 'background' ? 'Arrière-plan' : ''
        }
      >
        {activeMobileTool === 'font' && (
          <FontSettings
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isMobile={true}
          />
        )}
        {activeMobileTool === 'format' && (
          <FormatSettings format={format} setFormat={setFormat} isMobile={true} />
        )}

        {activeMobileTool === 'background' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-2 border-dashed border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900" onClick={handleRandomBackground}>
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">Aléatoire</span>
              </Button>
              <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-2 border-dashed border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">Importer</span>
              </Button>
            </div>
          </div>
        )}
      </MobileDrawer>

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

      {/* Category Drawer */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
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
          } else if (tool === 'resources') {
            router.push('/ressources');
          } else if (tool === 'settings') {
            setIsSidebarOpen(true);
          }
        }}
      />

      {/* Auth Popups & Overlays */}
      <AlertDialog open={showSignInPopup} onOpenChange={(open) => {
        setShowSignInPopup(open);
        if (!open) {
          setAuthError('');
          setAuthEmail('');
          setAuthPassword('');
        }
      }}>
        <AlertDialogContent className="max-w-md overflow-hidden bg-background/95 backdrop-blur-xl border-emerald-500/20">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setShowSignInPopup(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-emerald-500 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-2xl font-display text-center text-emerald-900 dark:text-emerald-100">
              Débloquez l'expérience complète
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground pt-2">
              Salam Aleykoum ! Vous avez atteint la limite de 10 générations gratuites.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Avantages */}
            <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <span className="bg-emerald-200 dark:bg-emerald-800 p-1 rounded-full text-[10px]">VIP</span>
                Pourquoi s'inscrire ?
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Générations illimitées avec l'IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Accès aux thèmes exclusifs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Sauvegarde de vos créations (Bientôt)
                </li>
              </ul>
            </div>

            {/* Message d'invitation */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20"
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
                  <>Déjà inscrit ? <button onClick={() => setAuthMode('login')} className="text-emerald-600 font-bold hover:underline">Connexion</button></>
                ) : (
                  <>Pas de compte ? <button onClick={() => setAuthMode('signup')} className="text-emerald-600 font-bold hover:underline">S'inscrire gratuitement</button></>
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
