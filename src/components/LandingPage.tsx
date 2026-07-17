'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon } from 'lucide-react';
import { HeroModern } from '@/components/HeroModern';

export default function LandingPage() {
  const router = useRouter();

  const goToApp = () => {
    router.push('/generateur');
  };

  return (
    <div className="w-full min-h-screen bg-emerald-50/40 dark:bg-slate-950 text-zinc-900 dark:text-slate-100">
      {/* Ambient lighting orbs */}
      <div className="fixed top-1/4 -right-64 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 -left-64 w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(240,192,64,0.06) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      {/* ── HERO ── */}
      <HeroModern onScrollToApp={goToApp} />

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
