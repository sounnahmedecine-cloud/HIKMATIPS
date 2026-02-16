"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Image as ImageIcon, Type, Palette, Share2, Download, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import { generateHadith } from "@/ai/flows/generate-hadith"
import { getFavorites, toggleFavorite, Hikma } from "@/lib/utils"
import { HikmaCard } from "@/components/HikmaCard"

export default function StudioPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<Hikma>({
    arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    fr: "À côté de la difficulté est, certes, une facilité.",
    source: "Sourate Ash-Sharh 94:6"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const favorites = getFavorites();
    const saved = localStorage.getItem('lastGeneratedHikma');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hikma = {
          arabe: parsed.arabe || "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
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
        arabe: result.arabe || "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
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
      <div className="w-full max-w-lg mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Retour
        </Button>
        <h1 className="text-xl font-bold dark:text-emerald-50">Studio Créatif</h1>
        <div className="w-10" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center">
        <div
          ref={cardRef}
          className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-100 dark:from-slate-800 dark:to-emerald-950 shadow-2xl flex flex-col items-center justify-center p-8 text-center"
        >
          <HikmaCard
            hikma={content}
            isLiked={isLiked}
            onFavorite={handleFavorite}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        </div>

        {/* Floating Tools */}
        <div className="mt-8 flex gap-3 p-2 bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
            <Type className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20">
            <Palette className="w-5 h-5" />
          </Button>
          <div className="w-px h-8 bg-white/10 my-auto mx-1" />
          <Button size="icon" className="rounded-full w-12 h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <Button
          className="mt-12 w-full max-w-xs h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-xl font-bold shadow-xl group"
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
