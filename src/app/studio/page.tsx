"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Image as ImageIcon, Type, Palette, Share2, Download, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import { generateHadith } from "@/ai/flows/generate-hadith"
import { getFavorites, toggleFavorite, Hikma } from "@/lib/utils"
import { HikmaCard } from "@/components/HikmaCard"

interface CardStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  background: string;
  brightness: number;
}

const FONT_FAMILIES = [
  { name: "Inter", value: "font-sans" },
  { name: "Playfair", value: "font-serif" },
  { name: "Amiri (Arabic)", value: "font-arabic" },
];

const BACKGROUNDS = [
  { name: "Pastel Gradient", value: "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100" },
  { name: "Sunset", value: "bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200" },
  { name: "Ocean", value: "bg-gradient-to-br from-blue-200 via-cyan-100 to-teal-100" },
  { name: "Forest", value: "bg-gradient-to-br from-green-200 via-purple-100 to-teal-100" },
];

export default function StudioPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<Hikma>({
    arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    fr: "À côté de la difficulté est, certes, une facilité.",
    source: "Sourate Ash-Sharh 94:6"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [cardStyle, setCardStyle] = useState<CardStyle>({
    fontSize: 100,
    fontFamily: "font-sans",
    textColor: "text-slate-800",
    background: "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100",
    brightness: 100,
  });

  useEffect(() => {
    const favorites = getFavorites();
    const saved = localStorage.getItem('lastGeneratedHikma');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hikma = {
          arabe: parsed.arabe || "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
          fr: parsed.content || parsed.fr,
          source: parsed.source
        };
        setContent(hikma);
        setIsLiked(favorites.some(f => f.fr === hikma.fr));
      } catch (e) {
        console.error("Failed to parse saved hikma", e);
      }
    }
  }, []);

  const handleFavorite = () => {
    const liked = toggleFavorite(content);
    setIsLiked(liked);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateHadith({ category: 'coran' });
      const newHikma = {
        arabe: result.arabe || "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        fr: result.content,
        source: result.source
      };
      setContent(newHikma);
      setIsLiked(getFavorites().some(f => f.fr === newHikma.fr));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.download = 'hikma.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
      });
      const image = canvas.toDataURL("image/png");
      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "hikma.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "Hikma",
          text: "Découvrez cette Hikma sur HikmaClips",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-full pb-32 flex flex-col items-center">
      <div className="w-full max-w-lg mb-8 flex items-center justify-between px-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Retour
        </Button>
        <h1 className="text-xl font-bold">Studio Créatif</h1>
        <div className="w-10" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center px-4">
        <div
          ref={cardRef}
          className={`w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center ${cardStyle.background}`}
          style={{ filter: `brightness(${cardStyle.brightness}%)` }}
        >
          <div className={`${cardStyle.fontFamily} ${cardStyle.textColor}`} style={{ fontSize: `${cardStyle.fontSize}%` }}>
            <HikmaCard
              hikma={content}
              isLiked={isLiked}
              onFavorite={handleFavorite}
              onShare={handleShare}
              onDownload={handleDownload}
            />
          </div>
        </div>

        {/* Floating Tools */}
        <div className="mt-8 flex gap-3 p-2 bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
                <Type className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Typographie</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <Label>Taille du texte</Label>
                  <Slider
                    value={[cardStyle.fontSize]}
                    onValueChange={(v) => setCardStyle({ ...cardStyle, fontSize: v[0] })}
                    min={60}
                    max={140}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">{cardStyle.fontSize}%</p>
                </div>
                <div>
                  <Label>Police de caractères</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {FONT_FAMILIES.map((font) => (
                      <Button
                        key={font.value}
                        variant={cardStyle.fontFamily === font.value ? "default" : "outline"}
                        onClick={() => setCardStyle({ ...cardStyle, fontFamily: font.value })}
                        className="h-12"
                      >
                        {font.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
                <ImageIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Arrière-plan</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setCardStyle({ ...cardStyle, background: bg.value })}
                      className={`h-24 rounded-2xl ${bg.value} border-2 ${cardStyle.background === bg.value ? "border-purple-500 ring-2 ring-purple-300" : "border-transparent"
                        }`}
                    >
                      <span className="sr-only">{bg.name}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <Label>Luminosité</Label>
                  <Slider
                    value={[cardStyle.brightness]}
                    onValueChange={(v) => setCardStyle({ ...cardStyle, brightness: v[0] })}
                    min={50}
                    max={150}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">{cardStyle.brightness}%</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
                <Palette className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Couleurs</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Label>Couleur du texte</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["text-slate-800", "text-purple-800", "text-pink-800", "text-blue-800"].map((color) => (
                    <Button
                      key={color}
                      variant={cardStyle.textColor === color ? "default" : "outline"}
                      onClick={() => setCardStyle({ ...cardStyle, textColor: color })}
                      className="h-12"
                    >
                      <div className={`w-6 h-6 rounded-full ${color.replace("text-", "bg-")}`} />
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-px h-8 bg-white/10 my-auto mx-1" />
          <Button size="icon" className="rounded-full w-12 h-12 bg-purple-400 hover:bg-purple-500 shadow-lg" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <Button
          className="mt-12 w-full max-w-xs h-16 rounded-2xl bg-purple-400 hover:bg-purple-500 text-xl font-bold shadow-xl group text-white"
          onClick={handleRegenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
          )}
          Générer Nouveau
        </Button>
      </div>
    </div>
  );
}
