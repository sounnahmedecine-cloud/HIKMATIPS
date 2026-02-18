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
                    initial={{ opacity: 0, y: isTop ? -20 : 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: isTop ? -10 : 10, scale: 0.95 }}
                    className={cn(
                        "fixed left-4 right-4 z-30 md:hidden",
                        isTop ? "top-20" : "bottom-28"
                    )}
                >
                    <div className="relative group">
                        {/* Enhanced Glassmorphism Container */}
                        <div className="bg-[#FFFDD0] dark:bg-gray-900 backdrop-blur-2xl rounded-full border-2 border-emerald-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                            <div className="flex items-center gap-2 px-6 py-2">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-emerald-600" />
                                </div>

                                <div className="flex-1 flex flex-col gap-1">
                                    <Input
                                        ref={inputRef}
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder || (isTop ? "Rechercher avec l'Agent (ex: Parents)..." : "Ex: La patience, la gratitude...")}
                                        className="border-none bg-transparent focus-visible:ring-0 text-base h-12 px-0 placeholder:text-muted-foreground/60 font-medium text-foreground"
                                    />
                                    <span className="text-[10px] text-muted-foreground/70 pl-0">
                                        Appuyez sur ✓ pour générer
                                    </span>
                                </div>

                                {value && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onChange('')}
                                            className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0"
                                        >
                                            <X className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-orange-500 transition-colors flex-shrink-0 shadow-lg"
                                            size="icon"
                                        >
                                            <Check className="w-5 h-5 text-white" />
                                        </Button>
                                    </>
                                )}

                                {!value && (
                                    <motion.div
                                        animate={{ rotate: [0, 15, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="pr-2"
                                    >
                                        <Sparkles className="w-5 h-5 text-emerald-500/40" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Visual indicator that it belongs to the dock/top */}
                        <div className={cn(
                            "absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FFFDD0] dark:bg-gray-900 backdrop-blur-2xl border-emerald-500/30 -z-10",
                            isTop
                                ? "-top-2 border-l-2 border-t-2 rotate-45"
                                : "-bottom-2 border-r-2 border-b-2 rotate-45"
                        )} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
