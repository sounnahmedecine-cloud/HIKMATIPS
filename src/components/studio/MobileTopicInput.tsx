'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileTopicInputProps {
    value: string;
    onChange: (val: string) => void;
    isVisible: boolean;
    placeholder?: string;
    onEnter?: () => void;
    position?: 'top' | 'bottom';
}

export function MobileTopicInput({ value, onChange, isVisible, placeholder, onEnter, position = 'bottom' }: MobileTopicInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onEnter) {
            inputRef.current?.blur();
            onEnter();
        }
    };

    const handleSubmit = () => {
        if (onEnter && value.trim()) {
            inputRef.current?.blur();
            onEnter();
        }
    };

    // Auto-focus when becomes visible
    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    const isTop = position === 'top';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: isTop ? -16 : 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: isTop ? -8 : 8, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className={cn(
                        "fixed left-4 right-4 z-50 md:hidden",
                        isTop ? "top-14" : "bottom-24"
                    )}
                >
                    {/* Glow ambiance */}
                    <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/5 -z-10" />

                    <div className="bg-black/30 backdrop-blur-3xl rounded-full border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-2 px-3 py-1">
                            {/* Icône recherche */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                                <Search className="w-4 h-4 text-white/40" />
                            </div>

                            {/* Champ de saisie */}
                            <div className="flex-1">
                                <Input
                                    ref={inputRef}
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder || "Thème : patience, gratitude..."}
                                    className="border-none bg-transparent focus-visible:ring-0 text-sm h-9 px-0 placeholder:text-white/25 text-white/90 font-medium"
                                />
                            </div>

                            {value ? (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onChange('')}
                                        className="h-7 w-7 rounded-full hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.3)] text-white transition-all"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="flex-shrink-0 pr-1"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-white/25" />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
