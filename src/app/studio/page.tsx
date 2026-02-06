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
  RectangleHorizontal,
  BookMarked,
  LogIn,
  LogOut,
  Share2,
  AtSign,
  Play,
  User,
  Palette,
  Type,
  Minus,
  Plus,
  Mail,
  Wand2,
  Menu,
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
import { GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


type Content = {
  content: string;
  source: string;
};

type Category = 'hadith' | 'ramadan' | 'recherche-ia' | 'coran';
type Format = 'story' | 'square';
type TextTheme = 'gradient' | 'white';
type FontFamily = 'roboto' | 'playfair' | 'amiri' | 'naskh';

const fontFamilies: Record<FontFamily, { name: string; style: string; label: string }> = {
  roboto: { name: 'Roboto', style: "'Roboto', sans-serif", label: 'Moderne' },
  playfair: { name: 'Playfair Display', style: "'Playfair Display', serif", label: 'Élégante' },
  amiri: { name: 'Amiri', style: "'Amiri', serif", label: 'Calligraphie' },
  naskh: { name: 'Noto Naskh Arabic', style: "'Noto Naskh Arabic', serif", label: 'Orientale' },
};

export default function StudioPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [category, setCategory] = useState<Category>('coran');
  const [format, setFormat] = useState<Format>('story');
  const [textTheme, setTextTheme] = useState<TextTheme>('white');
  const [fontSize, setFontSize] = useState(21);
  const [fontFamily, setFontFamily] = useState<FontFamily>('amiri');
  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [creatorSignature, setCreatorSignature] = useState('@Hikmaclips');
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [activeMobileTool, setActiveMobileTool] = useState<ToolType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');

  const handleSignIn = async () => {
    if (!auth || isConnecting) return;

    setIsConnecting(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
      setShowSignInPopup(false);
      setGenerationCount(0);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Authentification annulée ou fermée par l\'utilisateur');
        return;
      }

      console.error('Erreur de connexion:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: "Une erreur s'est produite lors de la connexion.",
      });
      setShowSignInPopup(false);
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
      console.error("Erreur lors de la génération de contenu par l'IA:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description:
          "Une erreur s'est produite lors de la communication avec l'IA. Veuillez réessayer.",
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

      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `hikmaclips_${category}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Image téléchargée !',
        description: 'Votre image a été enregistrée dans la galerie.',
      });
    } catch (error) {
      console.error('La génération de l\'image a échoué:', error);
      toast({
        variant: 'destructive',
        title: 'La génération de l\'image a échoué',
        description: 'Une erreur s\'est produite. Réessayez ou changez l\'arrière-plan.',
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
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
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                onShare={handleShareImage}
                isStudio={true}
                format={format}
                setFormat={setFormat}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
            </Sheet>
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 transition-transform">
              <Palette className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-hikma-gradient tracking-tight font-display">Studio</h1>
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
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/ressources'} className="text-primary flex">
              <BookOpen className="w-5 h-5 font-bold" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownloadImage} disabled={!content || isGenerating}>
              <Download className="w-5 h-5 font-bold" />
            </Button>
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
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onShare={handleShareImage}
            isStudio={true}
            format={format}
            setFormat={setFormat}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        </aside>

        {/* Main Preview Container */}
        <main className="flex-1 preview-container relative pb-32 overflow-hidden flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div
              className={cn(
                "bg-neutral-900 p-1 sm:p-2 shadow-2xl ring-4 ring-primary/5 transition-all duration-300 relative overflow-hidden",
                format === 'story'
                  ? "w-[240px] h-[500px] sm:w-[280px] sm:h-[590px] md:w-[320px] md:h-[673px] lg:w-[340px] lg:h-[715px] rounded-[30px] sm:rounded-[40px]"
                  : "w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] rounded-2xl"
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
                    <div className="text-center w-full max-w-4xl">
                      <div
                        className="font-extrabold leading-tight tracking-tight px-4"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamilies[fontFamily].style
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={animationKey + content.content}
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.08 } },
                            }}
                            className={cn(
                              textTheme === 'white' ? "text-white" : "text-hikma-gradient"
                            )}
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
                        className="mt-6 text-sm sm:text-lg font-bold text-white/90 italic tracking-widest uppercase opacity-70"
                      >
                        — {content.source} —
                      </motion.p>
                    </div>
                  </div>
                )}

                {creatorSignature && (
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-white/40 text-[9px] font-medium tracking-widest uppercase">
                      {creatorSignature}
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
          } else {
            setActiveMobileTool(tool);
          }
        }}
        activeTool={activeMobileTool}
      />

      <MobileDrawer
        isOpen={activeMobileTool !== null}
        onClose={() => setActiveMobileTool(null)}
        title={
          activeMobileTool === 'font' ? 'Typographie' :
            activeMobileTool === 'format' ? 'Format & Style' :
              activeMobileTool === 'theme' ? 'Couleur & Effet' :
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
        {activeMobileTool === 'theme' && (
          <ThemeSettings textTheme={textTheme} setTextTheme={setTextTheme} />
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
            <Button
              variant="outline"
              onClick={handleSignIn}
              disabled={isConnecting}
              className="w-full py-6 transition-smooth hover:bg-muted"
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continuer avec Google
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou avec votre email</span>
              </div>
            </div>

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
                className="w-full"
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
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
