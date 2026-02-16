'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      <div className="flex gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20 dark:border-slate-800/50">
        {items.map((item) => {
          const isActive = active === item.label;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onItemClick?.(item.label)}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center h-14 rounded-xl transition-all duration-200",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className={cn("transition-transform duration-200", isActive && "scale-110 font-bold")}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
