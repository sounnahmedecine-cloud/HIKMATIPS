'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Sparkles,
  Loader2,
  Copy,
  CopyCheck,
  Share2,
  Heart,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  History,
  X,
  ArrowLeft,
  ShieldCheck,
  Bot,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn, toggleFavorite, getFavorites } from '@/lib/utils';
import {
  searchHadithAgent,
  explainHadith,
  type HadithSearchResult,
  type AgentSearchResponse,
} from '@/ai/flows/search-hadith-agent';
import { Share } from '@capacitor/share';
import Link from 'next/link';
import { HikmaAppDock } from '@/components/HikmaAppDock';

// ─── Quick suggestions ────────────────────────────────────────────
const SUGGESTIONS = [
  { label: 'Les actions ne valent que par...', query: 'Les actions ne valent que par les intentions' },
  { label: 'Celui qui croit en Allah et au...', query: 'Celui qui croit en Allah et au Jour Dernier' },
  { label: 'Le fort n\'est pas celui qui...', query: 'Le fort n\'est pas celui qui terrasse' },
  { label: 'Nul d\'entre vous ne sera...', query: 'Nul d\'entre vous ne sera véritablement croyant' },
  { label: 'La pudeur fait partie de la...', query: 'La pudeur fait partie de la foi' },
  { label: 'Celui qui emprunte un chemin...', query: 'Celui qui emprunte un chemin à la recherche d\'une science' },
  { label: 'Les meilleurs d\'entre vous...', query: 'Les meilleurs d\'entre vous sont ceux qui' },
  { label: 'La purification est la moitié...', query: 'La purification est la moitié de la foi' },
  { label: 'Allah est Beau et Il aime...', query: 'Allah est Beau et Il aime la beauté' },
  { label: 'Ne te mets pas en colère', query: 'Ne te mets pas en colère' },
];

// ─── Helpers ──────────────────────────────────────────────────────

function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('hikma_hadith_search_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hikma_hadith_search_history', JSON.stringify(history.slice(0, 20)));
  } catch { /* ignore */ }
}

// ─── Result Card Component ───────────────────────────────────────

function ResultCard({
  result,
  index,
  onExplain,
  isExplaining,
  favorites,
  onToggleFavorite,
}: {
  result: HadithSearchResult;
  index: number;
  onExplain: (result: HadithSearchResult) => void;
  isExplaining: boolean;
  favorites: string[];
  onToggleFavorite: (text: string, source: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const isLiked = favorites.includes(result.hadithComplet);
  const isLong = result.hadithComplet.length > 300;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${result.hadithComplet}\n\n— ${result.source}`
    );
    setCopiedId(`result-${index}`);
    toast({ title: 'Copié !', description: 'Hadith copié dans le presse-papier.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Hadith — HikmaClips',
        text: `"${result.hadithComplet}"\n\n— ${result.source}`,
      });
    } catch { /* user cancelled */ }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.hadithComplet);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const displayText = isLong && !isExpanded
    ? result.hadithComplet.substring(0, 280) + '...'
    : result.hadithComplet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card className="group relative overflow-hidden rounded-[20px] border border-[#ECE8DF] bg-white shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)] transition-shadow hover:shadow-[0_14px_30px_-10px_rgba(16,61,36,0.24)]">
        {/* Fiability badge */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
              result.fiabilite === 'authentique'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
            )}
          >
            {result.fiabilite === 'authentique' ? (
              <><ShieldCheck className="w-3 h-3" /> Base authentique</>
            ) : (
              <><Bot className="w-3 h-3" /> Vérifié par l&apos;Agent</>
            )}
          </span>
        </div>

        <CardContent className="p-6 pt-12 space-y-4">
          {/* Arabic text */}
          {result.textArabe && (
            <p
              className="text-right text-xl leading-loose text-[#15703A] [font-family:Amiri,serif]"
              dir="rtl"
            >
              {result.textArabe}
            </p>
          )}

          {/* French text */}
          <p className="text-[15px] font-medium leading-relaxed text-[#333F38]">
            {displayText}
          </p>

          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary/70 hover:text-primary font-semibold flex items-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Lire la suite</>
              )}
            </button>
          )}

          {/* Source & meta */}
          <div className="flex items-center gap-3 border-t border-[#F0ECE3] pt-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] shadow-md shadow-emerald-500/20">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-extrabold tracking-[0.15em] text-slate-400 truncate">
                {result.source}
              </p>
              <p className="text-[9px] text-slate-400/70 font-medium">{result.livre}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-2">
            <button
              onClick={handleCopy}
              className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
              title="Copier"
            >
              {copiedId === `result-${index}` ? (
                <CopyCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="rounded-xl p-2.5 text-[#9AA39B] transition-all hover:bg-[#E8F5EC] hover:text-[#2E9E44] active:scale-90"
              title="Partager"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleSpeak}
              className={cn(
                'p-2.5 rounded-xl transition-all active:scale-90',
                isSpeaking
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              )}
              title={isSpeaking ? "Arrêter" : "Écouter"}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onToggleFavorite(result.hadithComplet, result.source)}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
              title="Favori"
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
            </button>

            <div className="flex-1" />

            {/* Explain button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl text-[11px] font-bold gap-1.5 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all"
              onClick={() => onExplain(result)}
              disabled={isExplaining}
            >
              {isExplaining ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
              Expliquer
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────

export default function RechercheHadithsPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<AgentSearchResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<{ text: string; source: string } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainTarget, setExplainTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load history & favorites on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setSearchHistory(loadSearchHistory());
    setFavorites(getFavorites().map((f: any) => f.fr));
  }, []);

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (q.length < 3) {
        toast({ title: 'Trop court', description: 'Entrez au moins 3 caractères.', variant: 'destructive' });
        return;
      }

      setIsSearching(true);
      setExplanation(null);
      setExplainTarget(null);

      try {
        const result = await searchHadithAgent(q);
        setResponse(result);

        // Update history
        const newHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 20);
        setSearchHistory(newHistory);
        saveSearchHistory(newHistory);
      } catch (error) {
        toast({ title: 'Erreur', description: "La recherche a échoué. Réessayez.", variant: 'destructive' });
      } finally {
        setIsSearching(false);
      }
    },
    [query, searchHistory, toast]
  );

  const handleExplain = useCallback(
    async (result: HadithSearchResult) => {
      setIsExplaining(true);
      setExplainTarget(result.hadithComplet);
      setExplanation(null);

      try {
        const text = await explainHadith(result.hadithComplet, result.source);
        setExplanation({ text, source: result.source });
      } catch {
        toast({ title: 'Erreur', description: "Impossible de générer l'explication.", variant: 'destructive' });
      } finally {
        setIsExplaining(false);
      }
    },
    [toast]
  );

  const handleToggleFavorite = useCallback(
    (text: string, source: string) => {
      const isLiked = toggleFavorite({ fr: text, source, arabe: '' });
      setFavorites(prev => (isLiked ? [...prev, text] : prev.filter(f => f !== text)));
      toast({
        title: isLiked ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris',
      });
    },
    [toast]
  );

  const handleSuggestionClick = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    handleSearch(suggestionQuery);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    handleSearch(historyQuery);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
    setShowHistory(false);
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      {/* ─── Header ─── */}
      <header className="relative h-[184px] overflow-hidden bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 pt-[max(2.5rem,env(safe-area-inset-top))] text-white">
        <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-[54px]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <Link href="/generateur" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Retour aux clips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn('relative grid h-8 w-8 place-items-center rounded-full', showHistory ? 'bg-white text-[#15703A]' : 'bg-white/10 text-white hover:bg-white/20')}
              aria-label="Historique"
            >
              <History className="h-4 w-4" />
              {searchHistory.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#F5960F] text-[8px] font-bold text-white">{searchHistory.length}</span>}
            </button>
          </div>
          <h1 className="mt-3 text-[26px] font-bold tracking-[-0.6px] [font-family:var(--font-display)]">Agent Hadith</h1>
          <p className="mt-1 text-xs font-medium text-white/80">6 recueils authentiques · ~32 400 hadiths</p>
        </div>
      </header>

      <main className="relative mx-auto -mt-[30px] min-h-[calc(100vh-154px)] max-w-3xl rounded-t-[30px] bg-[#FBFAF7] px-4 pb-32 pt-0">

      {/* ─── Search Bar ─── */}
      <div className="relative z-10 mb-1 -translate-y-1/2">
        <div className="group relative">
          <div className="absolute -inset-1 rounded-2xl bg-[#2E9E44]/15 opacity-0 blur-lg transition-opacity group-focus-within:opacity-100" />
          <div className="relative flex items-center rounded-2xl border border-[#ECE8DF] bg-white shadow-[0_14px_30px_-10px_rgba(16,61,36,0.25)] focus-within:border-[#2E9E44]">
            <Search className="ml-4 h-5 w-5 shrink-0 text-[#9AA39B]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder='Tapez le début d&apos;un hadith...'
              className="h-14 flex-1 border-none bg-transparent px-3 text-sm text-[#26302B] outline-none placeholder:text-[#B7BEB8]"
              id="hadith-search-input"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-2 mr-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              onClick={() => handleSearch()}
              disabled={isSearching || query.trim().length < 3}
              className="mr-2 h-10 rounded-xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 font-bold text-white shadow-[0_8px_18px_rgba(46,158,68,0.30)] transition-all active:scale-95 disabled:opacity-50"
              id="hadith-search-button"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── History Dropdown ─── */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-none shadow-lg rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Historique récent
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-red-400 hover:text-red-500 font-semibold transition-colors"
                  >
                    Effacer tout
                  </button>
                </div>
                {searchHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-3 py-2.5 transition-colors flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Suggestions (when no results yet) ─── */}
      {!response && !isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 px-1">
            Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                onClick={() => handleSuggestionClick(s.query)}
                className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>

          {/* Info cards */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            <Card className="border-none shadow-md rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    6 Recueils Authentiques
                  </p>
                  <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5 leading-relaxed">
                    Bukhari, Muslim, Abu Dawud, Nasa&apos;i, Ibn Majah, Malik
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ─── Loading State ─── */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <div className="relative">
              <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] shadow-lg shadow-emerald-500/30">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                L&apos;Agent analyse les recueils...
              </p>
              <p className="text-[11px] text-slate-400">
                Recherche dans ~32 400 hadiths authentiques
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Results ─── */}
      {response && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Results header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {response.totalFound} résultat{response.totalFound > 1 ? 's' : ''}
              </span>
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  response.searchMethod === 'local'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : response.searchMethod === 'ai'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                )}
              >
                {response.searchMethod === 'local'
                  ? 'Base locale'
                  : response.searchMethod === 'ai'
                  ? 'Agent IA'
                  : 'Local + IA'}
              </span>
            </div>
            <button
              onClick={() => {
                setResponse(null);
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Nouvelle recherche
            </button>
          </div>

          {/* Results list */}
          {response.results.length === 0 ? (
            <Card className="border-none shadow-md rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-8 text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500">Aucun hadith trouvé pour cette recherche.</p>
                <p className="text-xs text-slate-400">
                  Essayez avec d&apos;autres mots-clés ou un fragment plus long.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {response.results.map((result, i) => (
                <ResultCard
                  key={i}
                  result={result}
                  index={i}
                  onExplain={handleExplain}
                  isExplaining={isExplaining && explainTarget === result.hadithComplet}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Explanation Panel ─── */}
      <AnimatePresence>
        {(explanation || isExplaining) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 safe-pb-20"
          >
            <Card className="max-w-3xl mx-auto border-none shadow-2xl rounded-t-3xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)]">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      Mode Étudiant
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setExplanation(null);
                      setExplainTarget(null);
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <ScrollArea className="max-h-[50vh]">
                  {isExplaining ? (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-[#2E9E44]" />
                      <span className="text-sm text-slate-500">L&apos;Agent prépare l&apos;explication...</span>
                    </div>
                  ) : explanation ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                      <div dangerouslySetInnerHTML={{
                        __html: explanation.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                  ) : null}
                </ScrollArea>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
      <HikmaAppDock active="search" />
    </div>
  );
}
