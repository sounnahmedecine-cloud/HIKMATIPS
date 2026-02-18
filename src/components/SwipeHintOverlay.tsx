'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * SwipeHintOverlay
 * Shows a transparent animated swipe gesture on the preview
 * to teach users they can swipe UP (new quote) and DOWN (previous quote).
 * Displays only once per install (persisted in localStorage).
 * Auto-dismisses after ~5.5 seconds or on tap.
 */
export function SwipeHintOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenSwipeHint');
        if (!hasSeen) {
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem('hasSeenSwipeHint', 'true');
    };

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(dismiss, 5500);
        return () => clearTimeout(timer);
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={dismiss}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto md:hidden"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                >
                    {/* Container for both hints */}
                    <motion.div
                        className="flex flex-col items-center gap-8"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {/* Swipe UP hint */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            animate={{ y: [0, -12, 0] }}
                            transition={{ repeat: 3, duration: 1.2, ease: 'easeInOut' }}
                        >
                            <ChevronUp className="w-7 h-7 text-white/80" />
                            <ChevronUp className="w-7 h-7 -mt-4 text-white/60" />
                            <span className="text-3xl select-none mt-1">👆</span>
                        </motion.div>

                        {/* Label - NEW */}
                        <motion.div
                            className="flex flex-col items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <p className="text-white text-sm font-bold tracking-wide px-5 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/15">
                                ☝️ Swipez vers le haut = Nouvelle
                            </p>
                            <p className="text-white text-sm font-bold tracking-wide px-5 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/15">
                                👇 Swipez vers le bas = Précédente
                            </p>
                        </motion.div>

                        {/* Swipe DOWN hint */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: 3, duration: 1.2, ease: 'easeInOut' }}
                        >
                            <span className="text-3xl select-none mb-1">👇</span>
                            <ChevronDown className="w-7 h-7 -mb-4 text-white/60" />
                            <ChevronDown className="w-7 h-7 text-white/80" />
                        </motion.div>
                    </motion.div>

                    {/* Tap to dismiss */}
                    <motion.p
                        className="absolute bottom-24 text-white/50 text-xs tracking-widest uppercase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Touchez pour fermer
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
