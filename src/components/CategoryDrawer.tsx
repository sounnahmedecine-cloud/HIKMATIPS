'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    BookMarked,
    Moon,
    Check,
    X,
    Sparkles,
    Heart,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'hadith' | 'ramadan' | 'coran' | 'recherche-ia' | 'citadelle' | 'rabbana';


interface CategoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category;
    onSelectCategory: (category: Category) => void;
}

export function CategoryDrawer({ isOpen, onClose, category, onSelectCategory }: CategoryDrawerProps) {
    const categories = [
        {
            id: 'hadith' as Category,
            icon: BookOpen,
            label: 'Hadith',
            description: 'Paroles du Prophète ﷺ',
            color: 'bg-emerald-600',
            hoverColor: 'hover:bg-emerald-700',
            borderColor: 'border-emerald-600',
            shadowColor: 'shadow-emerald-600/50',
            textColor: 'text-emerald-600'
        },
        {
            id: 'coran' as Category,
            icon: BookMarked,
            label: 'Coran',
            description: 'Versets du Livre Sacré',
            color: 'bg-emerald-700',
            hoverColor: 'hover:bg-emerald-800',
            borderColor: 'border-emerald-700',
            shadowColor: 'shadow-emerald-700/50',
            textColor: 'text-emerald-700'
        },
        {
            id: 'ramadan' as Category,
            icon: Moon,
            label: 'Ramadan',
            description: 'Rappels du mois béni',
            color: 'bg-orange-500',
            hoverColor: 'hover:bg-orange-600',
            borderColor: 'border-orange-500',
            shadowColor: 'shadow-orange-500/50',
            textColor: 'text-orange-500'
        },
        {
            id: 'citadelle' as Category,
            icon: Sparkles,
            label: 'Citadelle',
            description: 'Douas & Invocations',
            color: 'bg-emerald-500',
            hoverColor: 'hover:bg-emerald-600',
            borderColor: 'border-emerald-500',
            shadowColor: 'shadow-emerald-500/50',
            textColor: 'text-emerald-500'
        },
        {
            id: 'rabbana' as Category,
            icon: Heart,
            label: 'Les 40 Rabbana',
            description: 'Invocations coraniques',
            color: 'bg-rose-500',
            hoverColor: 'hover:bg-rose-600',
            borderColor: 'border-rose-500',
            shadowColor: 'shadow-rose-500/50',
            textColor: 'text-rose-500'
        },
        {
            id: 'recherche-ia' as Category,
            icon: Search,
            label: 'Agent Hikma',
            description: 'Recherche IA personnalisée',
            color: 'bg-violet-600',
            hoverColor: 'hover:bg-violet-700',
            borderColor: 'border-violet-600',
            shadowColor: 'shadow-violet-600/50',
            textColor: 'text-violet-600'
        },
    ];

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleSelect = (cat: Category) => {
        onSelectCategory(cat);
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground">Choisir une catégorie</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Sélectionnez le type de rappel à générer</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Categories Grid */}
                        <div className="p-6 pb-24 safe-area-bottom overflow-y-auto max-h-[calc(85vh-80px)]">
                            <div className="grid grid-cols-2 gap-4">
                                {categories.map((cat) => {
                                    const isSelected = category === cat.id;
                                    return (
                                        <motion.button
                                            key={cat.id}
                                            onClick={() => handleSelect(cat.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300",
                                                "min-h-[140px] border-2",
                                                isSelected
                                                    ? `${cat.color} ${cat.borderColor} shadow-lg ${cat.shadowColor} border-4`
                                                    : "bg-muted/30 border-border hover:border-muted-foreground/30"
                                            )}
                                        >
                                            {/* Active Badge */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                                                >
                                                    <Check className="w-5 h-5 text-green-600 font-bold" />
                                                </motion.div>
                                            )}

                                            {/* Icon */}
                                            <cat.icon
                                                className={cn(
                                                    "w-12 h-12 mb-3",
                                                    isSelected ? "text-white" : cat.textColor
                                                )}
                                            />

                                            {/* Label */}
                                            <span
                                                className={cn(
                                                    "text-base font-bold mb-1",
                                                    isSelected ? "text-white" : "text-foreground"
                                                )}
                                            >
                                                {cat.label}
                                            </span>

                                            {/* Description */}
                                            <span
                                                className={cn(
                                                    "text-xs text-center leading-tight",
                                                    isSelected ? "text-white/90" : "text-muted-foreground"
                                                )}
                                            >
                                                {cat.description}
                                            </span>

                                            {/* Active Indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="category-active"
                                                    className="absolute bottom-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full"
                                                >
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                                                        Actif
                                                    </span>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
