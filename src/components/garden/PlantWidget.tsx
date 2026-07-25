'use client';

import { useEffect, useState } from 'react';
import { getGardenState, getStageInfo } from '@/lib/garden';

interface PlantWidgetProps {
    onClick: () => void;
    pulse?: boolean;
}

export function PlantWidget({ onClick, pulse }: PlantWidgetProps) {
    const [stage, setStage] = useState<number | null>(null);

    useEffect(() => {
        setStage(getGardenState().stage);
    }, []);

    if (stage === null) return null;

    const info = getStageInfo(stage);

    return (
        <button
            onClick={onClick}
            aria-label="Ton jardin"
            className="relative w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 shadow-lg flex items-center justify-center overflow-hidden"
        >
            {pulse && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
            )}
            <img
                src={info.assetPath}
                alt={info.label}
                className="w-6 h-6 object-contain relative"
                style={{ imageRendering: 'pixelated' }}
            />
        </button>
    );
}
