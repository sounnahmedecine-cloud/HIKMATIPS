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
  User,
  Mail,
  Menu,
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
import { BottomControls } from '@/components/BottomControls';
import { MobileStudioToolbar, ToolType } from '@/components/studio/MobileStudioToolbar';
import { MobileDrawer } from '@/components/studio/MobileDrawer';
import { MobileTopicInput } from '@/components/studio/MobileTopicInput';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { TooltipGuide } from '@/components/TooltipGuide';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { MobileLeftToolbar } from '@/components/studio/MobileLeftToolbar';


import { cn } from '@/lib/utils';


type Content = {
  content: string;
  source: string;
};

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia';

export default function GeneratorPage() {
  const [content, setContent] = useState<Content | null>({
    content: "Et rappelle, car le rappel profite aux croyants",
    source: "Sourate Adh-Dhâriyât, v. 55"
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
  const [activeMobileTool, setActiveMobileTool] = useState<ToolType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // First-time user guidance
  const { isFirstTime, markAsGenerated } = useFirstTimeUser();
  const [showTooltipGuide, setShowTooltipGuide] = useState(false);

  // Studio Settings States
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("'Amiri', serif");
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [signature, setSignature] = useState('hikmaclips.woosenteur.fr');
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
          title: 'Compte créé !',
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
    if (!user && generationCount >= 5) {
      setShowSignInPopup(true);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateHadith({ category, topic });
      if (result && result.content) {
        setContent(result);
        toast({
          title: 'Contenu généré !',
          description: 'Votre nouveau contenu est prêt.',
        });
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
        title: 'Impossible de générer l\'image',
        description: 'Veuillez d\'abord générer un contenu.',
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

      // Check if sharing is actually supported (especially for files)
      const canShareResult = await Share.canShare();

      if (canShareResult.value) {
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
      } else {
        throw new Error('Share API not available');
      }

    } catch (error) {
      console.error('Le partage a échoué:', error);
      // Fallback: Download the image if sharing is not available
      handleDownloadImage();
      toast({
        title: 'Note',
        description: 'Le partage direct n\'est pas disponible sur ce navigateur. L\'image a été téléchargée.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, toast, handleDownloadImage]);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-50/90 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
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
                <Image src="https://res.cloudinary.com/dhjwimevi/image/upload/v1770072891/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_edeg9a.png" alt="HikmaClips" width={32} height={32} className="rounded-lg shadow-sm" />
                <span className="text-lg font-bold text-emerald-800 tracking-tight font-display md:hidden">HikmaClips</span>
              </a>
            </div>

            <div className="w-10 h-10 md:hidden" />
          </div>
        </div>
      </header>
      <div className="flex-1 flex pt-14 overflow-hidden">
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
                          <motion.div
                            key={animationKey + content.content}
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.08 } },
                            }}
                          >
                            "
                            {content.content.split(' ').map((word, i) => (
                              <motion.span
                                key={i}
                                variants={{
                                  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
                                  visible: {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    transition: { type: 'spring', damping: 15, stiffness: 120 }
                                  },
                                }}
                                className="inline-block mr-2"
                              >
                                {word}
                              </motion.span>
                            ))}
                            "
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <motion.p
                        key={animationKey + content.source}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: content.content.split(' ').length * 0.08 + 0.4,
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className="mt-6 text-sm sm:text-lg font-bold italic tracking-widest uppercase opacity-70 text-white/90"
                      >
                        — {content.source} —
                      </motion.p>
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
        </main>
      </div>

      {/* Mobile Studio Toolset 2.0 */}
      <MobileStudioToolbar
        onToolSelect={(tool) => {
          if (tool === 'settings') {
            setIsSidebarOpen(true);
          } else if (tool === 'share') {
            handleShareImage();
          } else if (tool === 'download') {
            handleDownloadImage();
          } else if (tool === 'resources') {
            router.push('/ressources');
          } else {
            setActiveMobileTool(tool);
          }
        }}
        activeTool={activeMobileTool}
      />
      <MobileLeftToolbar
        onRandom={handleRandomBackground}
        onUpload={() => document.getElementById('file-upload')?.click()}
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{authMode === 'signup' ? 'Créer un compte' : 'Se connecter'}</AlertDialogTitle>
            <AlertDialogDescription>
              {authMode === 'signup'
                ? 'Créez un compte gratuit pour des générations illimitées !'
                : 'Connectez-vous pour profiter de générations illimitées.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Authentification par Email uniquement */}

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                disabled={isConnecting}
                className="bg-emerald-50/50 border-emerald-100"
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={isConnecting}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                className="bg-emerald-50/50 border-emerald-100"
              />
              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}
              <Button
                onClick={handleEmailAuth}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {authMode === 'signup' ? "S'inscrire" : 'Se connecter'}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {authMode === 'signup' ? (
                <>
                  Déjà un compte ?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-emerald-700 font-bold hover:underline">Se connecter</button>
                </>
              ) : (
                <>
                  Pas de compte ?{' '}
                  <button onClick={() => setAuthMode('signup')} className="text-emerald-700 font-bold hover:underline">S'inscrire</button>
                </>
              )}
            </p>
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
