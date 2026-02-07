'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type,
    Maximize,
    Share2,
    Settings,
    ChevronUp,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'font' | 'format' | 'theme' | 'background' | 'share' | 'download' | 'settings' | null;

interface MobileStudioToolbarProps {
    onToolSelect: (tool: ToolType) => void;
    activeTool: ToolType;
}

export function MobileStudioToolbar({ onToolSelect, activeTool }: MobileStudioToolbarProps) {
    const tools = [
        { id: 'font', icon: Type, label: 'Police', color: 'text-blue-500' },
        { id: 'format', icon: Maximize, label: 'Format', color: 'text-purple-500' },
        { id: 'share', icon: Share2, label: 'Partager', color: 'text-pink-500' },
        { id: 'download', icon: Download, label: 'Télécharger', color: 'text-blue-500' },
        { id: 'settings', icon: Settings, label: 'Menu', color: 'text-orange-500' },
    ] as const;

    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 md:hidden">
            <AnimatePresence mode="popLayout">
                {tools.map((tool, index) => (
                    <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: activeTool === tool.id ? 1.1 : 1,
                        }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        transition={{
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        onClick={() => onToolSelect(tool.id)}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border transition-all duration-300",
                            activeTool === tool.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                                : "bg-emerald-50/80 text-foreground border-emerald-100/50 hover:bg-emerald-100"
                        )}
                    >
                        <tool.icon className={cn("w-8 h-8", activeTool === tool.id && "animate-pulse-soft")} />

                        {/* Tooltip Label (Subtle) */}
                        <AnimatePresence>
                            {activeTool === tool.id && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: -50 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute left-0 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap"
                                >
                                    {tool.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Hint for more tools or status */}
            <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex justify-center text-muted-foreground/30"
            >
                <ChevronUp className="w-4 h-4" />
            </motion.div>
        </div>
    );
}
