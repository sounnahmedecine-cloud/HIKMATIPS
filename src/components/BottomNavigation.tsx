'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomNavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  active?: string;
  onItemClick?: (label: string) => void;
}

export function BottomNavigation({
  items,
  active,
  onItemClick
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      {/* Glow ambiance derrière la barre */}
      <div className="absolute inset-0 rounded-full blur-xl bg-black/30 -z-10 scale-95" />

      <div className="flex gap-1 bg-black/30 backdrop-blur-3xl rounded-full px-2 py-1.5 border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {items.map((item) => {
          const isActive = active === item.label;
          const isGenerate = item.label === 'Générer';
          const isTools = item.label === 'Outils';

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (isGenerate) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('hikma:generate'));
                }
                if (isTools) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('hikma:tools'));
                }
                onItemClick?.(item.label);
              }}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center transition-all duration-300",
                isGenerate
                  ? "h-14 -mt-5 rounded-full bg-emerald-500/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 z-20 border border-emerald-400/30"
                  : "h-12 rounded-full",
                isActive && !isGenerate
                  ? "text-white"
                  : isGenerate
                  ? "text-white"
                  : "text-white/35"
              )}
            >
              {isActive && !isGenerate && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-white/8 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className={cn(
                  "transition-all duration-300",
                  isActive && !isGenerate ? "scale-110 opacity-100" : "opacity-70"
                )}>
                  {isGenerate ? <Zap className="w-6 h-6 fill-white text-white" /> : item.icon}
                </div>
                {!isGenerate && (
                  <span className={cn(
                    "text-[9px] font-semibold tracking-wide transition-all duration-300",
                    isActive ? "opacity-100" : "opacity-50"
                  )}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
