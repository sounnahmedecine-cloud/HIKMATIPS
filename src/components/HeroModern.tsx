'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Share2, ChevronLeft, ChevronRight, Zap, Download } from 'lucide-react';

interface HeroModernProps {
  onScrollToApp: () => void;
}

const QUOTES = [
  { arabe: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", fr: "À côté de la difficulté est, certes, une facilité.", source: "Sourate Ash-Sharh 94:6" },
  { arabe: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", fr: "Les actions ne valent que par leurs intentions.", source: "Sahih Bukhari" },
  { arabe: "فَاصْبِرْ صَبْرًا جَمِيلًا", fr: "Endure d'une belle patience.", source: "Sourate Al-Ma'arij 70:5" },
];

const BG_CLASSES = [
  'from-emerald-500 via-teal-500 to-amber-400',
  'from-fuchsia-500 via-rose-500 to-amber-400',
  'from-sky-500 via-emerald-500 to-lime-400',
];

export function HeroModern({ onScrollToApp }: HeroModernProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % QUOTES.length);
      setLiked(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = QUOTES[currentIdx];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Text ── */}
          <motion.div
            className="flex flex-col items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">HikmaClips — Rappels du Coran & Sunnah</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-6 text-foreground">
              Diffuse la
              <br />
              <span className="bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent italic font-light">
                Sunnah
              </span>
            </h1>

            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl mb-10">
              Des hadiths authentiques, des versets coraniques et des invocations (douas) — publie-les sur TikTok, Instagram et YouTube en quelques secondes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <button
                onClick={onScrollToApp}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold text-lg rounded-2xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
              >
                <Zap className="w-5 h-5 fill-current" />
                Je veux mon hadith du jour
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://drive.google.com/file/d/1p8C42qFhkHdZEdVIcIC59z6tCyVDMi_a/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border border-amber-300/40 text-white font-bold text-base rounded-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-lg flex items-center justify-center gap-2.5 group"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Télécharger l'APK</span>
                <span className="text-xs text-zinc-400 font-normal">Android</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-foreground font-bold">+2k</div>
                </div>
                <span>Utilisateurs actifs</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-border/50">
              {[
                { value: '32 400+', label: 'Hadiths authentiques' },
                { value: '9', label: 'Recueils majeurs' },
                { value: '100%', label: 'Sources vérifiées' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Phone mockup ── */}
          <motion.div
            className="relative flex items-center justify-center min-h-[500px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-80 bg-primary/30 rounded-full blur-3xl" />
            </div>

            {/* Phone frame */}
            <motion.div
              className="relative w-[240px] sm:w-[260px]"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative bg-zinc-800 rounded-[52px] p-[3px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-zinc-700/60">
                <div className="bg-zinc-950 rounded-[50px] overflow-hidden relative" style={{ aspectRatio: '9/19.5' }}>

                  {/* Dynamic island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-950 rounded-full z-20 border border-zinc-800" />

                  {/* Bg gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${BG_CLASSES[currentIdx]} transition-all duration-1000`} />
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl" />

                  {/* App top bar */}
                  <div className="absolute top-10 left-0 right-0 px-3 flex items-center justify-between z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/10">
                      <Sparkles className="w-2.5 h-2.5 text-white/80" />
                      <span className="text-[9px] text-white/80 font-bold tracking-wider uppercase">Agent</span>
                    </div>
                    <div className="bg-yellow-500/20 rounded-full px-2.5 py-1 border border-yellow-500/30">
                      <span className="text-[9px] text-yellow-400 font-bold">✦ Premium</span>
                    </div>
                  </div>

                  {/* Hikma — animated */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIdx}
                      className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center z-10"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-white/60 text-sm mb-3 leading-relaxed font-arabic" dir="rtl">
                        {current.arabe}
                      </p>
                      <p className="text-white text-[12px] font-medium leading-snug max-w-[170px]">
                        &ldquo;{current.fr}&rdquo;
                      </p>
                      <p className="text-white/35 text-[8px] uppercase tracking-[0.2em] mt-3">
                        — {current.source} —
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Right buttons */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${liked ? 'bg-red-500/30 border-red-400/60' : 'bg-white/10 border-white/20'}`}
                    >
                      <Heart className={`w-3 h-3 ${liked ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Share2 className="w-3 h-3 text-white/70" />
                    </button>
                  </div>

                  {/* Bottom controls */}
                  <div className="absolute bottom-14 left-0 right-0 flex items-center justify-center gap-1.5 px-3 z-10">
                    <button className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <ChevronLeft className="w-3.5 h-3.5 text-white/70" />
                    </button>
                    <div className="flex-1 h-9 rounded-full bg-emerald-500 flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/40">
                      <Zap className="w-3 h-3 text-white fill-white" />
                      <span className="text-white text-[10px] font-bold">Agent Hikma</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                    </button>
                  </div>

                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 h-11 bg-emerald-600/40 backdrop-blur-md flex items-center justify-around px-2 border-t border-white/15 z-10">
                    {[['🏠', 'Accueil'], ['⚡', 'Générer'], ['❤️', 'Favoris'], ['⚙️', 'Réglages']].map(([icon, label], i) => (
                      <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
                        <span className="text-[11px]">{icon}</span>
                        <span className="text-[6px] text-white/60">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Home indicator */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-zinc-600 rounded-full" />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-2/3 h-5 bg-primary/20 rounded-full blur-xl" />
            </motion.div>

            {/* Floating badge: shares */}
            <motion.div
              className="absolute -left-2 sm:-left-6 top-1/3 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-border/50 px-3 py-2.5 flex items-center gap-2.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.6 }, x: { delay: 0.6 }, y: { duration: 4, repeat: Infinity, delay: 0.5 } }}
            >
              <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Partages/jour</p>
                <p className="font-bold text-sm text-foreground">1 200+</p>
              </div>
            </motion.div>

            {/* Floating badge: sources */}
            <motion.div
              className="absolute -right-2 sm:-right-6 bottom-1/3 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-border/50 px-3 py-2.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8 }, y: { duration: 5, repeat: Infinity, delay: 1 } }}
            >
              <p className="text-[10px] text-muted-foreground">Sources vérifiées</p>
              <p className="font-bold text-sm text-foreground flex items-center gap-1">
                <span className="text-emerald-500">✓</span> 9 Recueils
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            { icon: '📖', label: 'Versets Coraniques', desc: 'Accédez à des versets authentiques avec traduction française certifiée.' },
            { icon: '✨', label: 'Hadiths Vérifiés', desc: 'Issus exclusivement des recueils authentiques — Bukhari, Muslim, Tirmidhi.' },
            { icon: '🎨', label: 'Export HD', desc: 'Images haute qualité optimisées pour Reels, Shorts et Stories.' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl bg-card/50 border border-primary/10 backdrop-blur-sm hover:border-accent/30 transition-all"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-foreground mb-2">{feature.label}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
