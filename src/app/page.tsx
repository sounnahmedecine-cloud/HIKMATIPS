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
  Check,
  Palette,
  Type,
  Minus,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { generateHadith } from '@/ai/flows/generate-hadith';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';


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

export default function Home() {
  const [content, setContent] = useState<Content | null>(null);
  const [category, setCategory] = useState<Category>('hadith');
  const [format, setFormat] = useState<Format>('story');
  const [textTheme, setTextTheme] = useState<TextTheme>('white');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState<FontFamily>('roboto');
  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [creatorSignature, setCreatorSignature] = useState('@habibi_muslim');
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1500); // Petit délai pour laisser l'animation d'entrée se faire
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcomePopup(false);
  };

  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);

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
      // Ignorer l'erreur si l'utilisateur a juste fermé la popup ou s'il y a un doublon de requête
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
      // Fallback if not on mobile or plugin fails
      toast({
        title: 'Partage',
        description: 'Utilisez le bouton de téléchargement pour enregistrer et partager manuellement.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, toast]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <h1 className="text-xl font-bold text-hikma-gradient italic">HikmaClips</h1>
          <div className="flex items-center gap-4">
            {isUserLoading ? (
              <Loader2 className="animate-spin" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar'} />
                      <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* === CONTROLS COLUMN === */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Choisir une catégorie
                </CardTitle>
                <CardDescription>
                  Sélectionnez le type de contenu à générer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="hadith"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  onValueChange={(value: string) => setCategory(value as Category)}
                >
                  <div>
                    <RadioGroupItem value="coran" id="coran" className="peer sr-only" />
                    <Label
                      htmlFor="coran"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <BookMarked className="mb-3 h-6 w-6" />
                      Coran
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="hadith" id="hadith" className="peer sr-only" />
                    <Label
                      htmlFor="hadith"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <BookOpen className="mb-3 h-6 w-6" />
                      Hadiths
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="ramadan" id="ramadan" className="peer sr-only" />
                    <Label
                      htmlFor="ramadan"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      Ramadan
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="recherche-ia" id="recherche-ia" className="peer sr-only" />
                    <Label
                      htmlFor="recherche-ia"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <Search className="mb-3 h-6 w-6" />
                      Recherche IA
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RectangleHorizontal className="text-primary" />
                  Choisir un format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="story"
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value: string) => setFormat(value as Format)}
                >
                  <div>
                    <RadioGroupItem value="story" id="story" className="peer sr-only" />
                    <Label
                      htmlFor="story"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <RectangleVertical className="mb-3 h-6 w-6" />
                      Story (9:16)
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="square" id="square" className="peer sr-only" />
                    <Label
                      htmlFor="square"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <ImageIcon className="mb-3 h-6 w-6" />
                      Carré (1:1)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="text-primary" />
                  Couleur du texte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="white"
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value: string) => setTextTheme(value as TextTheme)}
                >
                  <div>
                    <RadioGroupItem value="gradient" id="theme-gradient" className="peer sr-only" />
                    <Label
                      htmlFor="theme-gradient"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <span className="mb-3 text-lg font-bold text-hikma-gradient">Aa</span>
                      TikTok
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="white" id="theme-white" className="peer sr-only" />
                    <Label
                      htmlFor="theme-white"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                    >
                      <span className="mb-3 text-lg font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Aa</span>
                      Blanc
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="text-primary" />
                  Typographie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  defaultValue="roboto"
                  className="grid grid-cols-2 gap-3"
                  onValueChange={(value: string) => setFontFamily(value as FontFamily)}
                >
                  {(Object.entries(fontFamilies) as [FontFamily, typeof fontFamilies[FontFamily]][]).map(([key, font]) => (
                    <div key={key}>
                      <RadioGroupItem value={key} id={`font-${key}`} className="peer sr-only" />
                      <Label
                        htmlFor={`font-${key}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-primary/10 hover:text-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-smooth"
                      >
                        <span className="mb-2 text-lg" style={{ fontFamily: font.style }}>Aa</span>
                        <span className="text-xs">{font.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taille du texte</span>
                    <span className="text-sm font-medium">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(s => Math.max(14, s - 2))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(v) => setFontSize(v[0])}
                      min={14}
                      max={48}
                      step={1}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(s => Math.min(48, s + 2))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="text-primary" />
                  Signature
                </CardTitle>
                <CardDescription>
                  Ajoutez votre @pseudo ou nom sur l'image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Ex: @votre_pseudo"
                    value={creatorSignature}
                    onChange={(e) => setCreatorSignature(e.target.value)}
                    disabled={!user}
                    className="flex-grow"
                  />
                  {!user && (
                    <p className="text-xs text-muted-foreground">
                      Connectez-vous pour personnaliser votre propre signature.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="text-primary" />
                  Choisir l'arrière-plan
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button onClick={handleRandomBackground} className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Aléatoire
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* === PREVIEW COLUMN === */}
          <div className="flex flex-col items-center justify-start gap-8">
            <div
              className={cn(
                'bg-neutral-900 p-2 sm:p-4 shadow-2xl ring-2 ring-primary/20 transition-all duration-300',
                {
                  'w-[340px] h-[715px] sm:w-[360px] sm:h-[755px] rounded-[40px]': format === 'story',
                  'w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-2xl': format === 'square',
                }
              )}
            >
              <div
                ref={previewRef}
                className={cn(
                  'relative h-full w-full overflow-hidden bg-black',
                  {
                    'rounded-[25px] sm:rounded-[32px]': format === 'story',
                    'rounded-xl': format === 'square',
                  }
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
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="text-lg text-center">Génération du contenu en cours...</p>
                  </div>
                )}

                {content && (
                  <div
                    className="absolute inset-0 flex items-center justify-center p-8"
                  >
                    <div className="text-center w-full max-w-4xl">
                      <div className="font-extrabold leading-tight tracking-tight px-4" style={{ fontSize: `${fontSize}px`, fontFamily: fontFamilies[fontFamily].style }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={animationKey + content.content}
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.08 } },
                            }}
                            className="text-white"
                          >
                            "
                            {content.content.split(' ').map((word, i) => (
                              <motion.span
                                key={i}
                                variants={{
                                  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
                                  visible: {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    transition: { type: 'spring', damping: 12, stiffness: 100 }
                                  },
                                }}
                                className={cn(
                                  "inline-block mr-2",
                                  textTheme === 'white' ? "text-white" : (user ? "text-hikma-gradient" : "text-white")
                                )}
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: content.content.split(' ').length * 0.08 + 0.5,
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        className="mt-6 text-lg sm:text-xl font-bold text-white/90 italic tracking-widest uppercase opacity-70"
                      >
                        — {content.source} —
                      </motion.p>
                    </div>
                  </div>
                )}

                {creatorSignature && (
                  <div className="absolute bottom-10 left-0 right-0 text-center">
                    <p className="text-white/60 text-sm font-medium tracking-widest uppercase">
                      {creatorSignature}
                    </p>
                  </div>
                )}

                {!content && !isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center text-white/50">
                      <p className="text-lg">Votre contenu généré apparaîtra ici.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardDescription>
                  Décrivez un thème (ex. "patience", "nutrition"). Laissez vide pour un thème aléatoire.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: La patience dans l'épreuve"
                />
                <Button onClick={handleGenerateAiContent} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? 'Génération...' : "Générer le contenu"}
                </Button>
              </CardContent>
            </Card>

            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="text-primary" />
                  Exporter & Partager
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button
                  onClick={handleDownloadImage}
                  disabled={!content || isGenerating}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Enregistrer l'image
                </Button>
                <Button
                  onClick={handleShareImage}
                  disabled={!content || isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager maintenant
                </Button>
                <Button
                  onClick={() => setAnimationKey(prev => prev + 1)}
                  disabled={!content || isGenerating}
                  variant="ghost"
                  className="w-full h-8 text-xs text-muted-foreground"
                >
                  <Play className="mr-1 h-3 w-3" />
                  Revoir l'animation
                </Button>

                <div className="pt-4 border-t mt-2">
                  <a
                    href="https://drive.google.com/file/d/1yRERvrTGsIJJXCL7q31vI8G4VW-lgkfu/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button variant="secondary" className="w-full gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android" className="w-4 h-4" />
                      Télécharger l'application Android
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4">
            <a href="/privacy-policy" className="hover:text-primary transition-colors">Politique de Confidentialité</a>
            <span className="hidden sm:inline">·</span>
            <a href="/terms-of-service" className="hover:text-primary transition-colors">Conditions d'Utilisation</a>
          </div>
          <p className="mb-2">
            © {new Date().getFullYear()} HikmaClips · Créé par{' '}
            <a
              href="http://web-linecreator.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              web-linecreator.fr
            </a>
          </p>
          <p>
            Meknès, Maroc
          </p>
        </div>
      </footer>

      <AlertDialog open={showSignInPopup} onOpenChange={setShowSignInPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inscrivez-vous pour continuer</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez atteint la limite de 5 générations en tant qu'invité. Créez un compte gratuit pour profiter de la génération illimitée et gratuite, et bientôt, pour sauvegarder vos créations !
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Plus tard</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter avec Google
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
        <AlertDialogContent className="max-w-md border-none bg-gradient-to-b from-card to-background shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-primary/20 p-3 rounded-full mb-2 w-fit">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <AlertDialogTitle className="text-2xl text-center font-bold">
              Bienvenue sur <span className="text-hikma-gradient italic">HikmaClips</span> ! 🎨
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2">
              Prêt à créer des images inspirantes pour vos réseaux sociaux ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-6 space-y-4">
            <p className="font-semibold text-foreground text-center mb-4">
              🎁 Pourquoi créer un compte (Gratuit) ?
            </p>
            <div className="grid gap-3">
              {[
                { title: "Générations Illimitées", desc: "Plus aucune limite quotidienne !" },
                { title: "Styles Premium", desc: "Accès aux styles premium exclusifs" },
                { title: "Signature Perso", desc: "Votre propre @pseudo sur l'image" },
                { title: "C'est 100% Gratuit", desc: "Et ça le restera toujours InshaAllah" },
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-border/50">
                  <div className="mt-1 bg-primary/20 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleCloseWelcome}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold py-6 text-lg"
            >
              C'est parti ! 🚀
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
