'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Diffuse la sagesse, en un clip.',
    subtitle: 'Hadiths, versets et invocations transformés en visuels prêts à publier.',
    illustration: 'logo',
  },
  {
    title: 'Une source de rappels sans fin.',
    subtitle: 'Glissez vers le haut pour découvrir une nouvelle Hikma, pensée pour le partage.',
    illustration: 'sparkles',
  },
  {
    title: 'Gardez les mots qui vous touchent.',
    subtitle: 'Ajoutez vos rappels aux favoris et organisez-les dans vos collections.',
    illustration: 'heart',
  },
  {
    title: 'Installez une routine spirituelle.',
    subtitle: 'Recevez chaque jour une dose de sagesse au moment qui vous convient.',
    illustration: 'bell',
  },
];

function SlideIllustration({ type }: { type: string }) {
  if (type === 'logo') {
    return (
      <div className="grid h-32 w-32 place-items-center rounded-[32px] bg-white shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
        <img src="/logo-hikmaclips.png" alt="HikmaClips" className="h-28 w-28 rounded-3xl object-contain" />
      </div>
    );
  }

  const Icon = type === 'heart' ? Heart : type === 'bell' ? Bell : Sparkles;
  return (
    <motion.div
      animate={type === 'heart' ? { scale: [1, 1.08, 1] } : type === 'bell' ? { rotate: [-5, 5, -5] } : { y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2.2 }}
      className="grid h-32 w-32 place-items-center rounded-[32px] border border-white/30 bg-white/15 text-white shadow-[0_22px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl"
    >
      <Icon className="h-14 w-14" fill={type === 'heart' ? 'currentColor' : 'none'} />
    </motion.div>
  );
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;
  const nextSlide = () => (isLastSlide ? onComplete() : setCurrentSlide((value) => value + 1));
  const previousSlide = () => setCurrentSlide((value) => Math.max(0, value - 1));
  const handlers = useSwipeable({ onSwipedLeft: nextSlide, onSwipedRight: previousSlide, trackMouse: true });
  const slide = slides[currentSlide];

  return (
    <div
      {...handlers}
      className="fixed inset-0 z-[120] overflow-hidden bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white [font-family:var(--font-hikma-ui)]"
    >
      <div className="absolute left-1/2 top-[22%] h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-[65px]" />
      {!isLastSlide && (
        <button onClick={onComplete} className="absolute right-5 top-[max(1.5rem,env(safe-area-inset-top))] z-20 text-xs font-semibold text-white/80">Passer</button>
      )}

      <div className="relative flex h-full flex-col px-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,calc(env(safe-area-inset-top)+3rem))]">
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 42 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -42 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex max-w-sm flex-col items-center text-center"
            >
              <SlideIllustration type={slide.illustration} />
              <h1 className="mt-9 text-[28px] font-bold leading-[1.12] tracking-[-0.8px] [font-family:var(--font-display)]">{slide.title}</h1>
              <p className="mt-4 max-w-[280px] text-sm font-medium leading-[1.65] text-white/85">{slide.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-5 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Étape ${index + 1}`}
                className={`h-[7px] rounded-full transition-all ${index === currentSlide ? 'w-7 bg-white' : 'w-[7px] bg-white/40'}`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-white text-[15px] font-bold text-[#15703A] shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.98]"
          >
            {isLastSlide ? 'Commencer' : 'Continuer'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
