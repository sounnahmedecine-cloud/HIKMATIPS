'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import { getCollections, createCollection, deleteCollection, removeFromCollection, type Collection } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { HikmaAppDock } from '@/components/HikmaAppDock';
import { HikmaLibraryHeader } from '@/components/HikmaLibraryHeader';

const EMOJIS = ['📚', '🌙', '⭐', '🕌', '🤲', '💎', '🌿', '🔥', '✨', '❤️'];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    setCollections(getCollections());
    setIsLoading(false);
  }, []);

  const refresh = () => {
    const all = getCollections();
    setCollections(all);
    if (selectedCollection) setSelectedCollection(all.find((item) => item.id === selectedCollection.id) || null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const collectionName = newName.trim();
    createCollection(collectionName, newEmoji);
    setNewName('');
    setNewEmoji('📚');
    setShowCreate(false);
    refresh();
    toast({ title: 'Collection créée !', description: `« ${collectionName} » est prête.` });
  };

  const handleDelete = (id: string, name: string) => {
    deleteCollection(id);
    if (selectedCollection?.id === id) setSelectedCollection(null);
    refresh();
    toast({ title: 'Collection supprimée', description: `« ${name} » a été supprimée.` });
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      <HikmaLibraryHeader
        active="collections"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-[11px] font-bold text-[#B96C05] shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Nouvelle
          </button>
        }
      />

      <main className="relative mx-auto -mt-4 min-h-[calc(100vh-158px)] max-w-2xl rounded-t-[30px] bg-[#FBFAF7] px-4 pb-32 pt-7">
        {selectedCollection ? (
          <section>
            <button
              onClick={() => setSelectedCollection(null)}
              className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-[#2E9E44]"
            >
              <ChevronLeft className="h-4 w-4" /> Toutes les collections
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#E8F5EC] text-2xl">{selectedCollection.emoji}</div>
              <div>
                <h2 className="text-xl font-bold [font-family:var(--font-display)]">{selectedCollection.name}</h2>
                <p className="text-xs text-[#9AA39B]">{selectedCollection.items.length} hikma{selectedCollection.items.length === 1 ? '' : 's'}</p>
              </div>
            </div>

            {selectedCollection.items.length === 0 ? (
              <div className="rounded-[20px] border-2 border-dashed border-[#DCD8CE] px-6 py-14 text-center">
                <FolderOpen className="mx-auto mb-3 h-8 w-8 text-[#B7BEB8]" />
                <p className="font-bold">Cette collection est vide</p>
                <p className="mt-1 text-sm text-[#9AA39B]">Ajoutez des hikmas depuis l’écran Clips.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {selectedCollection.items.map((hikma, index) => (
                  <motion.article
                    key={hikma.fr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                    className="rounded-[20px] border border-[#ECE8DF] bg-white p-4 shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)]"
                  >
                    {hikma.arabe && <p dir="rtl" className="mb-2 text-right text-lg text-[#15703A] [font-family:Amiri,serif]">{hikma.arabe}</p>}
                    <p className="text-[13px] font-medium leading-relaxed text-[#333F38]">{hikma.fr}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[#F0ECE3] pt-3">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#B96C05]">{hikma.source}</span>
                      <button
                        onClick={() => {
                          removeFromCollection(selectedCollection.id, hikma.fr);
                          refresh();
                        }}
                        aria-label="Retirer de la collection"
                        className="grid h-8 w-8 place-items-center rounded-[10px] bg-red-50 text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9AA39B]">Collections thématiques</p>

            {isLoading && (
              <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-[20px]" />)}</div>
            )}

            <AnimatePresence mode="popLayout">
              {!isLoading && collections.length === 0 ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowCreate(true)}
                  className="w-full rounded-[20px] border-2 border-dashed border-[#DCD8CE] px-6 py-14 text-center"
                >
                  <FolderOpen className="mx-auto mb-3 h-9 w-9 text-[#B7BEB8]" />
                  <p className="font-bold">Créer une première collection</p>
                  <p className="mt-1 text-sm text-[#9AA39B]">Regroupez vos rappels par thème.</p>
                </motion.button>
              ) : (
                <div className="grid gap-3">
                  {collections.map((collection, index) => (
                    <motion.article
                      key={collection.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: index * 0.04 }}
                      className="group flex cursor-pointer items-center gap-3 rounded-[20px] border border-[#ECE8DF] bg-white p-3.5 shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)]"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] bg-[#E8F5EC] text-2xl">{collection.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{collection.name}</p>
                        <p className="mt-0.5 text-[11px] text-[#9AA39B]">{collection.items.length} hikma{collection.items.length === 1 ? '' : 's'}</p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(collection.id, collection.name);
                        }}
                        aria-label={`Supprimer ${collection.name}`}
                        className="grid h-8 w-8 place-items-center rounded-[10px] text-[#C4CBC5] opacity-60 hover:bg-red-50 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-[#C4CBC5]" />
                    </motion.article>
                  ))}
                  <button
                    onClick={() => setShowCreate(true)}
                    className="rounded-[20px] border-2 border-dashed border-[#DCD8CE] py-4 text-[11px] font-semibold text-[#9AA39B] hover:border-[#2E9E44]/40 hover:text-[#2E9E44]"
                  >
                    + Créer une collection thématique
                  </button>
                </div>
              )}
            </AnimatePresence>
          </section>
        )}
      </main>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end bg-[#061009]/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.section
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full rounded-t-[30px] bg-[#FBFAF7] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#DED9CF]" />
              <div className="mx-auto max-w-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold [font-family:var(--font-display)]">Nouvelle collection</h2>
                  <button onClick={() => setShowCreate(false)} className="grid h-8 w-8 place-items-center rounded-full bg-[#F0ECE3] text-[#7A857D]" aria-label="Fermer"><X className="h-4 w-4" /></button>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewEmoji(emoji)}
                      className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${newEmoji === emoji ? 'bg-[#E8F5EC] ring-2 ring-[#2E9E44]' : 'bg-white'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
                  placeholder="Nom de la collection"
                  className="h-12 w-full rounded-[14px] border border-[#ECE8DF] bg-white px-4 text-sm outline-none focus:border-[#2E9E44]"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="mt-4 h-13 w-full rounded-[16px] bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] py-3.5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(46,158,68,0.35)] disabled:opacity-40"
                >
                  Créer la collection
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <HikmaAppDock active="library" />
    </div>
  );
}
