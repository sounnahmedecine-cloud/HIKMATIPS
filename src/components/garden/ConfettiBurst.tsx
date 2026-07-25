'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ConfettiBurstProps {
    triggerKey: number;
}

const COLORS = ['#2E9E44', '#F5960F', '#FFD27A', '#15703A', '#FFFFFF'];

export function ConfettiBurst({ triggerKey }: ConfettiBurstProps) {
    const particles = useMemo(() => {
        return Array.from({ length: 10 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
            const distance = 22 + Math.random() * 18;
            return {
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                color: COLORS[i % COLORS.length],
                rotate: Math.random() * 360,
                size: 3 + Math.random() * 3,
            };
        });
    }, [triggerKey]);

    if (triggerKey === 0) return null;

    return (
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
            {particles.map((p) => (
                <motion.span
                    key={`${triggerKey}-${p.id}`}
                    className="absolute left-1/2 top-1/2 rounded-sm"
                    style={{ width: p.size, height: p.size, backgroundColor: p.color }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.6 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}
