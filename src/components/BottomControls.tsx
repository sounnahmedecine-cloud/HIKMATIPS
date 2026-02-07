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
    Wand2,
    Library,
    Download
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
    onDownload?: () => void;
    onRessources?: () => void;
}

export function BottomControls({
    category,
    setCategory,
    onGenerate,
    isGenerating,
    onRandom,
    onUpload,
    onDownload,
    onRessources
}: BottomControlsProps) {
    const categoriesLeft = [
        { id: 'hadith', icon: BookOpen, label: 'Hadith', color: 'text-blue-600' },
        { id: 'coran', icon: BookMarked, label: 'Coran', color: 'text-emerald-600' },
    ] as const;

    const categoriesRight = [
        { id: 'ramadan', icon: Moon, label: 'Ramadan', color: 'text-purple-600' },
        { id: 'recherche-ia', icon: Search, label: 'Agent', color: 'text-orange-600' },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom px-4 pb-4">
            <div className="max-w-md mx-auto relative flex items-center justify-between bg-emerald-50/95 backdrop-blur-xl border border-emerald-100 rounded-3xl p-2 shadow-2xl h-20">
                {/* Left Categories */}
                <div className="flex-1 flex justify-around">
                    <button
                        onClick={onRessources}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-smooth px-2 py-1"
                        id="btn-sources"
                    >
                        <Library className="w-7 h-7" />
                        <span className="text-[8px] font-bold uppercase tracking-tight">Sources</span>
                    </button>
                    {categoriesLeft.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-smooth px-2 py-1 rounded-xl",
                                category === cat.id ? cat.color : "text-muted-foreground"
                            )}
                            id={`btn-category-${cat.id}`}
                        >
                            <cat.icon className={cn("w-7 h-7", category === cat.id && "animate-pulse-soft")} />
                            <span className="text-[8px] font-bold uppercase tracking-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Central Action Area (Dock) */}
                <div className="relative flex items-center justify-center -mt-12 px-2">
                    {/* Random Button (Left Satellite) */}
                    <div className="hidden sm:block">
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
                                id="btn-random-bg"
                            >
                                <ImageIcon className="w-6 h-6 text-primary" />
                            </Button>
                        </motion.div>
                    </div>

                    {/* Main Generate Button */}
                    <div className="flex-shrink-0 z-10 flex flex-col items-center gap-1" id="btn-generate-container">
                        <Button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="w-20 h-20 rounded-full shadow-hikma bg-emerald-800 hover:bg-emerald-900 active:scale-95 transition-all duration-300 border-4 border-background"
                            size="icon"
                            id="btn-generate"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-10 h-10 animate-spin" />
                            ) : (
                                <Sparkles className="w-10 h-10 text-white fill-white/20" />
                            )}
                        </Button>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">Générer</span>
                    </div>

                    {/* Upload Button (Right Satellite) */}
                    <div className="hidden sm:block">
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
                                id="btn-upload-bg"
                            >
                                <Upload className="w-6 h-6 text-primary" />
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Right Categories */}
                <div className="flex-1 flex justify-around">
                    {categoriesRight.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-smooth px-2 py-1 rounded-xl",
                                category === cat.id ? cat.color : "text-muted-foreground"
                            )}
                            id={`btn-category-${cat.id}`}
                        >
                            <cat.icon className={cn("w-7 h-7", category === cat.id && "animate-pulse-soft")} />
                            <span className="text-[8px] font-bold uppercase tracking-tight">{cat.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={onDownload}
                        className="flex flex-col items-center gap-1 text-teal-600 hover:text-emerald-600 transition-smooth px-2 py-1"
                        id="btn-download"
                    >
                        <Download className="w-7 h-7 font-bold" />
                        <span className="text-[8px] font-bold uppercase tracking-tight">Sauver</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
