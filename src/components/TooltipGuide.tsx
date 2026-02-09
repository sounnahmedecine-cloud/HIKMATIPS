'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TooltipStep {
    id: string;
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    offset?: { x: number; y: number };
}

interface TooltipGuideProps {
    isActive: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

const steps: TooltipStep[] = [
    {
        id: 'step-1',
        targetId: 'btn-category-hadith',
        title: '1. Choisissez une catégorie',
        description: 'Sélectionnez Hadith, Coran, Ramadan ou utilisez l\'Agent IA pour une recherche personnalisée',
        position: 'top',
        offset: { x: 0, y: -20 },
    },
    {
        id: 'step-2',
        targetId: 'btn-generate',
        title: '2. Générez votre rappel',
        description: 'Appuyez sur ce bouton pour diffuser votre image inspirante',
        position: 'top',
        offset: { x: 0, y: -30 },
    },
    {
        id: 'step-3',
        targetId: 'btn-random-bg',
        title: '3. Personnalisez (optionnel)',
        description: 'Changez l\'arrière-plan, la police, le format et les couleurs à votre goût',
        position: 'top',
        offset: { x: 0, y: -20 },
    },
    {
        id: 'step-4',
        targetId: 'btn-download',
        title: '4. Diffusez votre rappel',
        description: 'Téléchargez ou partagez directement votre rappel sur les réseaux sociaux',
        position: 'top',
        offset: { x: 0, y: -20 },
    },
];

export function TooltipGuide({ isActive, onComplete, onSkip }: TooltipGuideProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isActive) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            const targetElement = document.getElementById(step.targetId);

            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const offset = step.offset || { x: 0, y: 0 };

                let x = rect.left + rect.width / 2 + offset.x;
                let y = rect.top + offset.y;

                if (step.position === 'bottom') {
                    y = rect.bottom + Math.abs(offset.y);
                } else if (step.position === 'left') {
                    x = rect.left + offset.x;
                    y = rect.top + rect.height / 2;
                } else if (step.position === 'right') {
                    x = rect.right + offset.x;
                    y = rect.top + rect.height / 2;
                }

                setTooltipPosition({ x, y });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [currentStep, isActive]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isActive) return null;

    const step = steps[currentStep];

    return (
        <>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100] pointer-events-none"
            />

            {/* Spotlight effect on target */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed z-[101] pointer-events-none"
                    style={{
                        left: tooltipPosition.x - 60,
                        top: tooltipPosition.y - 60,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    }}
                />
            </AnimatePresence>

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed z-[102] pointer-events-auto"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 max-w-xs border-2 border-emerald-500">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-1"
                                onClick={onSkip}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-1.5 mb-4">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'h-1.5 rounded-full transition-all duration-300',
                                        index === currentStep
                                            ? 'w-6 bg-emerald-600'
                                            : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                                    )}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                className="text-xs"
                            >
                                Précédent
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleNext}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                            >
                                {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                            </Button>
                        </div>

                        {/* Arrow pointing to target */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <ArrowDown className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
