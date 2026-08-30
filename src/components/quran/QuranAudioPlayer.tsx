'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SurahList } from './SurahList';
import { type Surah, SURAHS } from '@/lib/quran-data';
import { logEvent } from '@/lib/analytics';

const RECITERS = [
  { id: 'maher', name: 'Al-Muaiqly', urlPrefix: 'https://server12.mp3quran.net/maher' },
  { id: 'shatri', name: 'Al-Shatri', urlPrefix: 'https://server11.mp3quran.net/shatri' },
  { id: 'a_jabr', name: 'Ali Jaber', urlPrefix: 'https://server11.mp3quran.net/a_jabr' },
  { id: 'sudais', name: 'Al-Sudais', urlPrefix: 'https://server11.mp3quran.net/a_sds' },
];

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function QuranAudioPlayer() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isListVisible, setIsListVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (selectedSurah && audioRef.current) {
      const surahIdStr = selectedSurah.id.toString().padStart(3, '0');
      const url = `${selectedReciter.urlPrefix}/${surahIdStr}.mp3`;
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  }, [selectedSurah, selectedReciter]);

  const handlePlayPause = () => {
    if (!audioRef.current || !selectedSurah) return;
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleNext = () => {
    if (selectedSurah && selectedSurah.id < 114) {
      const nextSurah = SURAHS.find(s => s.id === selectedSurah.id + 1);
      if (nextSurah) setSelectedSurah(nextSurah);
    }
  };

  const handlePrev = () => {
    if (selectedSurah && selectedSurah.id > 1) {
      const prevSurah = SURAHS.find(s => s.id === selectedSurah.id - 1);
      if (prevSurah) setSelectedSurah(prevSurah);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Player Section */}
      <div className="rounded-[32px] bg-white p-6 shadow-[0_14px_32px_rgba(16,61,36,0.05)] border border-[#ECE8DF] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#15703A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Cover / Icon */}
          <div className="h-24 w-24 rounded-[24px] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] grid place-items-center mb-6 shadow-lg shadow-[#2E9E44]/20">
            <span className="text-4xl text-white font-arabic [font-family:var(--font-arabic,serif)]">
              {selectedSurah ? selectedSurah.nameArabic : '📖'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#1E2922] text-center">
            {selectedSurah ? selectedSurah.nameFr : 'Sélectionnez une sourate'}
          </h2>
          <p className="text-sm text-[#7A857D] mt-1">
            {selectedSurah ? `${selectedSurah.versesCount} versets` : 'Aucune lecture en cours'}
          </p>

          {/* Progress Bar */}
          <div className="w-full mt-6 flex items-center gap-3">
            <span className="text-[11px] font-medium text-[#9AA39B] w-8 text-right">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              disabled={!selectedSurah}
              className="flex-1 h-1.5 rounded-full appearance-none bg-[#E0E6E1] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#2E9E44] [&::-webkit-slider-thumb]:rounded-full cursor-pointer accent-[#2E9E44]"
            />
            <span className="text-[11px] font-medium text-[#9AA39B] w-8">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={handlePrev}
              disabled={!selectedSurah || selectedSurah.id === 1}
              className="text-[#9AA39B] hover:text-[#2E9E44] transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!selectedSurah}
              className="w-16 h-16 rounded-full bg-[#15703A] text-white grid place-items-center shadow-lg shadow-[#15703A]/30 transition-transform active:scale-95 disabled:opacity-50 hover:bg-[#2E9E44]"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedSurah || selectedSurah.id === 114}
              className="text-[#9AA39B] hover:text-[#2E9E44] transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="hidden"
        />
      </div>

      {/* Reciters Selection */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E2922] mb-3 px-2">Récitateur</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
          {RECITERS.map((reciter) => (
            <button
              key={reciter.id}
              onClick={() => setSelectedReciter(reciter)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors border",
                selectedReciter.id === reciter.id
                  ? "bg-[#2E9E44] text-white border-[#2E9E44] shadow-md shadow-[#2E9E44]/20"
                  : "bg-white text-[#5B6660] border-[#ECE8DF] hover:bg-[#FDFCFB]"
              )}
            >
              {reciter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Surah List */}
      <div className="mt-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-sm font-semibold text-[#1E2922]">Liste des Sourates</h3>
          <button
            onClick={() => setIsListVisible(!isListVisible)}
            className="text-[12px] font-medium text-[#2E9E44] hover:underline"
          >
            {isListVisible ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        {isListVisible && (
          <div className="-mx-4">
            <SurahList onSelectSurah={(surah) => {
              setSelectedSurah(surah);
              setIsPlaying(true);
              logEvent('play_surah', { surahId: surah.id, reciter: selectedReciter.id });
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
