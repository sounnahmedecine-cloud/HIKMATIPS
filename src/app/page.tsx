'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

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

// Dynamic imports for code splitting
const HomeScreen = dynamic(() => import('@/components/HomeScreen').then(mod => ({ default: mod.HomeScreen })), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return <HomeScreen />;
}
