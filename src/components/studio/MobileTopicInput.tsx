'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MobileTopicInputProps {
    value: string;
    onChange: (val: string) => void;
    isVisible: boolean;
    placeholder?: string;
    onEnter?: () => void;
}

export function MobileTopicInput({ value, onChange, isVisible, placeholder, onEnter }: MobileTopicInputProps) {
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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed bottom-28 left-4 right-4 z-30 md:hidden"
                >
                    <div className="relative group">
                        {/* Enhanced Glassmorphism Container */}
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl border-2 border-emerald-600/30 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                            <div className="flex items-center gap-2 p-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-emerald-600" />
                                </div>

                                <div className="flex-1 flex flex-col gap-1">
                                    <Input
                                        ref={inputRef}
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder || "Ex: La patience, la gratitude..."}
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
                                            className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors flex-shrink-0 shadow-lg"
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
                                        <Sparkles className="w-5 h-5 text-emerald-600/40" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Visual indicator that it belongs to the dock */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-r-2 border-b-2 border-emerald-600/30 rotate-45 -z-10" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
