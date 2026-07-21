'use client';

import Link from 'next/link';
import { LibraryBig, Search, Settings, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type HikmaAppSection = 'clips' | 'search' | 'library' | 'settings';

interface HikmaAppDockProps {
  active: HikmaAppSection;
  className?: string;
  onGenerate?: () => void;
}

const items = [
  { id: 'clips' as const, label: 'Clips', href: '/generateur', icon: Sparkles },
  { id: 'search' as const, label: 'Recherche', href: '/recherche-hadiths', icon: Search },
  { id: 'library' as const, label: 'Biblio', href: '/favoris', icon: LibraryBig },
  { id: 'settings' as const, label: 'Réglages', href: '/settings', icon: Settings },
];

export function HikmaAppDock({ active, className, onGenerate }: HikmaAppDockProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[80] flex h-[66px] w-[calc(100%-28px)] max-w-[430px] -translate-x-1/2 items-center rounded-[24px] border border-[#ECE8DF] bg-white px-2 shadow-[0_14px_32px_rgba(16,61,36,0.20)] [font-family:var(--font-hikma-ui)]',
        className
      )}
    >
      {items.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-full flex-1 flex-col items-center justify-center gap-1 text-[9px] font-semibold transition-colors',
              isActive ? 'text-[#2E9E44]' : 'text-[#9AA39B] hover:text-[#5B6660]'
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.6 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => {
          if (onGenerate) onGenerate();
          else window.location.href = '/generateur?generate=1';
        }}
        aria-label="Générer un nouveau clip"
        className="mx-1 grid h-[54px] w-[54px] -translate-y-[15px] place-items-center rounded-[18px] border-[3px] border-white bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white shadow-[0_10px_22px_rgba(46,158,68,0.50)] transition-transform hover:-translate-y-[17px] active:scale-95"
      >
        <Zap className="h-6 w-6" fill="currentColor" />
      </button>

      {items.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-full flex-1 flex-col items-center justify-center gap-1 text-[9px] font-semibold transition-colors',
              isActive ? 'text-[#2E9E44]' : 'text-[#9AA39B] hover:text-[#5B6660]'
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.6 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
