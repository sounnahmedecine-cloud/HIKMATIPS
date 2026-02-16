'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Home, Heart, Sparkles, BookOpen, Bell } from 'lucide-react';

const navItems = [
  { label: 'Accueil', icon: <Home size={24} />, href: '/' },
  { label: 'Ressources', icon: <BookOpen size={24} />, href: '/ressources' },
  { label: 'Générer', icon: <Sparkles size={24} />, href: '/#generate' },
  { label: 'Nouveautés', icon: <Bell size={24} />, href: '/updates' },
  { label: 'Favoris', icon: <Heart size={24} />, href: '/favoris' },
];

const HIDDEN_PATHS = ['/privacy-policy', '/terms-of-service', '/login'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeNav = navItems.find(item => item.href === pathname)?.label || 'Accueil';

  const showNav = !HIDDEN_PATHS.includes(pathname);

  return (
    <>
      <div className={showNav ? 'pb-24' : ''}>
        {children}
      </div>
      {showNav && (
        <BottomNavigation
          items={navItems}
          active={activeNav}
        />
      )}
    </>
  );
}
