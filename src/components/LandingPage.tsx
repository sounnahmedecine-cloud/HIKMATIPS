'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { HeroModern } from '@/components/HeroModern';

const GeneratorPage = dynamic(() => import('@/components/GeneratorPage'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement du générateur...</p>
    </div>
  ),
});

export default function LandingPage() {
  const scrollToApp = () => {
    document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-emerald-50/40 dark:bg-slate-950 text-zinc-900 dark:text-slate-100">
      {/* Ambient lighting orbs */}
      <div className="fixed top-1/4 -right-64 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 -left-64 w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(240,192,64,0.06) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      {/* ── HERO ── */}
      <HeroModern onScrollToApp={scrollToApp} />

      {/* ── GENERATOR ── */}
      <section id="app-section" className="relative z-20 isolate py-20 px-4 scroll-mt-16 flex flex-col items-center text-center bg-emerald-50/40 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="w-full max-w-3xl"
        >
          <p className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">Coran & Sunnah</p>
          <p className="text-zinc-500 dark:text-slate-400 text-lg mb-10">Hadith, verset coranique ou doua — sélectionne la catégorie et publie en quelques secondes.</p>
          <GeneratorPage />
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-emerald-100 dark:border-slate-800 mt-16 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Moon className="h-4 w-4 text-zinc-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">HikmaClips</span>
              <span className="text-zinc-600 dark:text-slate-400 text-sm">v1.0.5</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-500 dark:text-slate-400">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Confidentialité</Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">CGU</Link>
              <Link href="/updates" className="hover:text-primary transition-colors">Nouveautés</Link>
              <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
            </nav>
          </div>

          <div className="mt-8 pt-8 border-t border-emerald-100 dark:border-slate-800 text-center text-sm text-zinc-400 dark:text-slate-500">
            © {new Date().getFullYear()} HikmaClips · Développé par{' '}
            <a href="http://web-linecreator.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              web-linecreator.fr
            </a>
            {' '}· Meknès, Maroc
          </div>
        </div>
      </footer>
    </div>
  );
}
