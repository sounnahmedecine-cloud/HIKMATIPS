'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { StartupVideo } from '@/components/StartupVideo';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

const GeneratorPage = dynamic(() => import('@/components/GeneratorPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

const STARTUP_VIDEO_SEEN_KEY = 'hasSeenStartupVideo';

export default function Home() {
  const [isNativeApp, setIsNativeApp] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setIsNativeApp(!!(window as any).Capacitor?.isNativePlatform?.());
    // localStorage (contrairement à une variable JS ou sessionStorage) survit à un
    // redemarrage du processus de l'app par Android (fréquent en arrière-plan, d'autant
    // plus que l'app pèse maintenant 200+ Mo) — donc la vidéo ne joue qu'une seule fois
    // par installation, pas à chaque fois que le systeme relance le processus.
    if (!localStorage.getItem(STARTUP_VIDEO_SEEN_KEY)) {
      setShowSplash(true);
    }
  }, []);

  // Sur mobile (Capacitor), on ouvre directement l'application.
  // Sur le web, "/" reste la landing page marketing.
  if (isNativeApp === null) return <LoadingScreen />;

  if (isNativeApp && showSplash) {
    return (
      <StartupVideo
        onComplete={() => {
          localStorage.setItem(STARTUP_VIDEO_SEEN_KEY, 'true');
          setShowSplash(false);
        }}
      />
    );
  }

  return isNativeApp ? <GeneratorPage /> : <LandingPage />;
}
