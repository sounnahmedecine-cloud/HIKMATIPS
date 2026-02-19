'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Bell, Sparkles, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingScreenProps {
  onComplete: () => void;
}

// ... (Illustrations kept as is, but adding new ones if needed or using Lucide icons for simplicity in new slides)

const slides = [
  {
    id: 1,
    title: "Bienvenue sur HikmaClips",
    subtitle: "Diffusez la sagesse de l'Islam avec une touche moderne et percutante.",
    Illustration: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse-soft" />
        <img
          src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
          alt="HikmaClips Logo"
          className="w-48 h-48 rounded-[40px] shadow-2xl relative z-10"
        />
      </div>
    ),
  },
  {
    id: 2,
    title: "Contenu Infini",
    subtitle: "Swipez vers le HAUT sur l'écran principal pour générer de nouveaux rappels et images à l'infini.",
    Illustration: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl"
          >
            <Sparkles className="w-16 h-16 text-orange-500" />
          </motion.div>
          <motion.div
            animate={{ y: [20, 0, 20], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-4"
          >
            <ChevronRight className="w-8 h-8 text-emerald-500 rotate-[-90deg]" />
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Sauvegardez vos Favoris",
    subtitle: "Un rappel vous touche ? Cliquez sur le cœur pour l'ajouter à vos favoris et le retrouver à tout moment.",
    Illustration: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-full border border-white/20 shadow-2xl relative z-10"
        >
          <Heart className="w-20 h-20 text-red-500 fill-red-500" />
        </motion.div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Routine Spirituelle",
    subtitle: "Recevez une dose de sagesse chaque matin à 9h. Activez les notifications dans les réglages.",
    Illustration: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full" />
        <motion.div
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10"
        >
          <Bell className="w-20 h-20 text-yellow-500 fill-yellow-500/20" />
        </motion.div>
      </div>
    ),
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true
  });

  const isLastSlide = currentSlide === slides.length - 1;
  const CurrentIllustration = slides[currentSlide].Illustration;

  return (
    <div
      {...handlers}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-between overflow-hidden safe-area"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(100px, env(safe-area-inset-bottom))' // Increased padding for bottom nav/bars
      }}
    >
      {/* Skip button */}
      <div className="w-full flex justify-end px-6 pt-4">
        {!isLastSlide && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Passer
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Illustration */}
            <div className="mb-10">
              <CurrentIllustration />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-hikma-gradient tracking-tight px-4 leading-tight">
              {slides[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed max-w-[280px]">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="w-full max-w-md px-8 space-y-6">
        {/* Dots indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "w-10 bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.4)]"
                    : "w-2 bg-emerald-600/20"
                )}
              />
            ))}
          </div>
          {!isLastSlide && (
            <p className="text-xs text-muted-foreground/50 tracking-wide">
              ← Swipez pour naviguer →
            </p>
          )}
        </div>

        {/* Button — only on last slide */}
        {isLastSlide && (
          <Button
            onClick={onComplete}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-bold rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            C&apos;est parti !
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
