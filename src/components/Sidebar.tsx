import React from 'react';
import {
    Settings,
} from 'lucide-react';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { SidebarContent } from './SidebarContent';

interface SidebarProps {
    topic: string;
    setTopic: (t: string) => void;
    onRandomBackground: () => void;
    onUploadClick: () => void;
    user: any;
    onSignIn: () => void;
    onSignOut: () => void;
    onShare?: () => void;
    // Studio Specific Props (Optional)
    isStudio?: boolean;
    format?: 'story' | 'square';
    setFormat?: (f: 'story' | 'square') => void;
    textTheme?: 'gradient' | 'white';
    setTextTheme?: (t: 'gradient' | 'white') => void;
    fontFamily?: 'roboto' | 'playfair' | 'amiri' | 'naskh';
    setFontFamily?: (f: 'roboto' | 'playfair' | 'amiri' | 'naskh') => void;
    fontSize?: number;
    setFontSize?: (s: number) => void;
}

export function Sidebar(props: SidebarProps) {
    return (
        <SheetContent side="left" className="w-[300px] sm:w-[400px] sidebar-glass overflow-y-auto custom-scrollbar">
            <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold text-hikma-gradient flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    Menu & Paramètres
                </SheetTitle>
                <SheetDescription>
                    Gérez votre profil et personnalisez votre création.
                </SheetDescription>
            </SheetHeader>

            <SidebarContent {...props} />
        </SheetContent>
    );
}
