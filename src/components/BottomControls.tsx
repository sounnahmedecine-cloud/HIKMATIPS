import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    BookMarked,
    BookOpen,
    Moon,
    Search,
    Loader2,
    Image as ImageIcon,
    Upload,
    Layers,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Category = 'hadith' | 'ramadan' | 'coran' | 'recherche-ia' | 'citadelle' | 'rabbana';

interface BottomControlsProps {
    category: Category;
    setCategory: (c: any) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    onRandom?: () => void;
    onUpload?: () => void;
    onDownload?: () => void;
    onRessources?: () => void;
    onOpenCategoryDrawer?: () => void;
    onOpenToolsDrawer?: () => void;
}

export function BottomControls({
    category,
    setCategory,
    onGenerate,
    isGenerating,
    onRandom,
    onUpload,
    onDownload,
    onRessources,
    onOpenCategoryDrawer,
    onOpenToolsDrawer
}: BottomControlsProps) {
    const categoryConfig: Record<Category, { icon: React.ElementType; label: string; color: string; bgColor: string; borderColor: string }> = {
        'hadith': { icon: BookOpen, label: 'Hadith', color: 'text-primary', bgColor: 'bg-primary', borderColor: 'border-primary' },
        'coran': { icon: BookMarked, label: 'Coran', color: 'text-primary', bgColor: 'bg-primary', borderColor: 'border-primary' },
        'ramadan': { icon: Moon, label: 'Ramadan', color: 'text-accent', bgColor: 'bg-accent', borderColor: 'border-accent' },
        'recherche-ia': { icon: Search, label: 'Agent', color: 'text-primary', bgColor: 'bg-primary', borderColor: 'border-primary' },
        'citadelle': { icon: BookOpen, label: 'Citadelle', color: 'text-teal-600', bgColor: 'bg-teal-600', borderColor: 'border-teal-600' },
        'rabbana': { icon: BookMarked, label: 'Rabbana', color: 'text-rose-500', bgColor: 'bg-rose-500', borderColor: 'border-rose-500' },
    };

    const currentCategory = categoryConfig[category];
    const CategoryIcon = currentCategory.icon;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom px-4 pb-8">
            <div className="max-w-md mx-auto relative flex items-center justify-between bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-2 shadow-hikma-lg h-20">
                {/* Left - Category Selector Button */}
                <div className="flex-1 flex justify-start pl-2">
                    <button
                        onClick={onOpenCategoryDrawer}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-xl relative",
                            "hover:bg-white/50 active:scale-95"
                        )}
                        id="btn-open-categories"
                    >
                        {/* Color indicator bar */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
                            currentCategory.bgColor
                        )} />

                        <div className="flex items-center gap-2">
                            <CategoryIcon className={cn("w-6 h-6", currentCategory.color)} />
                            <Layers className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight text-foreground">
                            {currentCategory.label}
                        </span>
                    </button>
                </div>

                {/* Central Action Area (Split Buttons) */}
                <div className="relative flex items-center justify-center -mt-12 px-2 gap-4">
                    {/* Text Generation Button */}
                    <div className="flex-shrink-0 z-10 flex flex-col items-center gap-1" id="btn-generate-text">
                        <Button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="w-16 h-16 rounded-2xl shadow-hikma bg-primary hover:bg-primary/90 active:scale-95 transition-all duration-300 border-4 border-background"
                            size="icon"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
                            ) : (
                                <Sparkles className="w-8 h-8 text-primary-foreground" />
                            )}
                        </Button>
                        <span className="text-[10px] font-bold text-primary dark:text-emerald-400 uppercase tracking-tight">Texte</span>
                    </div>

                    {/* Image/Background Button */}
                    <div className="flex-shrink-0 z-10 flex flex-col items-center gap-1" id="btn-generate-image">
                        <Button
                            onClick={onRandom}
                            className="w-16 h-16 rounded-2xl shadow-hikma bg-accent hover:bg-accent/90 active:scale-95 transition-all duration-300 border-4 border-background"
                            size="icon"
                        >
                            <ImageIcon className="w-8 h-8 text-accent-foreground" />
                        </Button>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-tight">Image</span>
                    </div>
                </div>

                {/* Right - Tools Button */}
                <div className="flex-1 flex justify-end pr-2">
                    <button
                        onClick={onOpenToolsDrawer}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-xl relative",
                            "hover:bg-white/50 active:scale-95"
                        )}
                        id="btn-open-tools"
                    >
                        {/* Color indicator bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600" />

                        <div className="flex items-center gap-2">
                            <Settings className="w-6 h-6 text-orange-600" />
                            <Layers className="w-4 h-4 text-muted-foreground rotate-180" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight text-foreground">
                            Outils
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
