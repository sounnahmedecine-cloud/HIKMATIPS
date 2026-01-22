'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Download,
  Loader2,
  HeartPulse,
  BookOpen,
  Bike,
  RectangleVertical,
  RectangleHorizontal,
  BookMarked,
  LogIn,
  LogOut,
  User,
  Share2,
  AtSign,
} from 'lucide-react';
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
import { generateHadith } from '@/ai/flows/generate-hadith';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';


type Content = {
  content: string;
  source: string;
};

type Category = 'hadith' | 'sante' | 'sport' | 'coran';
type Format = 'story' | 'square';

export default function Home() {
  const [content, setContent] = useState<Content | null>(null);
  const [category, setCategory] = useState<Category>('hadith');
  const [format, setFormat] = useState<Format>('story');
  const [background, setBackground] = useState<string>(
    PlaceHolderImages[0]?.imageUrl || 'https://picsum.photos/seed/1/1080/1920'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [creatorSignature, setCreatorSignature] = useState('');
  const [generationCount, setGenerationCount] = useState(0);
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
      setShowSignInPopup(false);
      setGenerationCount(0);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: "Une erreur s'est produite lors de la connexion.",
      });
      setShowSignInPopup(false);
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
      if (category === 'hadith' || category === 'coran') {
        return hint.includes('islamic') || hint.includes('nature') || hint.includes('serene') || hint.includes('abstract');
      }
      if (category === 'sante') {
        return hint.includes('health') || hint.includes('nature');
      }
      if (category === 'sport') {
        return hint.includes('fitness') || hint.includes('sport');
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
      link.download = `hikmatips_${category}_${Date.now()}.png`;
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
        text: `Découvrez cette sagesse sur HikmaTips : "${content.content}" - ${content.source}`,
        url: savedFile.uri,
        dialogTitle: 'Partager avec...',
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
          <h1 className="text-xl font-bold bg-gradient-to-r from-tiktok-pink to-tiktok-cyan bg-clip-text text-transparent italic">HikmaTips</h1>
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                    >
                      <BookMarked className="mb-3 h-6 w-6" />
                      Coran
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="hadith" id="hadith" className="peer sr-only" />
                    <Label
                      htmlFor="hadith"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                    >
                      <BookOpen className="mb-3 h-6 w-6" />
                      Hadiths
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="sante" id="sante" className="peer sr-only" />
                    <Label
                      htmlFor="sante"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                    >
                      <HeartPulse className="mb-3 h-6 w-6" />
                      Santé
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="sport" id="sport" className="peer sr-only" />
                    <Label
                      htmlFor="sport"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                    >
                      <Bike className="mb-3 h-6 w-6" />
                      Sport
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                    >
                      <RectangleVertical className="mb-3 h-6 w-6" />
                      Story (9:16)
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="square" id="square" className="peer sr-only" />
                    <Label
                      htmlFor="square"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
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
                  <AtSign className="text-primary" />
                  Signature du créateur
                </CardTitle>
                <CardDescription>
                  Ajoutez votre @pseudo ou nom sur l'image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: @votre_pseudo"
                    value={creatorSignature}
                    onChange={(e) => setCreatorSignature(e.target.value)}
                    className="flex-grow"
                  />
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
                    <div className="text-center text-white">
                      <p className="text-3xl sm:text-4xl font-bold leading-tight shadow-black [text-shadow:0_2px_8px_var(--tw-shadow-color)] drop-shadow-lg">
                        "{content.content}"
                      </p>
                      <p className="mt-6 text-xl sm:text-2xl font-semibold text-tiktok-cyan/90 italic shadow-black [text-shadow:0_1px_4px_var(--tw-shadow-color)]">
                        - {content.source}
                      </p>
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
                  className="w-full bg-gradient-to-r from-tiktok-pink to-tiktok-cyan hover:opacity-90"
                  size="lg"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager maintenant
                </Button>
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
            © {new Date().getFullYear()} HikmaTips · Créé par{' '}
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
    </div>
  );
}
