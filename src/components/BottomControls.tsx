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
    Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Category = 'hadith' | 'ramadan' | 'thematique' | 'coran' | 'recherche-ia';

interface BottomControlsProps {
    category: Category;
    setCategory: (c: any) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    onRandom?: () => void;
    onUpload?: () => void;
}

export function BottomControls({
    category,
    setCategory,
    onGenerate,
    isGenerating,
    onRandom,
    onUpload
}: BottomControlsProps) {
    const categoriesLeft = [
        { id: 'hadith', icon: BookOpen, label: 'Hadith' },
        { id: 'coran', icon: BookMarked, label: 'Coran' },
    ] as const;

    const categoriesRight = [
        { id: 'ramadan', icon: Moon, label: 'Ramadan' },
        { id: 'recherche-ia', icon: Search, label: 'Thème' },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom px-4 pb-4">
            <div className="max-w-md mx-auto relative flex items-center justify-between bg-emerald-50/95 backdrop-blur-xl border border-emerald-100 rounded-3xl p-2 shadow-2xl h-20">
                {/* Left Categories */}
                <div className="flex-1 flex justify-around">
                    {categoriesLeft.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-smooth px-2 py-1 rounded-xl",
                                category === cat.id ? "text-emerald-600" : "text-muted-foreground"
                            )}
                        >
                            <cat.icon className={cn("w-5 h-5", category === cat.id && "animate-pulse-soft")} />
                            <span className="text-[8px] font-bold uppercase tracking-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Central Action Area (Dock) */}
                <div className="relative flex items-center justify-center -mt-12 px-2">
                    {/* Random Button (Left Satellite) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            onClick={onRandom}
                            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border order-first shadow-lg mr-2"
                            size="icon"
                            variant="ghost"
                        >
                            <ImageIcon className="w-5 h-5 text-primary" />
                        </Button>
                    </motion.div>

                    {/* Main Generate Button */}
                    <div className="flex-shrink-0 z-10">
                        <Button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="w-16 h-16 rounded-full shadow-hikma bg-gradient-to-tr from-emerald-600 to-teal-700 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-background"
                            size="icon"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                <Sparkles className="w-8 h-8 text-white fill-white/20" />
                            )}
                        </Button>
                    </div>

                    {/* Upload Button (Right Satellite) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            onClick={onUpload}
                            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg ml-2"
                            size="icon"
                            variant="ghost"
                        >
                            <Upload className="w-5 h-5 text-primary" />
                        </Button>
                    </motion.div>
                </div>

                {/* Right Categories */}
                <div className="flex-1 flex justify-around">
                    {categoriesRight.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-smooth px-2 py-1 rounded-xl",
                                category === cat.id ? "text-emerald-600" : "text-muted-foreground"
                            )}
                        >
                            <cat.icon className={cn("w-5 h-5", category === cat.id && "animate-pulse-soft")} />
                            <span className="text-[8px] font-bold uppercase tracking-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
