'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookMarked,
  BookOpen,
  Sparkles,
  Download,
  Share2,
  Users,
  Smartphone,
  Instagram,
  ArrowDown,
  CheckCircle2,
  Moon,
  Mail,
  MessageSquare,
  Rocket,
  Star,
  MessageCircle,
  HelpCircle,
  Search,
  Library,
  GraduationCap,
  Play,
  Maximize,
  Volume2,
} from 'lucide-react';
import { searchHadiths, DetailedHadith } from '@/lib/hadith-search';
import { generateExplanation } from '@/ai/flows/generate-hadith';
import { Hadiths } from '@/lib/hadiths';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ThemeToggle } from '@/components/ThemeToggle';
import dynamic from 'next/dynamic';

// Import dynamique du générateur
const GeneratorPage = dynamic(() => import('@/components/GeneratorPage'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement du générateur...</p>
    </div>
  ),
});

export default function LandingPage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Chatbot states
  const [chatQuery, setChatQuery] = useState('');
  const [chatResults, setChatResults] = useState<DetailedHadith[]>([]);
  const [isSearchingChat, setIsSearchingChat] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Student Explanation Mode
  const [explanation, setExplanation] = useState<{ id: number, text: string } | null>(null);
  const [isExplaining, setIsExplaining] = useState<number | null>(null);

  const handleChatSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatQuery.length < 3) return;

    setIsSearchingChat(true);
    try {
      const results = await searchHadiths(chatQuery);
      setChatResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error("Chat search error:", error);
    } finally {
      setIsSearchingChat(false);
    }
  };

  const handleExplain = async (hadith: DetailedHadith, index: number) => {
    if (explanation?.id === index) {
      setExplanation(null);
      return;
    }

    setIsExplaining(index);
    try {
      const text = await generateExplanation(hadith.french, hadith.source);
      setExplanation({ id: index, text });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: "L'explication n'a pas pu être générée.",
        variant: "destructive"
      });
    } finally {
      setIsExplaining(null);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      createdAt: serverTimestamp(),
    };

    try {
      const { firestore } = initializeFirebase();
      await addDoc(collection(firestore, 'contacts'), data);

      toast({
        title: "Message envoyé !",
        description: "Merci pour votre retour, nous vous répondrons dès que possible.",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  const scrollToApp = () => {
    setShowGenerator(true);
    setTimeout(() => {
      document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUseHadith = (content: string) => {
    // On met à jour l'URL pour que GeneratorPage le récupère via searchParams
    const url = new URL(window.location.href);
    url.searchParams.set('topic', content);
    url.searchParams.set('category', 'recherche-ia');
    window.history.pushState({}, '', url);

    scrollToApp();
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background bg-islamic-pattern overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
              alt="HikmaClips"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-hikma-gradient">HikmaClips</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={scrollToApp} variant="outline" className="hidden sm:flex">
              Essayer gratuitement
            </Button>
            <Button onClick={scrollToApp} className="bg-gradient-to-r from-primary to-accent">
              Lancer l'app
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Diffusion de rappels islamiques
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-arabic text-primary/40 leading-relaxed dir-rtl mb-2">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Partagez des{' '}
              <span className="text-hikma-gradient">clips islamiques</span>
              {' '}inspirants en quelques clics
            </h1>

            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Versets coraniques, hadiths authentiques et rappels bénéfiques.
              Des visuels professionnels prêts à partager sur vos réseaux sociaux.
            </p>
            <p className="text-lg text-primary/80 italic mb-8">
              "Le rappel profite aux croyants"
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={scrollToApp}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Essayer maintenant
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Télécharger Android
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-b from-primary/20 to-accent/20 rounded-3xl p-8 max-w-md mx-auto">
              <div className="bg-neutral-900 p-3 rounded-[32px] shadow-2xl">
                <div className="relative h-[400px] w-full rounded-[24px] overflow-hidden bg-black">
                  <Image
                    src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400"
                    alt="Preview"
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="text-white text-lg font-bold leading-relaxed">
                        "Et quiconque craint Allah, Il lui donnera une issue favorable"
                      </p>
                      <p className="text-white/70 text-sm mt-4 italic">— Sourate At-Talaq, 2 —</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white/50 text-xs tracking-widest">@HIKMACLIPS</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <button
              onClick={scrollToApp}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Défiler vers le bas"
            >
              <ArrowDown className="h-8 w-8 animate-bounce mx-auto" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Agent Hikma - Chatbot Search Section */}
      <section className="py-24 px-4 bg-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700/50 border border-purple-600 text-purple-100 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                Agent Interactif
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                "Vous vous rappelez d'un Hadith mais <span className="text-purple-400">pas de la suite ?</span>"
              </h2>
              <p className="text-purple-100/80 text-lg leading-relaxed italic">
                "Vous vous rappelez d'un Hadith ou n'avez que le début ? Je peux vous aider à le retrouver parmi les milliers de paroles prophétiques."
              </p>

              <form onSubmit={handleChatSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <Input
                    placeholder="Tapez le début du hadith ou un thème..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    className="pl-11 h-12 bg-purple-700/30 border-purple-600/50 text-white placeholder:text-purple-400/50 rounded-xl focus-visible:ring-purple-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 bg-purple-500 hover:bg-purple-400 text-purple-900 font-bold rounded-xl"
                  disabled={isSearchingChat}
                >
                  {isSearchingChat ? <span className="animate-spin h-5 w-5 border-2 border-purple-900 border-t-transparent rounded-full" /> : "Chercher"}
                </Button>
              </form>

              <AnimatePresence>
                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-purple-300 font-medium px-1">
                      <span>{chatResults.length} hadith(s) trouvé(s)</span>
                      <button onClick={() => setHasSearched(false)} className="hover:text-white underline text-xs">Fermer</button>
                    </div>
                    <ScrollArea className="h-64 rounded-xl border border-purple-600/50 bg-purple-700/20">
                      <div className="p-4 space-y-4">
                        {chatResults.length === 0 ? (
                          <div className="text-center py-8 px-4 space-y-4">
                            <div className="opacity-40">
                              <HelpCircle className="h-12 w-12 mx-auto mb-2" />
                            </div>
                            <p className="text-sm italic text-purple-100/90 leading-relaxed">
                              "Je n'ai pas trouvé ce hadith dans ma base de données actuelle. Allahu A'lam."
                            </p>
                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-3">
                              <p className="text-purple-300 font-bold uppercase tracking-wider">Conseil de l'Agent :</p>
                              <p className="text-purple-200/80 leading-relaxed">
                                Pour les recherches complexes ou les points de jurisprudence, je vous invite à vous rapprocher des gens de science fiables et des plateformes reconnues comme :
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {['3ilmchar3i', 'La Voie Droite', 'La Science Légiférée'].map(site => (
                                  <span key={site} className="px-2 py-1 bg-purple-700/50 rounded text-purple-400 font-medium">
                                    {site}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          chatResults.map((r, i) => (
                            <div key={i} className="p-3 bg-purple-700/40 rounded-lg border border-purple-600/30">
                              <p className="text-sm italic text-purple-50 leading-relaxed mb-2">"{r.french}"</p>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 p-0 px-2 text-[9px] hover:bg-purple-600 text-purple-300"
                                  onClick={() => handleExplain(r, i)}
                                  disabled={isExplaining === i}
                                >
                                  {isExplaining === i ? (
                                    <span className="animate-spin h-3 w-3 border-2 border-purple-300 border-t-transparent rounded-full" />
                                  ) : (
                                    explanation?.id === i ? "Masquer explication" : "Expliquer (Étudiant)"
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 p-0 px-2 text-[9px] hover:bg-purple-600 text-purple-300 border border-purple-600/50"
                                  onClick={() => handleUseHadith(r.french)}
                                >
                                  Utiliser ce Hadith
                                </Button>
                              </div>
                              {explanation?.id === i && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 p-3 bg-purple-900/50 rounded-lg border border-purple-500/20"
                                >
                                  <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Explication Pédagogique</span>
                                  </div>
                                  <p className="text-xs text-purple-100/90 leading-relaxed whitespace-pre-wrap font-serif">
                                    {explanation.text}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block w-72 h-72 relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full" />
              <div className="relative z-10 w-full h-full border border-purple-400/20 rounded-3xl bg-purple-700/20 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center border-t-purple-400/40 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
                  alt="Assistant"
                  width={80}
                  height={80}
                  className="rounded-2xl mb-6 shadow-2xl relative z-10 ring-2 ring-purple-400/30"
                />
                <h3 className="text-xl font-bold mb-2 relative z-10">L'Agent Hikma</h3>
                <p className="text-sm text-purple-200/70 italic relative z-10 leading-relaxed">
                  "Au service de l'étudiant en quête de vérité et de sagesse."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources for Students of Knowledge Section - SPIRITUAL TONE */}
      <section className="py-24 px-4 bg-background border-t border-b overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Library className="h-96 w-96 -rotate-12" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <GraduationCap className="h-4 w-4" />
                Talabul 'Ilm — Quête de Science
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold font-display leading-tight text-foreground">
                Une Bibliothèque pour les <span className="text-hikma-gradient font-extrabold">Cheminants</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Le Prophète <span className="text-foreground font-semibold italic">(ﷺ)</span> a dit : <span className="italic">"Celui qui emprunte un chemin par lequel il recherche une science, Allah lui facilite un chemin vers le Paradis."</span>
                </p>
                <p>
                  HikmaClips n'est pas qu'un outil de diffusion, c'est un <span className="font-bold text-foreground">compagnon d'étude</span>. Notre base de données regroupe l'intégralité des 6 grands Sahihs et Sunans, ainsi que le Muwatta.
                </p>
                <p>
                  Que vous soyez un <span className="text-primary font-medium">étudiant débutant</span> cherchant à confirmer un verset, ou plus <span className="text-primary font-medium">confirmé</span> ayant besoin de références précises pour vos cours, cet espace est le vôtre.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 transition-colors hover:bg-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Library className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground">9 Livres Majeurs</h4>
                  <p className="text-sm opacity-80">Sihah et Sunan accessibles intégralement en français.</p>
                </div>
                <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 space-y-3 transition-colors hover:bg-accent/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground">Vérification des Sources</h4>
                  <p className="text-sm opacity-80">Garantissez l'authenticité de chaque parole partagée.</p>
                </div>
              </div>

              <Link href="/ressources">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 mt-6 bg-hikma-gradient hover:scale-[1.02] active:scale-95 transition-all gap-3 text-lg font-bold shadow-hikma shadow-primary/20">
                  Explorer la Bibliothèque
                  <ArrowDown className="h-5 w-5 -rotate-90" />
                </Button>
              </Link>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4 relative">
              <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full" />
              {/* Decorative Book Cards */}
              <div className="space-y-4 pt-12">
                <div className="p-8 rounded-[2rem] bg-background shadow-2xl border border-border/50 transition-all hover:-translate-y-2 hover:border-primary/30">
                  <div className="h-2 w-12 bg-primary/20 rounded-full mb-4" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Authentique</span>
                  <h3 className="text-2xl font-black mt-2">Al-Bukhari</h3>
                  <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">"Le plus haut degré d'authenticité après le Coran."</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-background shadow-2xl border border-border/50 transition-all hover:-translate-y-2 hover:border-purple-500/30">
                  <div className="h-2 w-12 bg-purple-500/20 rounded-full mb-4" />
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">Sunan</span>
                  <h3 className="text-2xl font-black mt-2">Abu Dawud</h3>
                  <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">"La quintessence des règles et de la jurisprudence."</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-8 rounded-[2rem] bg-background shadow-2xl border border-border/50 transition-all hover:-translate-y-2 hover:border-primary/30">
                  <div className="h-2 w-12 bg-primary/20 rounded-full mb-4" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Authentique</span>
                  <h3 className="text-2xl font-black mt-2">Muslim</h3>
                  <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">"Une organisation et une précision sans égal."</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-background shadow-2xl border border-border/50 transition-all hover:-translate-y-2 hover:border-amber-600/30">
                  <div className="h-2 w-12 bg-amber-600/20 rounded-full mb-4" />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em]">Héritage</span>
                  <h3 className="text-2xl font-black mt-2">Muwatta</h3>
                  <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">"La sagesse de l'Imam de la cité prophétique."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce qu'il vous faut pour{' '}
              <span className="text-hikma-gradient">inspirer</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              HikmaClips simplifie la diffusion de la Da'wah islamique de manière simple et rapide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookMarked,
                title: 'Versets Coraniques',
                description: 'Accédez à des versets authentiques avec traduction française',
              },
              {
                icon: BookOpen,
                title: 'Hadiths Vérifiés',
                description: 'Hadiths issus des recueils authentiques (Bukhari, Muslim...)',
              },
              {
                icon: Moon,
                title: 'Rappels Bénéfiques',
                description: 'Le rappel profite aux croyants - sagesse islamique',
              },
              {
                icon: Download,
                title: 'Export HD',
                description: 'Images haute qualité optimisées pour les réseaux sociaux',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pour qui est{' '}
              <span className="text-hikma-gradient">HikmaClips</span> ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: 'Prédicateurs',
                description: 'Un outil simple pour diffuser vos rappels au plus grand nombre',
              },
              {
                icon: Users,
                title: 'Associations & Mosquées',
                description: 'Communication visuelle pour vos événements et rappels',
              },
              {
                icon: Share2,
                title: 'Particuliers',
                description: 'Partagez la sagesse islamique avec vos proches',
              },
              {
                icon: Sparkles,
                title: 'Enseignants',
                description: 'Supports visuels pour vos cours et conférences',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HikmaClips Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi choisir HikmaClips ?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              'Contenu islamique authentique et vérifié',
              'Interface simple et intuitive',
              'Génération par l\'Agent Hikma pour des thèmes personnalisés',
              'Export haute qualité pour tous les réseaux',
              'Gratuit avec possibilité de compte premium',
              '100% développé avec respect des valeurs islamiques',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Feedback Links */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div className="p-8 bg-background rounded-3xl border border-primary/10 hover:border-primary/30 transition-all group">
              <Rocket className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Quoi de neuf ?</h3>
              <p className="text-muted-foreground mb-6">Découvrez nos dernières mises à jour et les futures fonctionnalités prévues.</p>
              <Link href="/updates">
                <Button variant="outline" className="rounded-xl">Voir les nouveautés</Button>
              </Link>
            </div>
            <div className="p-8 bg-background rounded-3xl border border-accent/10 hover:border-accent/30 transition-all group">
              <MessageCircle className="h-10 w-10 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Votre avis</h3>
              <p className="text-muted-foreground mb-6">Aidez-nous à faire de HikmaClips un meilleur outil pour la communauté.</p>
              <Link href="/feedback">
                <Button variant="outline" className="rounded-xl border-accent/50 text-accent hover:bg-accent/5">Donner mon avis</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* App Section - Embedded Generator */}
      <section id="app-section" className="py-20 px-4 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto">
          {!showGenerator ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Essayez maintenant</h2>
                <p className="text-muted-foreground">Générez votre premier visuel en quelques secondes</p>
              </div>
              <div className="text-center py-12 bg-background rounded-2xl border-2 border-dashed border-primary/20">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-4">Prêt à diffuser un rappel ?</p>
                <Button onClick={() => setShowGenerator(true)} size="lg" className="bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Lancer le générateur
                </Button>
              </div>
            </>
          ) : (
            <GeneratorPage />
          )}
        </div>
      </section>

      {/* Contact & Feedback Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Votre avis compte</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Une suggestion ? Un commentaire ? Ou simplement envie de devenir testeur ?
                N'hésitez pas à nous contacter, nous lisons chaque message avec attention.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-background rounded-xl border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email de contact</p>
                    <p className="font-semibold">elmalkidigital@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="votre@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input id="subject" name="subject" placeholder="Ex: Devenir testeur, Bug..." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Dites-nous tout..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        Envoi en cours...
                      </div>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Collaboration Section for Preachers */}
      <section className="py-24 px-4 bg-islamic-pattern relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card/50 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12 lg:p-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-bold tracking-tight uppercase">Appel à la Collaboration</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Chers <span className="text-primary italic">Prédicateurs et Étudiants</span>, unissons nos efforts
                </h2>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  Salamu alaykum chers frères dans la foi. HikmaClips a été conçu pour multiplier l'impact de vos rappels.
                  Nous vous proposons une collaboration fraternelle pour faciliter la diffusion de la science utile à notre communauté.
                </p>

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    onClick={() => {
                      const subject = encodeURIComponent("Demande de Collaboration - HikmaClips");
                      const body = encodeURIComponent("As-salamu alaykum l'équipe HikmaClips,\n\nJe suis prédicateur/étudiant et je souhaiterais discuter d'une collaboration pour diffuser mes rappels via votre plateforme.");
                      window.location.href = `mailto:contact@hikmaclips.fr?subject=${subject}&body=${body}`;
                    }}
                  >
                    Demander une collaboration
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="relative aspect-[9/16] md:h-[600px] bg-black group rounded-r-[2.5rem] md:rounded-l-none overflow-hidden ring-1 ring-primary/10 shadow-inner">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={() => setIsMuted(!isMuted)}
                  poster="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.jpg"
                >
                  <source src="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 rounded-full bg-black/40 border-none backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                  >
                    {isMuted ? <Volume2 className="h-5 w-5 opacity-50" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 rounded-full bg-black/40 border-none backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Arabesque */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none translate-x-1/2 -translate-y-1/2">
          <Image
            src="https://www.transparenttextures.com/patterns/arabesque.png"
            alt="Decoration"
            fill
            className="object-contain"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-12 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/dhjwimevi/image/upload/v1770072891/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_edeg9a.png"
                alt="HikmaClips"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-hikma-gradient">HikmaClips</span>
              <span className="text-muted-foreground text-sm">v1.0.5</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} HikmaClips · Partagé par{' '}
              <a
                href="http://web-linecreator.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                web-linecreator.fr
              </a>
              {' '}· Meknès, Maroc
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
