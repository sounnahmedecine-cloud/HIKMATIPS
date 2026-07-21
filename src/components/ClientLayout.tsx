'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isActive = true;
    let removeListener: (() => void) | undefined;

    void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const requestedPath = action.notification.extra?.path;
      const path = typeof requestedPath === 'string' && requestedPath.startsWith('/')
        ? requestedPath
        : '/generateur?generate=1';
      router.push(path);
    }).then((handle) => {
      if (!isActive) {
        void handle.remove();
        return;
      }
      removeListener = () => void handle.remove();
    });

    return () => {
      isActive = false;
      removeListener?.();
    };
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
