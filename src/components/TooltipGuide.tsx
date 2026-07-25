'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  placement: 'above' | 'below';
  spotlightRadius: number;
}

interface TooltipGuideProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const steps: TooltipStep[] = [
  {
    id: 'agent',
    targetId: 'tour-agent',
    title: 'Choisissez votre source',
    description: 'Touchez « Agent en direct » pour passer du Coran aux hadiths, douas, Rabbana ou rappels thématiques.',
    placement: 'below',
    spotlightRadius: 999,
  },
  {
    id: 'garden',
    targetId: 'tour-garden',
    title: 'Fais pousser ta foi intérieure',
    description: 'Chaque hikma lue, chaque partage, chaque instant passé ici te fait gagner de la lumière — et fait grandir ta petite graine, étape par étape.',
    placement: 'below',
    spotlightRadius: 999,
  },
  {
    id: 'actions',
    targetId: 'tour-actions',
    title: 'Vos actions rapides',
    description: 'Choisissez votre image, ajoutez le rappel aux favoris ou partagez le clip depuis ce rail.',
    placement: 'above',
    spotlightRadius: 28,
  },
  {
    id: 'generate',
    targetId: 'tour-generate',
    title: 'Créez un nouveau clip',
    description: 'Balayez l’écran vers le haut pour générer immédiatement une nouvelle Hikma. Ce bouton central vous ramène toujours à l’accueil.',
    placement: 'above',
    spotlightRadius: 20,
  },
  {
    id: 'navigation',
    targetId: 'tour-dock',
    title: 'Explorez HikmaClips',
    description: 'Retrouvez ici la Recherche, votre Bibliothèque et les Réglages. Le bouton central reste toujours accessible.',
    placement: 'above',
    spotlightRadius: 26,
  },
  {
    id: 'premium',
    targetId: 'tour-premium',
    title: 'Découvrez Premium',
    description: 'Débloquez l’export HD sans filigrane, les styles exclusifs et les générations illimitées.',
    placement: 'below',
    spotlightRadius: 999,
  },
];

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
}

export function TooltipGuide({ isActive, onComplete, onSkip }: TooltipGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }

    if (window.matchMedia('(min-width: 768px)').matches) {
      onSkip();
      return;
    }

    const updatePosition = () => {
      const target = document.getElementById(step.targetId);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setTargetRect(null);
        return;
      }

      setTargetRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
      });
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [isActive, onSkip, step.targetId]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip();
      if (event.key === 'ArrowRight') {
        if (currentStep === steps.length - 1) onComplete();
        else setCurrentStep((value) => value + 1);
      }
      if (event.key === 'ArrowLeft') setCurrentStep((value) => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isActive, onComplete, onSkip]);

  if (!isActive || !targetRect) return null;

  const viewportWidth = typeof window === 'undefined' ? 390 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 844 : window.innerHeight;
  const cardWidth = Math.min(358, viewportWidth - 28);
  const estimatedCardHeight = 244;
  const targetCenter = targetRect.left + targetRect.width / 2;
  const cardCenter = Math.min(
    viewportWidth - cardWidth / 2 - 14,
    Math.max(cardWidth / 2 + 14, targetCenter)
  );
  const cardLeft = cardCenter - cardWidth / 2;
  const preferredTop = step.placement === 'below'
    ? targetRect.bottom + 16
    : targetRect.top - estimatedCardHeight - 16;
  const cardTop = Math.max(14, Math.min(viewportHeight - estimatedCardHeight - 14, preferredTop));

  const handleNext = () => {
    if (currentStep === steps.length - 1) onComplete();
    else setCurrentStep((value) => value + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] [font-family:var(--font-hikma-ui)]" aria-live="polite">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#041109]/68 backdrop-blur-[1px]"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`spotlight-${step.id}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="pointer-events-none fixed border-2 border-white/90 shadow-[0_0_0_9999px_rgba(4,17,9,0.68),0_0_28px_rgba(255,255,255,0.35)]"
          style={{
            left: targetRect.left - 6,
            top: targetRect.top - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: step.spotlightRadius,
          }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.section
          key={step.id}
          role="dialog"
          aria-label={`Découverte de l’application, étape ${currentStep + 1} sur ${steps.length}`}
          initial={{ opacity: 0, y: step.placement === 'below' ? -10 : 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="fixed z-[102] rounded-[24px] border border-white/80 bg-[#FBFAF7] p-5 text-[#14201A] shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
          style={{ left: cardLeft, top: cardTop, width: cardWidth }}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white shadow-[0_8px_18px_rgba(46,158,68,0.28)]">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#2E9E44]">Étape {currentStep + 1} sur {steps.length}</p>
              <h3 className="mt-1 text-[17px] font-bold leading-tight [font-family:var(--font-display)]">{step.title}</h3>
            </div>
            <button onClick={onSkip} aria-label="Fermer le guide" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F0ECE3] text-[#7A857D] transition-colors hover:text-[#14201A]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-[13px] font-medium leading-[1.6] text-[#5B6660]">{step.description}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {steps.map((item, index) => (
                <span key={item.id} className={cn('h-1.5 rounded-full transition-all', index === currentStep ? 'w-6 bg-[#2E9E44]' : 'w-1.5 bg-[#DCD8CE]')} />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button onClick={() => setCurrentStep((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-[13px] border border-[#ECE8DF] bg-white text-[#7A857D]" aria-label="Étape précédente">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <button onClick={handleNext} className="flex h-10 items-center gap-1.5 rounded-[13px] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-4 text-xs font-bold text-white shadow-[0_8px_18px_rgba(46,158,68,0.28)]">
                {currentStep === steps.length - 1 ? <><Check className="h-4 w-4" /> Terminer</> : <>Suivant <ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
