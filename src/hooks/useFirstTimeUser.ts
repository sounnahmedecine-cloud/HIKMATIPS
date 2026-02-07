'use client';

import { useState, useEffect } from 'react';

export function useFirstTimeUser() {
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user has completed onboarding and if they've generated content before
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        const hasGeneratedBefore = localStorage.getItem('hasGeneratedContent');

        if (hasSeenOnboarding && !hasGeneratedBefore) {
            setIsFirstTime(true);
        }

        setIsLoading(false);
    }, []);

    const markAsGenerated = () => {
        localStorage.setItem('hasGeneratedContent', 'true');
        setHasGenerated(true);
        setIsFirstTime(false);
    };

    const resetFirstTime = () => {
        localStorage.removeItem('hasGeneratedContent');
        setIsFirstTime(true);
        setHasGenerated(false);
    };

    return {
        isFirstTime,
        hasGenerated,
        isLoading,
        markAsGenerated,
        resetFirstTime,
    };
}
