'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookMarked, BookOpen, Sparkles, Download, Share2, Users,
  Smartphone, CheckCircle2, Moon, Mail, MessageSquare,
  Star, Search, Library, GraduationCap, Play, Maximize,
  Volume2, ArrowRight, Zap, Shield, ImageIcon, ChevronRight,
  HelpCircle, Rocket, MessageCircle,
} from 'lucide-react';
import { searchHadiths, DetailedHadith } from '@/lib/hadith-search';
import { generateExplanation } from '@/ai/flows/generate-hadith';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] } }),
};

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [chatQuery, setChatQuery] = useState('');
  const [chatResults, setChatResults] = useState<DetailedHadith[]>([]);
  const [isSearchingChat, setIsSearchingChat] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [explanation, setExplanation] = useState<{ id: number; text: string } | null>(null);
  const [isExplaining, setIsExplaining] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
    else if ((videoRef.current as any).webkitRequestFullscreen) (videoRef.current as any).webkitRequestFullscreen();
  };

  const handleChatSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatQuery.length < 3) return;
    setIsSearchingChat(true);
    try {
      const results = await searchHadiths(chatQuery);
      setChatResults(results);
      setHasSearched(true);
    } catch {}
    finally { setIsSearchingChat(false); }
  };

  const handleExplain = async (hadith: DetailedHadith, index: number) => {
    if (explanation?.id === index) { setExplanation(null); return; }
    setIsExplaining(index);
    try {
      const text = await generateExplanation(hadith.french, hadith.source);
      setExplanation({ id: index, text });
    } catch {
      toast({ title: 'Erreur', description: "L'explication n'a pas pu être générée.", variant: 'destructive' });
    } finally { setIsExplaining(null); }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const { firestore } = initializeFirebase();
      await addDoc(collection(firestore, 'contacts'), {
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Message envoyé !', description: 'Merci, nous vous répondrons rapidement.' });
      (e.target as HTMLFormElement).reset();
    } catch {
      toast({ title: 'Erreur', description: "Une erreur est survenue. Veuillez réessayer.", variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const NAV_LINKS = [
    { label: 'Pourquoi', id: 'pourquoi' },
    { label: 'Pour qui', id: 'pour-qui' },
    { label: 'Comment', id: 'comment' },
    { label: 'Fonctionnalités', id: 'fonctionnalites' },
  ];

  const PROOF_ITEMS = [
    '✦ +10 000 clips générés', '✦ Hadiths authentiques', '✦ Export HD',
    '✦ 100% Gratuit', '✦ Agent IA intégré', '✦ 6 grandes collections islamiques',
    '✦ Interface mobile', '✦ Partage en 1 clic',
  ];

  return (
    <div className="min-h-screen bg-[#fefcf8] text-[#111827] overflow-x-hidden font-sans">

      {/* ───── NAV ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fefcf8]/90 backdrop-blur-md border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
              alt="HikmaClips" width={36} height={36} className="rounded-xl"
            />
            <span className="text-lg font-black tracking-tight text-[#111827]">HikmaClips</span>
          </div>

          {/* Nav links - desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className="text-sm font-semibold text-[#6b7280] hover:text-[#059669] transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
              className="hidden sm:flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-emerald-200 hover:shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              Télécharger
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="w-5 h-0.5 bg-[#111827] mb-1.5 rounded" />
              <div className="w-5 h-0.5 bg-[#111827] mb-1.5 rounded" />
              <div className="w-3 h-0.5 bg-[#111827] rounded" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-[#e5e7eb] bg-[#fefcf8] overflow-hidden">
              <div className="px-4 py-4 flex flex-col gap-4">
                {NAV_LINKS.map(l => (
                  <button key={l.id} onClick={() => scrollTo(l.id)}
                    className="text-left text-sm font-semibold text-[#6b7280]">{l.label}</button>
                ))}
                <button
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
                  className="flex items-center justify-center gap-2 bg-[#059669] text-white text-sm font-bold px-5 py-3 rounded-full">
                  <Smartphone className="w-4 h-4" /> Télécharger
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ───── HERO ───── */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              Application islamique mobile
            </div>

            <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-[#111827]">
              Partagez la sagesse islamique{' '}
              <span className="text-[#059669]">en quelques secondes</span>
            </h1>

            <p className="text-lg text-[#6b7280] leading-relaxed max-w-md">
              HikmaClips génère des visuels islamiques prêts à partager — versets coraniques, hadiths authentiques, invocations — en quelques clics, directement depuis votre téléphone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
                className="flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-200 text-base"
              >
                <Smartphone className="w-5 h-5" />
                Google Play Store
              </button>
              <a
                href="https://drive.google.com/file/d/1GYA5vctET6ekvrGbgsZM2a1D95MtPot3/view?usp=sharing"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-[#e5e7eb] hover:border-[#059669] hover:text-[#059669] text-[#374151] font-bold px-7 py-3.5 rounded-full transition-all text-base"
              >
                <Download className="w-5 h-5" />
                Télécharger l'APK
                <span className="text-xs font-normal opacity-60">v1.2.60</span>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {['🧕','👳','🧔','👩','🧑'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#d1fae5] border-2 border-white flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />)}
                </div>
                <p className="text-xs text-[#6b7280] mt-0.5">+500 utilisateurs dans la communauté</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone mockup */}
          <motion.div variants={fadeUp} custom={0.2} initial="hidden" animate="visible"
            className="flex justify-center relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-emerald-200 blur-[80px] opacity-30 rounded-full" />

            {/* Phone */}
            <div className="relative z-10" style={{ animation: 'float 4s ease-in-out infinite' }}>
              <div className="w-[260px] h-[520px] bg-[#0a0a0a] rounded-[40px] shadow-2xl border border-white/10 relative overflow-hidden"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0a0a0a] rounded-b-2xl z-20" />
                {/* Screen */}
                <div className="absolute inset-2 rounded-[34px] overflow-hidden bg-black">
                  <Image
                    src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400"
                    alt="App preview" fill className="object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-white/40 text-xs font-arabic mb-4 leading-relaxed">بِسْمِ ٱللَّٰهِ</p>
                    <p className="text-white text-sm font-bold leading-relaxed">
                      "Et rappelle, car le rappel profite aux croyants"
                    </p>
                    <p className="text-white/60 text-[10px] mt-3 italic">— Sourate Adh-Dhâriyât, 55 —</p>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase">@hikmaclips</p>
                  </div>
                </div>
                {/* Buttons */}
                <div className="absolute left-[-3px] top-28 w-1 h-8 bg-[#1f1f1f] rounded-l-sm" />
                <div className="absolute left-[-3px] top-40 w-1 h-12 bg-[#1f1f1f] rounded-l-sm" />
                <div className="absolute right-[-3px] top-36 w-1 h-14 bg-[#1f1f1f] rounded-r-sm" />
              </div>
            </div>

            {/* Floating badges */}
            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 -left-4 bg-white rounded-2xl shadow-lg border border-[#e5e7eb] px-3 py-2 flex items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-xl bg-[#d1fae5] flex items-center justify-center">
                <BookMarked className="w-4 h-4 text-[#059669]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#111827]">Coran</p>
                <p className="text-[9px] text-[#6b7280]">6 236 versets</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-12 -right-4 bg-white rounded-2xl shadow-lg border border-[#e5e7eb] px-3 py-2 flex items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-xl bg-[#fef3c7] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#111827]">Agent IA</p>
                <p className="text-[9px] text-[#6b7280]">Génération illimitée</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* ───── PROOF BAR (Barre Filament) ───── */}
      <div className="bg-[#059669] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 22s linear infinite' }}>
          {[...PROOF_ITEMS, ...PROOF_ITEMS].map((item, i) => (
            <span key={i} className="text-white text-sm font-semibold mx-10 shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ───── POURQUOI ───── */}
      <section id="pourquoi" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold uppercase tracking-widest mb-4">
              Pourquoi HikmaClips ?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] mb-4">
              La Da'wah mérite les meilleurs outils
            </h2>
            <p className="text-[#6b7280] max-w-xl mx-auto text-lg">
              Diffuser la sagesse islamique ne doit plus être complexe. HikmaClips rend cela simple, beau et authentique.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: 'bg-[#d1fae5]', iconColor: 'text-[#059669]',
                title: 'Contenu 100% authentifié',
                desc: 'Chaque hadith, verset et invocation provient de sources vérifiées. Bukhari, Muslim, les 6 grands Sihah — rien n\'est laissé au hasard.',
              },
              {
                icon: Zap,
                color: 'bg-[#fef3c7]', iconColor: 'text-[#f59e0b]',
                title: 'Génération en quelques secondes',
                desc: 'Fini les heures passées à chercher et mettre en page. Notre Agent IA génère des visuels percutants adaptés à votre thème en un clic.',
              },
              {
                icon: Share2,
                color: 'bg-[#ede9fe]', iconColor: 'text-[#7c3aed]',
                title: 'Optimisé pour les réseaux',
                desc: 'Export HD Instagram, Reels, Stories, WhatsApp. Des formats prêts à partager pour toucher votre communauté là où elle se trouve.',
              },
            ].map((c, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="p-8 rounded-[2rem] border border-[#e5e7eb] bg-[#fefcf8] hover:-translate-y-1 hover:shadow-xl hover:border-[#d1d5db] transition-all duration-300 h-full">
                  <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <c.icon className={`w-6 h-6 ${c.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-3">{c.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── POUR QUI ───── */}
      <section id="pour-qui" className="py-24 px-4 bg-[#fefcf8]">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-4">
              Pour qui ?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] mb-4">
              Une app pour toute la communauté
            </h2>
            <p className="text-[#6b7280] max-w-xl mx-auto text-lg">
              Que vous soyez prédicateur, enseignant, ou simplement croyant souhaitant diffuser la sagesse — HikmaClips est fait pour vous.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: '🎙️', title: 'Prédicateurs', desc: 'Amplifiez l\'impact de vos rappels en les transformant en visuels partageables instantanément.' },
              { emoji: '🕌', title: 'Associations & Mosquées', desc: 'Communication islamique professionnelle pour vos événements, Khutbas et campagnes de rappel.' },
              { emoji: '📖', title: 'Étudiants en sciences', desc: 'Explorez +30 000 hadiths, vérifiez les sources et partagez la science de manière pédagogique.' },
              { emoji: '🤲', title: 'Particuliers', desc: 'Partagez la sagesse islamique avec vos proches. Chaque rappel compte et profite aux croyants.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="p-6 rounded-[2rem] bg-white border border-[#e5e7eb] hover:-translate-y-1 hover:shadow-lg hover:border-[#d1fae5] transition-all duration-300 h-full">
                  <div className="text-3xl mb-4">{item.emoji}</div>
                  <h3 className="text-base font-bold text-[#111827] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── COMMENT ───── */}
      <section id="comment" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ede9fe] text-[#7c3aed] text-xs font-bold uppercase tracking-widest mb-4">
              Comment ça marche ?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] mb-4">
              3 étapes pour votre premier clip
            </h2>
            <p className="text-[#6b7280] max-w-xl mx-auto text-lg">
              De l'idée au partage en moins de 30 secondes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connector */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#d1fae5] to-transparent" />

            {[
              { step: '01', icon: BookOpen, title: 'Choisissez votre source', desc: 'Sélectionnez parmi Coran, Hadiths, Invocations, ou laissez l\'Agent IA choisir selon votre thème.' },
              { step: '02', icon: Sparkles, title: 'Générez votre visuel', desc: 'En 1 clic, un visuel islamique professionnel est créé avec le texte, la source et l\'image adaptée.' },
              { step: '03', icon: Share2, title: 'Partagez en 1 clic', desc: 'Téléchargez en HD ou partagez directement sur Instagram, WhatsApp, Reels et toutes vos plateformes.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.15} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="flex flex-col items-center text-center p-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-[#059669] flex items-center justify-center shadow-lg shadow-emerald-200">
                      <s.icon className="w-9 h-9 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#111827] text-white text-[10px] font-black flex items-center justify-center">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-3">{s.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FONCTIONNALITÉS ───── */}
      <section id="fonctionnalites" className="py-24 px-4 bg-[#fefcf8]">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold uppercase tracking-widest mb-4">
              Fonctionnalités
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] mb-4">
              Tout pour diffuser la Da'wah
            </h2>
            <p className="text-[#6b7280] max-w-xl mx-auto text-lg">
              HikmaClips concentre tout ce dont vous avez besoin dans une seule application mobile.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BookMarked, color: 'bg-[#d1fae5]', iconColor: 'text-[#059669]', title: 'Versets Coraniques', desc: '6 236 versets avec traduction française et texte arabe.' },
              { icon: BookOpen, color: 'bg-[#fef3c7]', iconColor: 'text-[#f59e0b]', title: 'Hadiths Authentiques', desc: 'Bukhari, Muslim, Nasa\'i, Abu Dawud, Ibn Majah, Muwatta.' },
              { icon: Moon, color: 'bg-[#ede9fe]', iconColor: 'text-[#7c3aed]', title: 'Rappels Ramadan', desc: 'Collection de rappels spéciaux pour le mois béni.' },
              { icon: Sparkles, color: 'bg-[#fee2e2]', iconColor: 'text-[#ef4444]', title: 'Agent Hikma IA', desc: 'Génération de contenu personnalisé selon votre thème avec Gemini.' },
              { icon: ImageIcon, color: 'bg-[#e0f2fe]', iconColor: 'text-[#0284c7]', title: 'Galerie de fonds', desc: 'Des dizaines d\'images islamiques, nature et abstraites en HD.' },
              { icon: Download, color: 'bg-[#d1fae5]', iconColor: 'text-[#059669]', title: 'Export HD', desc: 'Téléchargez vos clips en haute résolution pour tous les réseaux.' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.08} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="flex gap-4 p-6 rounded-[1.5rem] bg-white border border-[#e5e7eb] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 h-full items-start">
                  <div className={`shrink-0 w-11 h-11 ${f.color} rounded-xl flex items-center justify-center`}>
                    <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] mb-1">{f.title}</h3>
                    <p className="text-xs text-[#6b7280] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AGENT HIKMA (recherche hadith) ───── */}
      <section className="py-24 px-4 bg-[#111827] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Agent Hikma — IA
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Vous cherchez un hadith mais <span className="text-emerald-400">vous ne le retrouvez plus ?</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Tapez un mot-clé, un thème ou le début d'un hadith. Notre agent recherche parmi +30 000 hadiths traduits en français.
              </p>

              <form onSubmit={handleChatSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <input
                    placeholder="Ex: patience, famille, mort..."
                    value={chatQuery}
                    onChange={e => setChatQuery(e.target.value)}
                    className="w-full pl-11 h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <button type="submit" disabled={isSearchingChat}
                  className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors">
                  {isSearchingChat ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : 'Chercher'}
                </button>
              </form>

              <AnimatePresence>
                {hasSearched && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex justify-between text-xs text-emerald-400 font-medium">
                      <span>{chatResults.length} résultat(s)</span>
                      <button onClick={() => setHasSearched(false)} className="underline opacity-60 hover:opacity-100">Fermer</button>
                    </div>
                    <div className="h-60 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3 space-y-3 custom-scrollbar">
                      {chatResults.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm italic">Hadith non trouvé. Allahu A'lam.</p>
                        </div>
                      ) : chatResults.map((r, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-sm italic text-white/80 leading-relaxed mb-2">"{r.french}"</p>
                          <p className="text-[10px] text-emerald-400 mb-2">{r.source}</p>
                          <button onClick={() => handleExplain(r, i)} disabled={isExplaining === i}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold border border-emerald-700/50 px-2 py-1 rounded transition-colors">
                            {isExplaining === i ? '...' : explanation?.id === i ? 'Masquer' : 'Expliquer'}
                          </button>
                          {explanation?.id === i && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="mt-2 text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                              {explanation.text}
                            </motion.p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Agent card */}
            <motion.div variants={fadeUp} custom={0.2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="hidden lg:flex justify-center">
              <div className="w-64 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
                  alt="Agent Hikma" width={72} height={72} className="rounded-2xl mx-auto mb-5 ring-2 ring-emerald-500/30"
                />
                <h3 className="font-black text-lg mb-1">Agent Hikma</h3>
                <p className="text-white/50 text-xs italic leading-relaxed">
                  "Au service de l'étudiant en quête de vérité et de sagesse."
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En ligne
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── BIBLIOTHÈQUE ───── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef3c7] text-[#f59e0b] text-xs font-bold uppercase tracking-widest">
                <GraduationCap className="w-3.5 h-3.5" /> Talabul \'Ilm
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] leading-tight">
                Une bibliothèque islamique{' '}
                <span className="text-[#059669]">complète</span> à portée de main
              </h2>
              <p className="text-[#6b7280] text-lg leading-relaxed">
                Accédez à l'intégralité des 6 grands Sahihs et Sunans traduits en français. Vérifiez, recherchez et partagez avec confiance.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '9 recueils majeurs', color: 'bg-[#d1fae5]', text: 'text-[#059669]' },
                  { label: '+30 000 hadiths', color: 'bg-[#fef3c7]', text: 'text-[#f59e0b]' },
                  { label: 'Sources vérifiées', color: 'bg-[#ede9fe]', text: 'text-[#7c3aed]' },
                  { label: '100% en français', color: 'bg-[#fee2e2]', text: 'text-[#ef4444]' },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} p-4 rounded-2xl`}>
                    <p className={`text-sm font-bold ${s.text}`}>{s.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/ressources">
                <button className="flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white font-bold px-7 py-3.5 rounded-full transition-all text-sm mt-2">
                  Explorer la bibliothèque
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            {/* Book cards */}
            <motion.div variants={fadeUp} custom={0.2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 relative">
              <div className="absolute inset-0 bg-emerald-100 blur-[80px] opacity-40 rounded-full pointer-events-none" />
              <div className="space-y-4 pt-10">
                {[
                  { tag: 'Authentique', name: 'Al-Bukhari', color: 'bg-[#d1fae5]', text: 'text-[#059669]' },
                  { tag: 'Sunan', name: 'Abu Dawud', color: 'bg-[#fef3c7]', text: 'text-[#f59e0b]' },
                ].map((b, i) => (
                  <div key={i} className="p-6 rounded-[1.5rem] bg-[#fefcf8] shadow-lg border border-[#e5e7eb] hover:-translate-y-1 transition-transform">
                    <div className={`h-1.5 w-10 ${b.color} rounded-full mb-3`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${b.text}`}>{b.tag}</span>
                    <h3 className="text-xl font-black mt-1 text-[#111827]">{b.name}</h3>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { tag: 'Authentique', name: 'Muslim', color: 'bg-[#d1fae5]', text: 'text-[#059669]' },
                  { tag: 'Héritage', name: 'Muwatta', color: 'bg-[#fef3c7]', text: 'text-[#d97706]' },
                ].map((b, i) => (
                  <div key={i} className="p-6 rounded-[1.5rem] bg-[#fefcf8] shadow-lg border border-[#e5e7eb] hover:-translate-y-1 transition-transform">
                    <div className={`h-1.5 w-10 ${b.color} rounded-full mb-3`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${b.text}`}>{b.tag}</span>
                    <h3 className="text-xl font-black mt-1 text-[#111827]">{b.name}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── VIDEO + COLLAB ───── */}
      <section className="py-24 px-4 bg-[#fefcf8]">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[2.5rem] border border-[#e5e7eb] bg-white overflow-hidden shadow-xl grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ede9fe] text-[#7c3aed] text-xs font-bold uppercase tracking-widest">
                <Rocket className="w-3 h-3" /> Collaboration
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#111827] leading-tight">
                Prédicateurs & Étudiants,{' '}
                <span className="text-[#059669]">unissons nos efforts</span>
              </h2>
              <p className="text-[#6b7280] leading-relaxed">
                HikmaClips a été conçu pour amplifier votre impact. Nous proposons une collaboration fraternelle pour faciliter la diffusion de la science islamique.
              </p>
              <button
                onClick={() => {
                  const subject = encodeURIComponent("Demande de Collaboration - HikmaClips");
                  const body = encodeURIComponent("As-salamu alaykum l'équipe HikmaClips,\n\nJe souhaiterais discuter d'une collaboration.");
                  window.location.href = `mailto:elmalkidigital@gmail.com?subject=${subject}&body=${body}`;
                }}
                className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-3.5 rounded-full transition-all text-sm shadow-lg shadow-emerald-100"
              >
                <MessageSquare className="w-4 h-4" />
                Demander une collaboration
              </button>
            </div>

            <div className="relative aspect-[9/16] md:h-[500px] bg-black overflow-hidden group">
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                autoPlay loop muted={isMuted} playsInline onClick={() => setIsMuted(!isMuted)}
                poster="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.jpg">
                <source src="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <Volume2 className={`w-4 h-4 ${isMuted ? 'opacity-40' : ''}`} />
                </button>
                <button onClick={e => { e.stopPropagation(); toggleFullscreen(); }}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── UPDATES + FEEDBACK ───── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[2rem] border border-[#e5e7eb] bg-[#fefcf8] hover:border-[#d1fae5] hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Rocket className="w-5 h-5 text-[#059669]" />
            </div>
            <h3 className="text-lg font-black text-[#111827] mb-2">Quoi de neuf ?</h3>
            <p className="text-sm text-[#6b7280] mb-5">Découvrez nos dernières mises à jour et fonctionnalités à venir.</p>
            <Link href="/updates">
              <button className="flex items-center gap-1.5 text-sm font-bold text-[#059669] hover:gap-3 transition-all">
                Voir les nouveautés <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="p-8 rounded-[2rem] border border-[#e5e7eb] bg-[#fefcf8] hover:border-[#ede9fe] hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#ede9fe] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <h3 className="text-lg font-black text-[#111827] mb-2">Votre avis compte</h3>
            <p className="text-sm text-[#6b7280] mb-5">Aidez-nous à améliorer HikmaClips pour toute la communauté.</p>
            <Link href="/feedback">
              <button className="flex items-center gap-1.5 text-sm font-bold text-[#7c3aed] hover:gap-3 transition-all">
                Donner mon avis <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── DOWNLOAD CTA ───── */}
      <section className="py-24 px-4 bg-[#059669]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-7">
            <div className="text-white/70 text-sm font-bold uppercase tracking-[0.2em]">Téléchargement gratuit</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Commencez à diffuser la sagesse islamique aujourd'hui
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Rejoignez des centaines d'utilisateurs qui partagent la sagesse de l'Islam avec leurs proches chaque jour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
                className="flex items-center justify-center gap-2 bg-white text-[#059669] font-black px-8 py-4 rounded-full text-base hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg"
              >
                <Smartphone className="w-5 h-5" />
                Google Play Store
              </button>
              <a href="https://drive.google.com/file/d/1GYA5vctET6ekvrGbgsZM2a1D95MtPot3/view?usp=sharing"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-full text-base transition-all">
                <Download className="w-5 h-5" />
                Télécharger l'APK
              </a>
            </div>
            <p className="text-white/50 text-xs">Gratuit · Sans inscription · Disponible sur Android</p>
          </motion.div>
        </div>
      </section>

      {/* ───── CONTACT ───── */}
      <section className="py-24 px-4 bg-[#fefcf8]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold uppercase tracking-widest">
              Contact
            </div>
            <h2 className="text-3xl font-black text-[#111827]">Une question ? Un retour ?</h2>
            <p className="text-[#6b7280] leading-relaxed">
              Suggestion, bug, demande de collaboration ou envie de devenir testeur — nous lisons chaque message avec attention.
            </p>
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#e5e7eb]">
              <div className="w-11 h-11 rounded-xl bg-[#d1fae5] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Email de contact</p>
                <p className="font-bold text-[#111827] text-sm">elmalkidigital@gmail.com</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.15} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <form onSubmit={handleContactSubmit} className="bg-white rounded-[2rem] border border-[#e5e7eb] p-8 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold text-[#111827]">Email</Label>
                <Input id="email" name="email" type="email" placeholder="votre@email.com" required
                  className="border-[#e5e7eb] focus:border-[#059669] focus:ring-[#059669]/20 rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-bold text-[#111827]">Sujet</Label>
                <Input id="subject" name="subject" placeholder="Devenir testeur, Bug, Suggestion..." required
                  className="border-[#e5e7eb] focus:border-[#059669] rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-bold text-[#111827]">Message</Label>
                <Textarea id="message" name="message" placeholder="Dites-nous tout..." required
                  className="border-[#e5e7eb] focus:border-[#059669] rounded-xl min-h-[120px]" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><MessageSquare className="w-4 h-4" /> Envoyer le message</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#0a0a0a] text-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Image
                  src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770580517/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_qmfwbc_1_f4huf1.png"
                  alt="HikmaClips" width={36} height={36} className="rounded-xl"
                />
                <span className="text-lg font-black">HikmaClips</span>
              </div>
              <p className="text-white/40 text-sm max-w-[220px] leading-relaxed">
                L'application islamique pour partager la sagesse du Coran et de la Sunna.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12">
              <div className="space-y-3">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">App</p>
                <div className="space-y-2">
                  {NAV_LINKS.map(l => (
                    <button key={l.id} onClick={() => scrollTo(l.id)} className="block text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Légal</p>
                <div className="space-y-2">
                  <Link href="/privacy-policy" className="block text-sm text-white/60 hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                  <Link href="/terms-of-service" className="block text-sm text-white/60 hover:text-white transition-colors">
                    Conditions d'utilisation
                  </Link>
                  <Link href="/updates" className="block text-sm text-white/60 hover:text-white transition-colors">
                    Mises à jour
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Télécharger</p>
                <button onClick={() => window.open('https://play.google.com/store/apps/details?id=com.hikmatips.app', '_blank')}
                  className="flex items-center gap-2 bg-[#059669] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#047857] transition-colors">
                  <Smartphone className="w-4 h-4" /> Play Store
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <p>© {new Date().getFullYear()} HikmaClips · Meknès, Maroc</p>
            <p>
              Développé par{' '}
              <a href="http://web-linecreator.fr" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                web-linecreator.fr
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
