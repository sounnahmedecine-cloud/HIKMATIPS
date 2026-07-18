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

export default function Home() {
  const [isNativeApp, setIsNativeApp] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setIsNativeApp(!!(window as any).Capacitor?.isNativePlatform?.());
  }, []);

  // Sur mobile (Capacitor), on ouvre directement l'application.
  // Sur le web, "/" reste la landing page marketing.
  if (isNativeApp === null) return <LoadingScreen />;

  // Vidéo de démarrage à chaque lancement de l'app mobile
  if (isNativeApp && showSplash) {
    return <StartupVideo onComplete={() => setShowSplash(false)} />;
  }

  return isNativeApp ? <GeneratorPage /> : <LandingPage />;
}
