// src/components/quran/QuranAudioContext.tsx

'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { type Surah, SURAHS } from '@/lib/quran-data';

interface Reciter {
  id: string;
  name: string;
  urlPrefix: string;
}

const RECITERS: Reciter[] = [
  { id: 'maher', name: 'Al-Muaiqly', urlPrefix: 'https://server12.mp3quran.net/maher' },
  { id: 'shatri', name: 'Al-Shatri', urlPrefix: 'https://server11.mp3quran.net/shatri' },
  { id: 'a_jabr', name: 'Ali Jaber', urlPrefix: 'https://server11.mp3quran.net/a_jabr' },
  { id: 'sudais', name: 'Al-Sudais', urlPrefix: 'https://server11.mp3quran.net/a_sds' },
];

interface QuranAudioContextState {
  selectedSurah: Surah | null;
  setSelectedSurah: (s: Surah) => void;
  selectedReciter: Reciter;
  setSelectedReciter: (r: Reciter) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  progress: number;
  duration: number;
  seek: (seconds: number) => void;
  next: () => void;
  prev: () => void;
  reciters: Reciter[];
}

const QuranAudioContext = createContext<QuranAudioContextState | undefined>(undefined);

export const QuranAudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load new source when surah or reciter changes
  useEffect(() => {
    if (selectedSurah && audioRef.current) {
      const surahId = selectedSurah.id.toString().padStart(3, '0');
      const src = `${selectedReciter.urlPrefix}/${surahId}.mp3`;
      if (audioRef.current.src !== src) {
        audioRef.current.src = src;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  }, [selectedSurah, selectedReciter]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  const next = () => {
    if (selectedSurah && selectedSurah.id < 114) {
      const nextSurah = SURAHS.find(s => s.id === selectedSurah.id + 1);
      if (nextSurah) setSelectedSurah(nextSurah);
    }
  };

  const prev = () => {
    if (selectedSurah && selectedSurah.id > 1) {
      const prevSurah = SURAHS.find(s => s.id === selectedSurah.id - 1);
      if (prevSurah) setSelectedSurah(prevSurah);
    }
  };

  // when a track ends, automatically go to next
  const handleEnded = () => next();

  return (
    <QuranAudioContext.Provider
      value={{
        selectedSurah,
        setSelectedSurah,
        selectedReciter,
        setSelectedReciter,
        isPlaying,
        togglePlay,
        progress,
        duration,
        seek,
        next,
        prev,
        reciters: RECITERS,
      }}
    >
      {children}
      {/* Hidden audio element that lives for the whole app */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </QuranAudioContext.Provider>
  );
};

export const useQuranAudio = () => {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error('useQuranAudio must be used within QuranAudioProvider');
  return ctx;
};
