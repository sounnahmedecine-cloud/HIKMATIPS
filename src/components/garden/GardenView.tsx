'use client';

import { useEffect, useState } from 'react';
import { MobileDrawer } from '@/components/studio/MobileDrawer';
import { getGardenState, getStageInfo, getStageCount, type GardenState } from '@/lib/garden';

interface GardenViewProps {
    isOpen: boolean;
    onClose: () => void;
}

const IDLE_MESSAGES = [
    'Ton jardin t’attend, en paix.',
    'Rien ne se perd ici — reviens quand tu veux.',
];

export function GardenView({ isOpen, onClose }: GardenViewProps) {
    const [state, setState] = useState<GardenState | null>(null);

    useEffect(() => {
        if (isOpen) setState(getGardenState());
    }, [isOpen]);

    const stage = state?.stage ?? 0;
    const info = getStageInfo(stage);
    const stageCount = getStageCount();
    const idleMessage = IDLE_MESSAGES[stage % IDLE_MESSAGES.length];

    return (
        <MobileDrawer isOpen={isOpen} onClose={onClose} title="Ton jardin">
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-full rounded-3xl bg-gradient-to-b from-emerald-50 to-amber-50 flex items-center justify-center py-10">
                    <img
                        src={info.assetPath}
                        alt={info.label}
                        className="max-h-56 w-auto object-contain"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>

                <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-gray-900">{info.label}</p>
                    <p className="text-sm text-muted-foreground">{idleMessage}</p>
                </div>

                <div className="flex items-center gap-2">
                    {Array.from({ length: stageCount }).map((_, i) => (
                        <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${i <= stage ? 'bg-emerald-500' : 'bg-emerald-100'}`}
                        />
                    ))}
                </div>
            </div>
        </MobileDrawer>
    );
}
