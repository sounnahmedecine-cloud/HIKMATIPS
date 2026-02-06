'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles } from 'lucide-react';
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
                    className="fixed bottom-24 left-4 right-4 z-30 md:hidden"
                >
                    <div className="relative group">
                        {/* Glassmorphism Container */}
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl rounded-2xl border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] -z-10" />

                        <div className="flex items-center gap-2 p-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Search className="w-4 h-4 text-primary" />
                            </div>

                            <Input
                                ref={inputRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder || "Écrivez votre sujet ici..."}
                                className="border-none bg-transparent focus-visible:ring-0 text-sm h-10 px-0 placeholder:text-muted-foreground/50 font-medium"
                            />

                            {value && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onChange('')}
                                    className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            )}

                            {!value && (
                                <motion.div
                                    animate={{ rotate: [0, 15, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="pr-2"
                                >
                                    <Sparkles className="w-4 h-4 text-primary/40" />
                                </motion.div>
                            )}
                        </div>

                        {/* Visual indicator that it belongs to the dock */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/40 backdrop-blur-2xl border-r border-b border-primary/10 rotate-45 -z-20" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
