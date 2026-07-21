import Link from 'next/link';
import type { ReactNode } from 'react';
import { FolderHeart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HikmaLibraryHeaderProps {
  active: 'favorites' | 'collections';
  action?: ReactNode;
}

export function HikmaLibraryHeader({ active, action }: HikmaLibraryHeaderProps) {
  return (
    <header className="relative h-[174px] overflow-hidden bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 pt-[max(2.5rem,env(safe-area-inset-top))] text-white">
      <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-white/10 blur-[52px]" />
      <div className="relative mx-auto flex max-w-2xl items-center justify-between">
        <h1 className="text-[26px] font-bold tracking-[-0.6px] [font-family:var(--font-display)]">Bibliothèque</h1>
        {action}
      </div>
      <div className="relative mx-auto mt-4 flex max-w-2xl gap-1.5 rounded-[14px] border border-white/20 bg-black/15 p-1 backdrop-blur-xl">
        <Link
          href="/favoris"
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-xs font-semibold transition-colors',
            active === 'favorites' ? 'bg-white text-[#15703A] shadow-sm' : 'text-white/90 hover:bg-white/10'
          )}
        >
          <Heart className="h-3.5 w-3.5" fill={active === 'favorites' ? 'currentColor' : 'none'} /> Favoris
        </Link>
        <Link
          href="/collections"
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-xs font-semibold transition-colors',
            active === 'collections' ? 'bg-white text-[#15703A] shadow-sm' : 'text-white/90 hover:bg-white/10'
          )}
        >
          <FolderHeart className="h-3.5 w-3.5" /> Collections
        </Link>
      </div>
    </header>
  );
}
