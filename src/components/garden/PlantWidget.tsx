'use client';

import { useEffect, useState } from 'react';
import { getGardenState, getStageInfo, GARDEN_GROW_EVENT, type GardenGrowEvent } from '@/lib/garden';
import { ConfettiBurst } from './ConfettiBurst';

interface PlantWidgetProps {
    id?: string;
    onClick: () => void;
}

export function PlantWidget({ id, onClick }: PlantWidgetProps) {
    const [stage, setStage] = useState<number | null>(null);
    const [pulse, setPulse] = useState(false);
    const [burstKey, setBurstKey] = useState(0);

    useEffect(() => {
        setStage(getGardenState().stage);

        const onGrow = (e: Event) => {
            const detail = (e as CustomEvent<GardenGrowEvent>).detail;
            setStage(detail.state.stage);
            setBurstKey((k) => k + 1);
            setPulse(true);
            window.setTimeout(() => setPulse(false), 1200);
        };

        window.addEventListener(GARDEN_GROW_EVENT, onGrow);
        return () => window.removeEventListener(GARDEN_GROW_EVENT, onGrow);
    }, []);

    if (stage === null) return null;

    const info = getStageInfo(stage);

    return (
        <button
            id={id}
            onClick={onClick}
            aria-label="Ton jardin"
            className="relative w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 shadow-lg flex items-center justify-center overflow-visible"
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
            <ConfettiBurst triggerKey={burstKey} />
        </button>
    );
}
