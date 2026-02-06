'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type,
    Maximize,
    Share2,
    Settings,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'font' | 'format' | 'share' | 'settings' | null;

interface MobileStudioToolbarProps {
    onToolSelect: (tool: ToolType) => void;
    activeTool: ToolType;
}

export function MobileStudioToolbar({ onToolSelect, activeTool }: MobileStudioToolbarProps) {
    const tools = [
        { id: 'font', icon: Type, label: 'Police', color: 'bg-blue-500' },
        { id: 'format', icon: Maximize, label: 'Format', color: 'bg-purple-500' },
        { id: 'share', icon: Share2, label: 'Partager', color: 'bg-pink-500' },
        { id: 'settings', icon: Settings, label: 'Menu', color: 'bg-orange-500' },
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
                                ? "bg-primary text-white border-primary shadow-primary/20"
                                : "bg-background/60 text-foreground border-border/50 hover:bg-background/80"
                        )}
                    >
                        <tool.icon className={cn("w-6 h-6", activeTool === tool.id && "animate-pulse-soft")} />

                        {/* Tooltip Label (Subtle) */}
                        <AnimatePresence>
                            {activeTool === tool.id && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: -50 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute left-0 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap"
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
