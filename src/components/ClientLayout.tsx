'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Home, BookOpen, Share2, Wand2, Settings } from 'lucide-react';

const navItems = [
  { label: 'Accueil', icon: <Home size={22} />, href: '/' },
  { label: 'Ressources', icon: <BookOpen size={22} />, href: '/ressources' },
  { label: 'Partager', icon: <Share2 size={22} />, href: '/partager' },
  { label: 'Studio', icon: <Wand2 size={22} />, href: '/studio' },
  { label: 'Paramètres', icon: <Settings size={22} />, href: '/settings' },
];

const HIDDEN_PATHS = ['/privacy-policy', '/terms-of-service', '/', '/studio'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeNav = navItems.find(item => item.href === pathname)?.label || 'Accueil';

  const showNav = !HIDDEN_PATHS.includes(pathname);

  return (
    <>
      <div className={showNav ? 'pb-20' : ''}>
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
