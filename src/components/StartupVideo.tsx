'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface StartupVideoProps {
    onComplete: () => void;
}

export function StartupVideo({ onComplete }: StartupVideoProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const finish = () => {
        setIsVisible(false);
        setTimeout(onComplete, 400);
    };

    useEffect(() => {
        setMounted(true);
        // Filet de sécurité : si la vidéo ne se termine/charge jamais, on continue quand même
        const failSafe = setTimeout(finish, 6000);
        return () => clearTimeout(failSafe);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!mounted) return null;

    // Rendu via portail directement dans <body> : évite que la vidéo hérite
    // de l'animation (opacity/transform) du wrapper de page, qui casserait
    // son positionnement plein écran et provoquait un flash disgracieux.
    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
                    onClick={finish}
                >
                    <video
                        ref={videoRef}
                        src="/splash-video.mp4"
                        autoPlay
                        muted
                        playsInline
                        onEnded={finish}
                        onError={finish}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={finish}
                        className="absolute bottom-8 right-6 text-white/70 text-sm font-semibold tracking-wide px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                    >
                        Passer
                    </button>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default StartupVideo;
