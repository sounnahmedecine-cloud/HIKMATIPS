import React from 'react';
import {
    Home,
    User,
    Settings,
    Sparkles,
    Upload,
    Palette,
    RectangleVertical,
    RectangleHorizontal,
    Share2,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
    topic: string;
    setTopic: (t: string) => void;
    onRandomBackground: () => void;
    onUploadClick: () => void;
    user: any;
    onSignIn: () => void;
    onSignOut: () => void;
    onShare?: () => void;
    isStudio?: boolean;
    format?: 'story' | 'square';
    setFormat?: (f: 'story' | 'square') => void;
    fontFamily?: 'roboto' | 'playfair' | 'amiri' | 'naskh';
    setFontFamily?: (f: 'roboto' | 'playfair' | 'amiri' | 'naskh') => void;
    fontSize?: number;
    setFontSize?: (s: number) => void;
    textTheme?: 'light' | 'dark' | 'glass';
    setTextTheme?: (t: 'light' | 'dark' | 'glass') => void;
}

const fontFamilies: Record<string, { name: string; style: string; label: string }> = {
    roboto: { name: 'Roboto', style: "'Roboto', sans-serif", label: 'Moderne' },
    playfair: { name: 'Playfair Display', style: "'Playfair Display', serif", label: 'Élégante' },
    amiri: { name: 'Amiri', style: "'Amiri', serif", label: 'Calligraphie' },
    naskh: { name: 'Noto Naskh Arabic', style: "'Noto Naskh Arabic', serif", label: 'Orientale' },
};

export function FontSettings({ fontFamily, setFontFamily, fontSize, setFontSize, isMobile = false }: {
    fontFamily?: string,
    setFontFamily?: (f: any) => void,
    fontSize?: number,
    setFontSize?: (s: number) => void,
    isMobile?: boolean
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className={cn("text-[10px] uppercase tracking-widest font-bold", isMobile ? "text-gray-500" : "text-muted-foreground")}>Police</Label>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(fontFamilies) as [string, typeof fontFamilies[string]][]).map(([key, font]) => (
                        <Button
                            key={key}
                            variant={fontFamily === key ? 'default' : 'outline'}
                            size="sm"
                            className={cn("h-11 rounded-xl text-xs", isMobile && fontFamily !== key && "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900")}
                            onClick={() => setFontFamily?.(key as any)}
                            style={{ fontFamily: font.style }}
                        >
                            {font.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center pr-2">
                    <Label className={cn("text-[10px] uppercase tracking-widest font-bold", isMobile ? "text-gray-500" : "text-muted-foreground")}>Taille du Texte</Label>
                    <span className="text-xs font-bold text-primary">{fontSize}px</span>
                </div>
                <Slider
                    value={[fontSize || 21]}
                    onValueChange={(v) => setFontSize?.(v[0])}
                    min={16}
                    max={42}
                    step={1}
                    className="py-2"
                />
            </div>
        </div>
    );
}

export function FormatSettings({ format, setFormat, isMobile = false }: { format?: string, setFormat?: (f: any) => void, isMobile?: boolean }) {
    return (
        <div className="space-y-3">
            <Label className={cn("text-[10px] uppercase tracking-widest font-bold", isMobile ? "text-gray-500" : "text-muted-foreground")}>Format & Style</Label>
            <RadioGroup
                value={format}
                className="grid grid-cols-2 gap-2"
                onValueChange={(v) => setFormat?.(v as 'story' | 'square')}
            >
                <Label htmlFor="sb-story" className={cn("flex items-center justify-center p-3 rounded-xl border-2 hover:bg-muted peer-data-[state=checked]:border-primary transition-smooth cursor-pointer text-xs font-bold", isMobile ? "border-gray-200 text-gray-700" : "border-muted")}>
                    <RadioGroupItem value="story" id="sb-story" className="sr-only" />
                    <RectangleVertical className="w-4 h-4 mr-2" /> Story
                </Label>
                <Label htmlFor="sb-square" className={cn("flex items-center justify-center p-3 rounded-xl border-2 hover:bg-muted peer-data-[state=checked]:border-primary transition-smooth cursor-pointer text-xs font-bold", isMobile ? "border-gray-200 text-gray-700" : "border-muted")}>
                    <RadioGroupItem value="square" id="sb-square" className="sr-only" />
                    <RectangleHorizontal className="w-4 h-4 mr-2" /> Carré
                </Label>
            </RadioGroup>
        </div>
    );
}

export function ThemeSettings({ textTheme, setTextTheme, isMobile = false }: {
    textTheme?: string,
    setTextTheme?: (t: any) => void,
    isMobile?: boolean
}) {
    const themes = [
        { id: 'light', label: 'Clair' },
        { id: 'dark', label: 'Sombre' },
        { id: 'glass', label: 'Verre' },
    ];

    return (
        <div className="space-y-3">
            <Label className={cn("text-[10px] uppercase tracking-widest font-bold", isMobile ? "text-gray-500" : "text-muted-foreground")}>Thème du Texte</Label>
            <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                    <Button
                        key={t.id}
                        variant={textTheme === t.id ? 'default' : 'outline'}
                        size="sm"
                        className={cn("h-11 rounded-xl text-xs", isMobile && textTheme !== t.id && "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900")}
                        onClick={() => setTextTheme?.(t.id as any)}
                    >
                        {t.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export function SidebarContent({
    topic,
    setTopic,
    onRandomBackground,
    onUploadClick,
    user,
    onSignIn,
    onSignOut,
    onShare,
    isStudio = false,
    format,
    setFormat,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    textTheme,
    setTextTheme,
    isMobile = false,
    hideRedundant = false
}: SidebarContentProps & { isMobile?: boolean, hideRedundant?: boolean }) {
    return (
        <div className="space-y-6 pb-10 px-2">
            {/* Essential Links - Compact */}
            <div className="flex items-center justify-around bg-muted/30 rounded-2xl p-1 border border-border/50">
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={() => window.location.href = '/'}>
                    <Home className="w-5 h-5 text-primary" />
                </Button>
                {user ? (
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={onSignOut}>
                        <User className="w-5 h-5 text-primary" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={onSignIn}>
                        <User className="w-5 h-5" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={() => window.location.href = '/ressources'}>
                    <BookOpen className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl" onClick={() => window.location.href = '/parametres'}>
                    <Settings className="w-5 h-5" />
                </Button>
            </div>

            {/* Studio Controls */}
            {isStudio && (
                <div className="space-y-6 pt-2">
                    {!hideRedundant && <FormatSettings format={format} setFormat={setFormat} isMobile={isMobile} />}
                    {!hideRedundant && <FontSettings
                        fontFamily={fontFamily}
                        setFontFamily={setFontFamily}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        isMobile={isMobile}
                    />}
                    <ThemeSettings textTheme={textTheme} setTextTheme={setTextTheme} isMobile={isMobile} />
                </div>
            )}

            {/* Background Control */}
            <div className="space-y-3 pt-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Arrière-plan</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={onRandomBackground} className="h-11 rounded-xl gap-2 text-xs font-bold">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Aléatoire
                    </Button>
                    <Button variant="outline" size="sm" onClick={onUploadClick} className="h-11 rounded-xl gap-2 text-xs font-bold">
                        <Upload className="w-4 h-4 text-primary" />
                        Importer
                    </Button>
                </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-3 pt-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Thème pour l'Agent Hikma</Label>
                <Textarea
                    placeholder="Ex: La patience..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="resize-none h-24 bg-muted/20 rounded-2xl border-none focus-visible:ring-primary h-20 text-xs p-4"
                />
            </div>

            {/* Prominent Share Button */}
            <Button
                variant="default"
                size="lg"
                className="w-full rounded-2xl h-14 font-bold gap-3 shadow-hikma transition-all active:scale-95 group"
                onClick={onShare}
            >
                <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5 text-white" />
                </div>
                Partager l'image
            </Button>

            <p className="text-[10px] text-muted-foreground text-center italic opacity-50 pt-2">
                "Le rappel profite aux croyants"
            </p>
        </div>
    );
}
