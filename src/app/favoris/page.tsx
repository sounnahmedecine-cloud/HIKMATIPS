'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Share2, Trash2 } from 'lucide-react';
import { getFavorites, toggleFavorite, type Hikma } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { HikmaAppDock } from '@/components/HikmaAppDock';
import { HikmaLibraryHeader } from '@/components/HikmaLibraryHeader';

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<Hikma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    setFavorites(getFavorites());
    setIsLoading(false);
  }, []);

  const handleRemove = (hikma: Hikma) => {
    toggleFavorite(hikma);
    setFavorites(getFavorites());
  };

  const handleShare = async (hikma: Hikma) => {
    const text = `${hikma.fr}\n— ${hikma.source}\n\nvia HikmaClips`;
    if (navigator.share) await navigator.share({ title: 'Sagesse Islamique', text });
    else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copié !', description: 'La citation a été copiée.' });
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      <HikmaLibraryHeader active="favorites" />

      <main className="relative mx-auto -mt-4 min-h-[calc(100vh-158px)] max-w-2xl rounded-t-[30px] bg-[#FBFAF7] px-4 pb-32 pt-7">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9AA39B]">
          {favorites.length} pépite{favorites.length === 1 ? '' : 's'} enregistrée{favorites.length === 1 ? '' : 's'}
        </p>

        {isLoading && (
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-[20px]" />)}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading && favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 rounded-[20px] border-2 border-dashed border-[#DCD8CE] px-6 py-16 text-center"
            >
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#E8F5EC] text-[#2E9E44]">
                <Bookmark className="h-6 w-6" />
              </span>
              <p className="font-bold">Aucun favori pour le moment</p>
              <p className="mt-1 text-sm text-[#7A857D]">Les rappels aimés apparaîtront ici.</p>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {favorites.map((hikma, index) => (
                <motion.article
                  key={hikma.fr}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.035 }}
                  className="rounded-[20px] border border-[#ECE8DF] bg-white p-4 shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)]"
                >
                  {hikma.arabe && (
                    <p dir="rtl" className="mb-2 text-right text-[19px] leading-[1.8] text-[#15703A] [font-family:Amiri,serif]">
                      {hikma.arabe}
                    </p>
                  )}
                  <p className="text-[13px] font-medium leading-[1.55] text-[#333F38]">{hikma.fr}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-[#F0ECE3] pt-3">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#B96C05]">{hikma.source}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleShare(hikma)}
                        aria-label="Partager"
                        className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#F5F1E8] text-[#7A857D] hover:text-[#15703A]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(hikma)}
                        aria-label="Retirer des favoris"
                        className="grid h-8 w-8 place-items-center rounded-[10px] bg-red-50 text-red-400 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      <HikmaAppDock active="library" />
    </div>
  );
}
