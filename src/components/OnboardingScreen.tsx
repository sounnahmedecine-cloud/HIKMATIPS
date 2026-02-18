'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Illustration SVG 1 - Livre sacré avec lumière
const IllustrationWelcome = () => (
  <svg viewBox="0 0 300 300" className="w-64 h-64">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Cercle de fond avec lueur */}
    <circle cx="150" cy="150" r="120" fill="url(#greenGradient)" opacity="0.15" />
    <circle cx="150" cy="150" r="90" fill="url(#greenGradient)" opacity="0.1" />

    {/* Rayons de lumière */}
    {[...Array(8)].map((_, i) => (
      <motion.line
        key={i}
        x1="150"
        y1="150"
        x2={150 + Math.cos((i * Math.PI) / 4) * 130}
        y2={150 + Math.sin((i * Math.PI) / 4) * 130}
        stroke="url(#goldGradient)"
        strokeWidth="2"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: i * 0.1 }}
      />
    ))}

    {/* Livre ouvert */}
    <motion.g
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page gauche */}
      <path
        d="M150 100 L80 115 L80 200 L150 185 Z"
        fill="url(#greenGradient)"
        filter="url(#glow)"
      />
      {/* Page droite */}
      <path
        d="M150 100 L220 115 L220 200 L150 185 Z"
        fill="url(#greenGradient)"
        filter="url(#glow)"
      />
      {/* Reliure */}
      <path
        d="M148 100 L148 185 L152 185 L152 100 Z"
        fill="url(#goldGradient)"
      />
      {/* Lignes de texte simulées - page gauche */}
      <line x1="90" y1="130" x2="140" y2="125" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="90" y1="145" x2="140" y2="140" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="90" y1="160" x2="140" y2="155" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
      {/* Lignes de texte simulées - page droite */}
      <line x1="160" y1="125" x2="210" y2="130" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="160" y1="140" x2="210" y2="145" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="160" y1="155" x2="210" y2="160" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.5" />
    </motion.g>

    {/* Étoile/lumière au dessus */}
    <motion.g
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <circle cx="150" cy="70" r="15" fill="url(#goldGradient)" filter="url(#glow)" />
      <circle cx="150" cy="70" r="8" fill="#FFF" opacity="0.8" />
    </motion.g>

    {/* Motifs géométriques islamiques */}
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <polygon points="150,220 140,240 160,240" fill="url(#goldGradient)" />
      <polygon points="70,150 60,160 60,140" fill="url(#goldGradient)" />
      <polygon points="230,150 240,160 240,140" fill="url(#goldGradient)" />
    </motion.g>
  </svg>
);

// Illustration SVG 2 - Smartphone avec contenu
const IllustrationCreate = () => (
  <svg viewBox="0 0 300 300" className="w-64 h-64">
    <defs>
      <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="greenGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#16213e" />
      </linearGradient>
    </defs>

    {/* Cercles décoratifs */}
    <circle cx="150" cy="150" r="120" fill="url(#greenGradient2)" opacity="0.1" />

    {/* Smartphone */}
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Corps du téléphone */}
      <rect x="100" y="60" width="100" height="180" rx="15" fill="#1a1a2e" stroke="url(#greenGradient2)" strokeWidth="3" />
      {/* Écran */}
      <rect x="108" y="75" width="84" height="150" rx="5" fill="url(#screenGradient)" />
      {/* Notch */}
      <rect x="135" y="65" width="30" height="6" rx="3" fill="#333" />

      {/* Contenu de l'écran - carte de citation */}
      <rect x="115" y="90" width="70" height="90" rx="5" fill="url(#greenGradient2)" />
      <line x1="125" y1="110" x2="175" y2="110" stroke="url(#goldGradient2)" strokeWidth="2" />
      <line x1="125" y1="125" x2="170" y2="125" stroke="url(#goldGradient2)" strokeWidth="2" opacity="0.7" />
      <line x1="125" y1="140" x2="165" y2="140" stroke="url(#goldGradient2)" strokeWidth="2" opacity="0.5" />
      <line x1="125" y1="155" x2="160" y2="155" stroke="url(#goldGradient2)" strokeWidth="2" opacity="0.3" />

      {/* Bouton partager */}
      <rect x="115" y="190" width="70" height="25" rx="12" fill="url(#goldGradient2)" />
    </motion.g>

    {/* Sparkles / étoiles */}
    {[[60, 80], [240, 100], [70, 220], [230, 200], [50, 150], [250, 150]].map(([x, y], i) => (
      <motion.g
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
      >
        <circle cx={x} cy={y} r="4" fill="url(#goldGradient2)" />
        <line x1={x as number - 8} y1={y} x2={x as number + 8} y2={y} stroke="url(#goldGradient2)" strokeWidth="2" />
        <line x1={x} y1={y as number - 8} x2={x} y2={y as number + 8} stroke="url(#goldGradient2)" strokeWidth="2" />
      </motion.g>
    ))}

    {/* Icônes réseaux sociaux flottantes */}
    <motion.circle
      cx="70" cy="130"
      r="18"
      fill="url(#greenGradient2)"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 0.8 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    />
    <motion.circle
      cx="230" cy="170"
      r="18"
      fill="url(#greenGradient2)"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 0.8 }}
      transition={{ duration: 0.5, delay: 0.9 }}
    />
  </svg>
);

// Illustration SVG 3 - Deux mains qui se serrent
const IllustrationHandshake = () => (
  <svg viewBox="0 0 300 300" className="w-64 h-64">
    <defs>
      <linearGradient id="goldGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <linearGradient id="greenGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <linearGradient id="skinGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E7D32" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <linearGradient id="skinGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
      <filter id="glow3">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Cercle de fond avec lueur */}
    <circle cx="150" cy="150" r="120" fill="url(#greenGradient3)" opacity="0.1" />
    <circle cx="150" cy="150" r="90" fill="url(#goldGradient3)" opacity="0.05" />

    {/* Lueur centrale */}
    <motion.circle
      cx="150" cy="150"
      r="40"
      fill="url(#goldGradient3)"
      filter="url(#glow3)"
      opacity="0.3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6 }}
    />

    {/* Main gauche (verte) */}
    <motion.g
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Avant-bras gauche */}
      <path
        d="M40 150 L90 150 L95 140 L95 160 L90 150"
        fill="url(#skinGradient1)"
        stroke="url(#greenGradient3)"
        strokeWidth="2"
      />
      {/* Paume gauche */}
      <ellipse cx="105" cy="150" rx="20" ry="25" fill="url(#skinGradient1)" />
      {/* Pouce gauche */}
      <ellipse cx="95" cy="130" rx="8" ry="12" fill="url(#skinGradient1)" transform="rotate(-20, 95, 130)" />
      {/* Doigts gauche */}
      <rect x="120" y="135" width="35" height="8" rx="4" fill="url(#skinGradient1)" />
      <rect x="122" y="145" width="33" height="7" rx="3.5" fill="url(#skinGradient1)" />
      <rect x="120" y="154" width="35" height="8" rx="4" fill="url(#skinGradient1)" />
      <rect x="118" y="164" width="30" height="7" rx="3.5" fill="url(#skinGradient1)" />
    </motion.g>

    {/* Main droite (dorée) */}
    <motion.g
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Avant-bras droit */}
      <path
        d="M260 150 L210 150 L205 140 L205 160 L210 150"
        fill="url(#skinGradient2)"
        stroke="url(#goldGradient3)"
        strokeWidth="2"
      />
      {/* Paume droite */}
      <ellipse cx="195" cy="150" rx="20" ry="25" fill="url(#skinGradient2)" />
      {/* Pouce droit */}
      <ellipse cx="205" cy="170" rx="8" ry="12" fill="url(#skinGradient2)" transform="rotate(20, 205, 170)" />
      {/* Doigts droit (sous les doigts gauches) */}
      <rect x="145" y="138" width="35" height="7" rx="3.5" fill="url(#skinGradient2)" />
      <rect x="147" y="148" width="33" height="6" rx="3" fill="url(#skinGradient2)" />
      <rect x="145" y="157" width="35" height="7" rx="3.5" fill="url(#skinGradient2)" />
      <rect x="150" y="167" width="28" height="6" rx="3" fill="url(#skinGradient2)" />
    </motion.g>

    {/* Sparkles autour */}
    {[[70, 90], [230, 90], [70, 210], [230, 210], [150, 70], [150, 230]].map(([x, y], i) => (
      <motion.g
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
      >
        <circle cx={x} cy={y} r="3" fill="url(#goldGradient3)" />
        <line x1={x as number - 6} y1={y} x2={x as number + 6} y2={y} stroke="url(#goldGradient3)" strokeWidth="1.5" />
        <line x1={x} y1={y as number - 6} x2={x} y2={y as number + 6} stroke="url(#goldGradient3)" strokeWidth="1.5" />
      </motion.g>
    ))}

    {/* Cercle décoratif */}
    <motion.circle
      cx="150" cy="150"
      r="100"
      fill="none"
      stroke="url(#greenGradient3)"
      strokeWidth="1"
      strokeDasharray="5,10"
      opacity="0.3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.3 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
  </svg>
);

const slides = [
  {
    id: 1,
    title: "Bienvenue sur HikmaClips",
    subtitle: "Diffusez la sagesse de l'Islam avec style",
    Illustration: () => (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full animate-pulse-soft" />
        <img
          src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
          alt="HikmaClips Logo"
          className="w-48 h-48 rounded-3xl shadow-2xl relative z-10"
        />
      </div>
    ),
  },
  {
    id: 2,
    title: "Partagez la sagesse",
    subtitle: "Générez des images inspirantes avec versets, hadiths et rappels islamiques en quelques secondes",
    Illustration: IllustrationCreate,
  },
  {
    id: 3,
    title: "Rejoignez la communauté",
    subtitle: "Inscrivez-vous gratuitement et profitez de tous les avantages",
    Illustration: IllustrationHandshake,
    benefits: [
      "Générations illimitées",
      "Accès aux styles premium",
      "Votre signature personnalisée",
      "100% Gratuit, pour toujours InshaAllah",
    ],
  },
  {
    id: 4,
    title: "Comment ça marche ?",
    subtitle: "Diffusez votre premier rappel en 3 étapes simples",
    Illustration: IllustrationHandshake, // Placeholder, will use custom content
    isInteractive: true,
    steps: [
      { number: 1, text: "Choisissez une catégorie", icon: "📖" },
      { number: 2, text: "Appuyez sur Générer", icon: "✨" },
      { number: 3, text: "Personnalisez et partagez", icon: "🎨" },
    ],
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const CurrentIllustration = slides[currentSlide].Illustration;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-between overflow-hidden" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
      {/* Skip button */}
      <div className="w-full flex justify-end px-4 pt-2">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="text-muted-foreground hover:text-foreground text-base"
        >
          Passer
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <div className="mb-6 scale-75 sm:scale-90">
              <CurrentIllustration />
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold mb-3 text-hikma-gradient">
              {slides[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-sm sm:text-base mb-4 px-2">
              {slides[currentSlide].subtitle}
            </p>

            {/* Benefits for slide 3 */}
            {slides[currentSlide].benefits && (
              <div className="w-full space-y-2 mb-4">
                {slides[currentSlide].benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-primary/10 rounded-lg p-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Interactive steps for slide 4 */}
            {slides[currentSlide].steps && (
              <div className="w-full space-y-3 mb-4">
                {slides[currentSlide].steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-800/20 dark:to-teal-900/20 rounded-xl p-3 border-2 border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-0.5">
                        Étape {step.number}
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {step.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md space-y-3 px-6 pb-4">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'w-8 bg-primary'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {isLastSlide ? (
            <Button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-5 text-base font-semibold rounded-2xl"
            >
              Commencer
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={nextSlide}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-5 text-base font-semibold rounded-2xl"
            >
              Suivant
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
