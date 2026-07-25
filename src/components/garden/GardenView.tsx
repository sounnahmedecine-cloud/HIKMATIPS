'use client';

import { useEffect, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { MobileDrawer } from '@/components/studio/MobileDrawer';
import { getGardenState, getStageInfo, getStageCount, setGardenName, type GardenState } from '@/lib/garden';

interface GardenViewProps {
    isOpen: boolean;
    onClose: () => void;
}

const IDLE_MESSAGES = [
    'Ta lumière t’attend, en paix.',
    'Rien ne se perd ici — reviens quand tu veux.',
];

export function GardenView({ isOpen, onClose }: GardenViewProps) {
    const [state, setState] = useState<GardenState | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');

    useEffect(() => {
        if (isOpen) setState(getGardenState());
    }, [isOpen]);

    const stage = state?.stage ?? 0;
    const info = getStageInfo(stage);
    const stageCount = getStageCount();
    const idleMessage = IDLE_MESSAGES[stage % IDLE_MESSAGES.length];

    const startEditing = () => {
        setNameDraft(state?.name ?? '');
        setIsEditingName(true);
    };

    const confirmName = () => {
        const updated = setGardenName(nameDraft);
        setState(updated);
        setIsEditingName(false);
    };

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

                <div className="text-center space-y-1 w-full">
                    {isEditingName ? (
                        <div className="flex items-center justify-center gap-2">
                            <input
                                autoFocus
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') confirmName(); }}
                                maxLength={24}
                                placeholder="Nom de ta graine..."
                                className="h-10 rounded-xl border border-[#ECE8DF] bg-white px-3 text-center text-sm outline-none focus:border-[#2E9E44]"
                            />
                            <button onClick={confirmName} className="grid h-10 w-10 place-items-center rounded-xl bg-[#2E9E44] text-white">
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={startEditing} className="flex items-center justify-center gap-1.5 mx-auto text-lg font-bold text-gray-900">
                            {state?.name ?? info.label}
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#2E9E44]">{info.label}</p>
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
