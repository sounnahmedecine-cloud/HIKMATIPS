'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MobileDrawer } from './studio/MobileDrawer';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Type, Sun, Contrast, AtSign, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignToolsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        brightness: number;
        contrast: number;
        fontFamily: string;
        showSignature: boolean;
        signatureText: string;
    };
    setFilters: (filters: any) => void;
}

const FONTS = [
    { name: 'Apple Default', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { name: 'Amiri (Arabe)', value: "'Amiri', serif" },
    { name: 'Inter', value: 'var(--font-inter)' },
    { name: 'Serif', value: 'serif' },
    { name: 'Mono', value: 'monospace' },
];

export function DesignToolsDrawer({ isOpen, onClose, filters, setFilters }: DesignToolsDrawerProps) {
    const updateFilter = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <MobileDrawer isOpen={isOpen} onClose={onClose} title="Outils de Design">
            <div className="space-y-8 py-4">
                {/* Filters Section */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4 text-emerald-600" />
                                <Label className="text-sm font-bold">Luminosité</Label>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{filters.brightness}%</span>
                        </div>
                        <Slider
                            value={[filters.brightness]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={([val]) => updateFilter('brightness', val)}
                            className="py-2"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Contrast className="w-4 h-4 text-emerald-600" />
                                <Label className="text-sm font-bold">Contraste</Label>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{filters.contrast}%</span>
                        </div>
                        <Slider
                            value={[filters.contrast]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={([val]) => updateFilter('contrast', val)}
                            className="py-2"
                        />
                    </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Typography Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-emerald-600" />
                        <Label className="text-sm font-bold">Typographie</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {FONTS.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => updateFilter('fontFamily', font.value)}
                                className={cn(
                                    "px-3 py-2 text-xs rounded-xl border transition-all truncate",
                                    filters.fontFamily === font.value
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                        : "bg-muted/30 border-border hover:bg-muted/50"
                                )}
                                style={{ fontFamily: font.value }}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* TikTok Signature Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AtSign className="w-4 h-4 text-emerald-600" />
                            <Label className="text-sm font-bold">Signature TikTok</Label>
                        </div>
                        <Switch
                            checked={filters.showSignature}
                            onCheckedChange={(val) => updateFilter('showSignature', val)}
                        />
                    </div>

                    <AnimatePresence>
                        {filters.showSignature && (
                            <div className="relative animate-in slide-in-from-top-1 duration-200">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={filters.signatureText}
                                    onChange={(e) => updateFilter('signatureText', e.target.value)}
                                    placeholder="votre_boutique_tiktok"
                                    className="pl-10 h-11 rounded-xl bg-muted/30 border-border focus-visible:ring-emerald-600"
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </MobileDrawer>
    );
}
