'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type,
    Maximize,
    BookOpen,
    Settings,
    Rocket,
    MessageCircle,
    X,
    Image as ImageIcon,
    AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onToolSelect: (tool: 'font' | 'format' | 'resources' | 'settings' | 'updates' | 'feedback' | 'signature' | 'gallery') => void;
}

export function ToolsDrawer({ isOpen, onClose, onToolSelect }: ToolsDrawerProps) {
    const tools = [
        {
            id: 'font' as const,
            icon: Type,
            label: 'Texte',
            description: 'Police et taille',
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
        },
        {
            id: 'format' as const,
            icon: Maximize,
            label: 'Format',
            description: 'Story ou Carré',
            color: 'bg-purple-600',
            hoverColor: 'hover:bg-purple-700',
        },
        {
            id: 'resources' as const,
            icon: BookOpen,
            label: 'Ressources',
            description: 'Accès aux sources',
            color: 'bg-teal-600',
            hoverColor: 'hover:bg-teal-700',
        },
        {
            id: 'updates' as const,
            icon: Rocket,
            label: 'Nouveautés',
            description: 'Quoi de neuf ?',
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
        },
        {
            id: 'signature' as const,
            icon: AtSign,
            label: 'Signature',
            description: 'Votre @pseudo',
            color: 'bg-emerald-600',
            hoverColor: 'hover:bg-emerald-700',
        },
        {
            id: 'feedback' as const,
            icon: MessageCircle,
            label: 'Votre avis',
            description: 'Aidez-nous',
            color: 'bg-amber-600',
            hoverColor: 'hover:bg-amber-700',
        },
        {
            id: 'settings' as const,
            icon: Settings,
            label: 'Paramètres',
            description: 'Configuration',
            color: 'bg-orange-600',
            hoverColor: 'hover:bg-orange-700',
        },
    ];

    const handleSelect = (toolId: typeof tools[number]['id']) => {
        onToolSelect(toolId);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[60vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground">Outils d'édition</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Personnalisez votre création</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tools Grid */}
                        <div className="p-6 pb-12 safe-area-bottom overflow-y-auto max-h-[calc(60vh-80px)]">
                            <div className="grid grid-cols-2 gap-4">
                                {tools.map((tool) => (
                                    <motion.button
                                        key={tool.id}
                                        onClick={() => handleSelect(tool.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300",
                                            "min-h-[130px] border-2 border-border",
                                            tool.color,
                                            tool.hoverColor,
                                            "text-white"
                                        )}
                                    >
                                        <tool.icon className="w-10 h-10 mb-3" />
                                        <span className="text-base font-bold mb-1">
                                            {tool.label}
                                        </span>
                                        <span className="text-xs text-white/90 text-center leading-tight">
                                            {tool.description}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
