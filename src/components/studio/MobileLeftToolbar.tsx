'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Upload,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLeftToolbarProps {
    onRandom: () => void;
    onUpload: () => void;
}

export function MobileLeftToolbar({ onRandom, onUpload }: MobileLeftToolbarProps) {
    const tools = [
        { id: 'random', icon: Sparkles, label: 'Aléatoire', color: 'text-amber-500', action: onRandom },
        { id: 'upload', icon: Upload, label: 'Importer', color: 'text-blue-500', action: onUpload },
    ] as const;

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 md:hidden">
            <AnimatePresence mode="popLayout">
                {tools.map((tool, index) => (
                    <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                        }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        transition={{
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        onClick={tool.action}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border transition-all duration-300",
                            "bg-emerald-50/80 text-foreground border-emerald-100/50 hover:bg-emerald-100 active:scale-95"
                        )}
                    >
                        <tool.icon className={cn("w-6 h-6", tool.color)} />
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
    );
}
