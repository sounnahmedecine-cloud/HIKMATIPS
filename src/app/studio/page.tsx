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
  RectangleVertical,
  BookMarked,
  LogIn,
  LogOut,
  Share2,
  AtSign,
  User,
  Palette,
  Type,
  Minus,
  Plus,
  Mail,
  Wand2,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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
import { SidebarContent, FormatSettings, FontSettings } from '@/components/SidebarContent';
import { Sidebar } from '@/components/Sidebar';
import { BottomControls } from '@/components/BottomControls';
import { MobileStudioToolbar, ToolType } from '@/components/studio/MobileStudioToolbar';
import { MobileDrawer } from '@/components/studio/MobileDrawer';
import { MobileTopicInput } from '@/components/studio/MobileTopicInput';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MobileLeftToolbar } from '@/components/studio/MobileLeftToolbar';


type Content = {
  content: string;
  source: string;
  surah?: number;
  ayah?: number;
};


const category: Category[] = ['hadith', 'ramadan', 'recherche-ia', 'coran'];

type Category = 'hadith' | 'ramadan' | 'recherche-ia' | 'coran';
type Format = 'story' | 'square';

type FontFamily = 'roboto' | 'playfair' | 'amiri' | 'naskh';

const fontFamilies: Record<FontFamily, { name: string; style: string; label: string }> = {
  roboto: { name: 'Roboto', style: "'Roboto', sans-serif", label: 'Moderne' },
  playfair: { name: 'Playfair Display', style: "'Playfair Display', serif", label: 'Élégante' },
  amiri: { name: 'Amiri', style: "'Amiri', serif", label: 'Calligraphie' },
  naskh: { name: 'Noto Naskh Arabic', style: "'Noto Naskh Arabic', serif", label: 'Orientale' },
};

export default function StudioPage() {
  const [content, setContent] = useState<Content | null>({
    content: "Et rappelle, car le rappel profite aux croyants",
    source: "Sourate Adh-Dhâriyât, v. 55",
    surah: 51,
    ayah: 55
  });
  const [category, setCategory] = useState<Category>('coran');
  const [format, setFormat] = useState<Format>('story');

  const [fontSize, setFontSize] = useState(21);
  const [fontFamily, setFontFamily] = useState<FontFamily>('amiri');

  const [signature, setSignature] = useState('hikmaclips.woosenteur.fr');
  const [showAnimations, setShowAnimations] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('showAnimations');
    if (saved !== null) setShowAnimations(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('showAnimations', showAnimations.toString());
  }, [showAnimations]);

  const router = useRouter();

  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMobileTool, setActiveMobileTool] = useState<ToolType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  // Image Filter States
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);



  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
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

  // handleSignIn removed

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
        setAnimationKey(prev => prev + 1);
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
      if (category === 'hadith' || category === 'coran' || category === 'recherche-ia') {
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

    // Pre-process image to avoid CORS issues with html2canvas
    let base64Image = '';
    if (background.startsWith('http')) {
      try {
        const response = await fetch(background, { mode: 'cors', credentials: 'omit' });
        const blob = await response.blob();
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Mise en cache de l'image échouée, tentative standard:", e);
      }
    }

    try {
      const canvas = await html2canvas(previewEl, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null, // Transparent background if needed
        onclone: (clonedDoc) => {
          if (base64Image) {
            const img = clonedDoc.querySelector('img[alt="Arrière-plan"]') as HTMLImageElement;
            if (img) {
              img.src = base64Image;
              img.srcset = ''; // Clear srcset to force src usage
            }
          }
        }
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
      title: 'Sauvegarde de l\'image...',
      description: 'Veuillez patienter...',
    });

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error('Canvas null');

      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `hikmaclips_${category}_${Date.now()}.png`;

      try {
        // Save to Documents directory (Native)
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        toast({
          title: 'Image sauvegardée !',
          description: `Enregistrée dans Documents/${fileName}`,
        });
      } catch (nativeError) {
        // Web Fallback
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({
          title: 'Image téléchargée !',
          description: 'Enregistrement réussi via le navigateur.',
        });
      }
    } catch (error) {
      console.error('La sauvegarde de l\'image a échoué:', error);
      toast({
        variant: 'destructive',
        title: 'Échec de la sauvegarde',
        description: 'Une erreur s\'est produite lors de l\'enregistrement.',
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

      // Check if sharing is actually supported
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
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="layout-immersive overflow-hidden bg-background">
      {/* Hidden file input for background upload */}
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        title="Télécharger un arrière-plan"
      />

      {/* Header with Sidebar Trigger (Mobile only for sidebar button) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 relative">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              {/* Le bouton menu est maintenant masqué sur mobile au profit de la toolbar flottante */}
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
                onSignIn={() => setShowSignInPopup(true)}
                onSignOut={handleSignOut}
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
              />
            </Sheet>
          </div>

          {/* Center Logo/Title on Mobile */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:ml-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 transition-transform">
              <Image
                src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
                alt="HikmaClips"
                width={32}
                height={32}
                className="rounded-lg shadow-sm"
              />
              <span className="text-lg font-bold text-primary tracking-tight font-display md:hidden">Studio</span>
            </a>
          </div>

          {/* Right: Actions & Avatar */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {!isUserLoading && user && (
              <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="text-[10px]">{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
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
            isStudio={true}
            format={format}
            setFormat={setFormat}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            signature={signature}
            setSignature={setSignature}
            showAnimations={showAnimations}
            setShowAnimations={setShowAnimations}
          />
        </aside>

        {/* Main Preview Container */}
        <main className={cn(
          "flex-1 preview-container relative overflow-hidden flex flex-col items-center justify-center gap-6 pt-4",
          "md:pb-12"
        )}>


          <div className="relative w-full flex items-center justify-center px-4">
            <div
              className={cn(
                "bg-neutral-900 shadow-hikma-lg ring-1 ring-primary/5 transition-all duration-300 relative overflow-hidden",
                format === 'story'
                  ? "h-[calc(100vh-280px)] w-auto aspect-[9/16] sm:w-[280px] sm:h-[590px] md:w-[320px] md:h-[673px] lg:w-[340px] lg:h-[715px] rounded-[30px] sm:rounded-[40px]"
                  : "h-[calc(100vh-280px)] w-auto aspect-square sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] rounded-2xl"
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
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                  }}
                  data-ai-hint="abstract serene"
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
                  <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                    <div className="text-center w-full max-w-4xl flex flex-col items-center justify-center min-h-full">
                      <div
                        className="font-extrabold leading-tight tracking-tight px-4 w-full flex flex-col items-center justify-center"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamilies[fontFamily].style
                        }}
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
                              className="text-white drop-shadow-md text-center"
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
                            <div className="text-white drop-shadow-md">"{content?.content}"</div>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
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
                            className="mt-6 text-sm sm:text-lg font-bold italic tracking-widest uppercase opacity-70 text-white/90 text-center w-full"
                          >
                            — {content?.source} —
                          </motion.p>
                        ) : (
                          <p className="mt-6 text-sm sm:text-lg font-bold italic tracking-widest uppercase opacity-70 text-white/90 text-center w-full">
                            — {content?.source} —
                          </p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {signature && (
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-white/40 text-[9px] font-medium tracking-widest uppercase">
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

      {/* Bottom Controls Bar */}
      <MobileTopicInput
        value={topic}
        onChange={setTopic}
        isVisible={category === 'recherche-ia'}
        placeholder="Quel thème pour votre Hikma ?"
        onEnter={handleGenerateAiContent}
      />

      <BottomControls
        category={category}
        setCategory={setCategory}
        onGenerate={handleGenerateAiContent}
        isGenerating={isGenerating}
        onRandom={handleRandomBackground}
        onUpload={() => document.getElementById('file-upload')?.click()}
      />

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
        onShare={handleShareImage}
        onDownload={handleDownloadImage}
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
          />
        )}
        {activeMobileTool === 'format' && (
          <FormatSettings format={format} setFormat={setFormat} />
        )}
        {activeMobileTool === 'background' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-2 border-dashed" onClick={handleRandomBackground}>
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold">Aléatoire</span>
              </Button>
              <Button variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-2 border-dashed" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold">Importer</span>
              </Button>
            </div>
          </div>
        )}
      </MobileDrawer>

      {/* Auth Popups */}
      <AlertDialog open={showSignInPopup} onOpenChange={setShowSignInPopup}>
        <AlertDialogContent className="sm:max-w-[400px]">
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
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              {authMode === 'login' ? 'Connexion' : 'Inscription'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Connectez-vous pour sauvegarder vos Hikmas et personnaliser votre signature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {/* Authentification par Email uniquement */}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email-auth">Email</Label>
                <Input
                  id="email-auth"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="transition-smooth"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-auth">Mot de passe</Label>
                <Input
                  id="password-auth"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="transition-smooth"
                />
              </div>

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
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className="text-primary hover:underline"
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  Pas de compte ?{' '}
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className="text-primary hover:underline"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Plus tard</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent >
      </AlertDialog>
    </div>
  );
}
