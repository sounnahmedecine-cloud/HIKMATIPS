'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic imports for code splitting (ssr: false required for Capacitor/browser APIs)
const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

const GeneratorPage = dynamic(() => import('@/components/GeneratorPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

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

export default function Home() {
  const [isNativeApp, setIsNativeApp] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect if running in Capacitor (Android/iOS)
    const isNative = Capacitor.isNativePlatform();
    setIsNativeApp(isNative);
  }, []);

  // Show loading while detecting platform
  if (isNativeApp === null) {
    return <LoadingScreen />;
  }

  // Native app (Android) → Show generator directly
  if (isNativeApp) {
    return <GeneratorPage />;
  }

  // Web browser → Show landing page
  return <LandingPage />;
}
