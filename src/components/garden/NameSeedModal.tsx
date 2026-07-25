'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { setGardenName, markNamePromptShown, getStageInfo } from '@/lib/garden';

interface NameSeedModalProps {
    isOpen: boolean;
    onDone: () => void;
}

export function NameSeedModal({ isOpen, onDone }: NameSeedModalProps) {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const seed = getStageInfo(0);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const handleConfirm = () => {
        if (name.trim()) setGardenName(name);
        else markNamePromptShown();
        onDone();
    };

    const handleSkip = () => {
        markNamePromptShown();
        onDone();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 8 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-[111] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[#FBFAF7] p-6 text-center text-[#14201A] shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
                    >
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-b from-emerald-50 to-amber-50">
                            <img
                                src={seed.assetPath}
                                alt={seed.label}
                                className="h-16 w-16 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-bold [font-family:var(--font-display)]">
                            Gagne de la lumière, fais pousser ta foi intérieure
                        </h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#5B6660]">
                            Chaque hikma lue, chaque partage, chaque instant passé ici nourrit ta lumière — et ta graine avec elle. Donne-lui un nom pour commencer ce chemin ensemble.
                        </p>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                            placeholder="Nom de ta graine..."
                            maxLength={24}
                            className="mt-5 w-full rounded-2xl border border-[#ECE8DF] bg-white px-4 h-12 text-center text-sm outline-none focus:border-[#2E9E44]"
                        />

                        <button
                            onClick={handleConfirm}
                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-sm font-bold text-white shadow-[0_12px_26px_rgba(46,158,68,.4)]"
                        >
                            <Sparkles className="h-4 w-4" /> Planter ma graine
                        </button>
                        <button onClick={handleSkip} className="mt-3 text-xs font-semibold text-[#9AA39B]">
                            Plus tard
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
