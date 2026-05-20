'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Download,
    BookOpen,
    Rocket,
    MessageCircle,
    BookMarked,
    Sparkles,
    Moon,
    Mail,
    MessageSquare,
    Star,
    CheckCircle2,
    Library,
    GraduationCap,
    Play,
    Maximize,
    Volume2,
    ArrowRight,
    Share2,
    Smartphone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { HeroModern } from '@/components/HeroModern';
import { cn } from '@/lib/utils';

const GeneratorPage = dynamic(() => import('@/components/GeneratorPage'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement du générateur...</p>
    </div>
  ),
});

/* ─── Floating animation keyframes injected once ─── */
const floatStyles = `
  @keyframes float1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-12px) scale(1.02)} }
  @keyframes float2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.015)} }
  @keyframes float3 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-14px) scale(1.02)} }
  .float-1{animation:float1 6s cubic-bezier(.175,.885,.32,1.275) infinite}
  .float-2{animation:float2 8s cubic-bezier(.175,.885,.32,1.275) infinite 1s}
  .float-3{animation:float3 7s cubic-bezier(.175,.885,.32,1.275) infinite 2s}
  .glass{background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(16,185,129,0.12);box-shadow:0 4px 32px rgba(16,185,129,0.06),0 1px 0 rgba(255,255,255,0.9) inset;}
  .glass:hover{border-color:rgba(16,185,129,0.3);box-shadow:0 8px 40px rgba(16,185,129,0.1);}
`;

/* ─── Audience tiles ─── */
const AUDIENCE = [
  { icon: '🎙️', title: 'Prédicateurs & Imams',     desc: 'Diffusez vos khutbahs en formats courts percutants.', accent: '#F0C040', offset: false },
  { icon: '🕌', title: 'Associations & Mosquées', desc: 'Animez vos réseaux avec du contenu de haute qualité.', accent: '#10B981', offset: true  },
  { icon: '👤', title: 'Créateurs Indépendants',  desc: 'Industrialisez votre production de contenu islamique.', accent: '#e5e7eb', offset: false },
  { icon: '🎓', title: 'Instituts & Enseignants', desc: 'Créez des supports visuels éducatifs impactants.',      accent: '#F0C040', offset: true  },
];

/* ─── Why checklist ─── */
const WHY = [
  'Contenu islamique authentique et vérifié',
  'Interface simple et intuitive',
  'Génération par l\'Agent Hikma IA',
  'Export haute qualité tous réseaux',
  'Gratuit avec compte premium',
  '100% respectueux des valeurs islamiques',
];

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen?.();
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
      toast({ title: 'Message envoyé !', description: 'Merci, nous vous répondrons dès que possible.' });
      (e.target as HTMLFormElement).reset();
    } catch {
      toast({ title: 'Erreur', description: "Veuillez réessayer.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToApp = () => {
    document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-emerald-50/40 dark:bg-slate-950 text-zinc-900 dark:text-slate-100">
      <style>{floatStyles}</style>

      {/* Ambient lighting orbs */}
      <div className="fixed top-1/4 -right-64 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 -left-64 w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle,rgba(240,192,64,0.06) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      {/* ── HERO ── */}
      <HeroModern onScrollToApp={scrollToApp} />

      {/* ══════════════════════════════════════════════
          SECTION 0 — GENERATOR (visible dès l'accueil)
      ══════════════════════════════════════════════ */}
      <section id="app-section" className="relative z-20 isolate py-20 px-4 scroll-mt-16 flex flex-col items-center text-center bg-emerald-50/40 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="w-full max-w-3xl"
        >
          <p className="text-zinc-500 dark:text-slate-400 text-lg mb-10">Hadith, verset coranique ou doua — sélectionne la catégorie et publie en quelques secondes.</p>
          <GeneratorPage />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 1 — LIBRARY
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[70vh]">

            {/* Left text */}
            <motion.div
              className="lg:col-span-5 space-y-8"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                <Library className="h-4 w-4" />
                Hadiths & Versets Authentiques
              </div>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
                <span className="text-zinc-500 dark:text-slate-400">Seulement des sources</span><br />
                <span className="text-zinc-900 dark:text-white">vérifiées et authentiques.</span>
              </h2>

              <p className="text-zinc-600 dark:text-slate-400 text-lg sm:text-xl leading-relaxed max-w-lg">
                Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Ahmad, Malik, Darimi — les 9 recueils majeurs de hadiths authentiques, classés par degré de fiabilité, en français.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-5 rounded-2xl space-y-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">9 Livres Majeurs</h4>
                  <p className="text-zinc-500 dark:text-slate-400 text-xs">Sihah et Sunan intégralement accessibles en français.</p>
                </div>
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-5 rounded-2xl space-y-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Sources Vérifiées</h4>
                  <p className="text-zinc-500 dark:text-slate-400 text-xs">Garantissez l'authenticité de chaque parole partagée.</p>
                </div>
              </div>

              <Link href="/ressources">
                <button className="group relative px-7 py-4 rounded-xl font-semibold text-white overflow-hidden transition-transform active:scale-95">
                  <div className="absolute inset-0 bg-primary transition-transform duration-300 group-hover:scale-105 rounded-xl" />
                  <span className="relative flex items-center gap-2">
                    Explorer la Bibliothèque
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Right: floating book cards */}
            <div className="lg:col-span-7 relative h-[480px] md:h-[580px] w-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-30" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%)' }} />

              {/* Bukhari */}
              <motion.div
                className="absolute w-[260px] md:w-[320px] float-1 z-10"
                style={{ top: '5%', right: '5%' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              >
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-6 rounded-[2rem]">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                      <BookOpen className="h-5 w-5" style={{ color: '#F0C040' }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500 uppercase tracking-widest">7 563 textes</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d97706' }}>Authentique</span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-1">Sahih Al-Bukhari</h3>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-2 italic leading-relaxed">"Le plus haut degré d'authenticité après le Coran."</p>
                </div>
              </motion.div>

              {/* Muslim */}
              <motion.div
                className="absolute w-[240px] md:w-[300px] float-2 z-20"
                style={{ top: '35%', left: '2%' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              >
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-6 rounded-[2rem]">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center mb-5">
                    <BookMarked className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Authentique</span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-1">Sahih Muslim</h3>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-2 italic">"Une organisation et une précision sans égal."</p>
                </div>
              </motion.div>

              {/* Muwatta */}
              <motion.div
                className="absolute w-[200px] md:w-[250px] float-3 z-30"
                style={{ bottom: '8%', right: '12%' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              >
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-5 rounded-3xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Héritage</span>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">Al-Muwatta</h3>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">Imam Malik · Cité Prophétique</p>
                </div>
              </motion.div>

              {/* Abu Dawud */}
              <motion.div
                className="absolute w-[180px] md:w-[220px] float-1 z-20"
                style={{ top: '12%', left: '18%' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
              >
                <div className="glass dark:bg-slate-800/80 dark:border-slate-700 p-5 rounded-3xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Sunan</span>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">Abu Dawud</h3>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">"Quintessence de la jurisprudence."</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — FEATURES BENTO
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Fonctionnalités</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">Outils pour diffuser la Sunnah</h2>
            </div>
            <p className="text-zinc-500 dark:text-slate-400 text-lg max-w-sm">Hadiths, versets coraniques, douas — crée et publie du contenu islamique authentique rapidement.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Large card — Versets */}
            <motion.div
              className="md:col-span-2 glass dark:bg-slate-800/80 dark:border-slate-700 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group cursor-default"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
            >
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150" style={{ background: 'rgba(16,185,129,0.08)', filter: 'blur(60px)' }} />
              <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center mb-12">
                  <BookMarked className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Versets Coraniques Multilingues</h3>
                  <p className="text-zinc-500 dark:text-slate-400 text-lg max-w-md">Recherche par sourate ou mot clé. Insertion avec traduction française certifiée et typographie Othmani.</p>
                </div>
              </div>
            </motion.div>

            {/* Small card — Hadiths */}
            <motion.div
              className="glass dark:bg-slate-800/80 dark:border-slate-700 rounded-[2.5rem] p-8 relative overflow-hidden group cursor-default"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(240,192,64,0.08)', filter: 'blur(40px)' }} />
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center mb-8">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">9 Recueils de Hadiths</h3>
              <p className="text-zinc-500 dark:text-slate-400 text-sm">Classification par degré d'authenticité. Extraction en un clic.</p>
            </motion.div>

            {/* Small card — Rappels */}
            <motion.div
              className="glass dark:bg-slate-800/80 dark:border-slate-700 rounded-[2.5rem] p-8 relative overflow-hidden cursor-default"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center mb-8">
                <Moon className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Rappels & Citations</h3>
              <p className="text-zinc-500 dark:text-slate-400 text-sm">Paroles de savants, prêtes à être transformées en citations virales.</p>
            </motion.div>

            {/* Large card — Export */}
            <motion.div
              className="md:col-span-2 glass dark:bg-slate-800/80 dark:border-slate-700 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center gap-8 cursor-default"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            >
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(16,185,129,0.15)' }}>
                <Download className="h-9 w-9 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Export Ultra HD</h3>
                <p className="text-zinc-500 dark:text-slate-400">Formats verticaux (TikTok, Reels, Shorts) et horizontaux (YouTube) optimisés pour chaque plateforme.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — WHO + WHY (sticky split)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto border-t border-zinc-800/60 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Sticky left */}
            <motion.div
              className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-6"
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                Pour qui<br />est fait<br />
                <span className="text-primary">HikmaClips ?</span>
              </h2>
              <p className="text-zinc-500 dark:text-slate-400">Pour tout musulman qui veut faire de la da'wa sur les réseaux sociaux avec du contenu authentique.</p>
            </motion.div>

            {/* Right: tiles + checklist */}
            <div className="lg:col-span-8 flex flex-col gap-12">

              {/* Audience tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AUDIENCE.map((a, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "bg-white/80 dark:bg-slate-800 border-x border-b border-emerald-100 dark:border-slate-700 p-6 rounded-2xl hover:-translate-y-1 transition-transform cursor-default border-t-2 shadow-sm",
                      a.offset && 'sm:translate-y-4'
                    )}
                    style={{ borderTopColor: a.accent }}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  >
                    <span className="text-2xl mb-4 block">{a.icon}</span>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{a.title}</h4>
                    <p className="text-zinc-500 dark:text-slate-400 text-sm">{a.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Why checklist */}
              <motion.div
                className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900 border border-emerald-100 dark:border-slate-700 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full" style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(50px)' }} />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 border-b border-emerald-100 dark:border-slate-700 pb-4">Pourquoi HikmaClips ?</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                  {WHY.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-zinc-700 dark:text-slate-300 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION — COMMENT ÇA MARCHE (STORYTELLING)
      ══════════════════════════════════════════════ */}
      <section id="comment" className="relative z-10 py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ede9fe] text-[#7c3aed] text-xs font-bold uppercase tracking-widest mb-4">
              Comment ça marche ?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mb-4">
              3 étapes pour votre premier clip
            </h2>
            <p className="text-zinc-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
              De l&apos;idée au partage en moins de 30 secondes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#d1fae5] to-transparent" />
            {[
              { step: '01', icon: BookOpen, title: 'Choisissez votre source', desc: "Sélectionnez parmi Coran, Hadiths, Invocations, ou laissez l'Agent IA choisir selon votre thème." },
              { step: '02', icon: Sparkles, title: 'Générez votre visuel', desc: 'En 1 clic, un visuel islamique professionnel est créé avec le texte, la source et l\'image adaptée.' },
              { step: '03', icon: Share2, title: 'Partagez en 1 clic', desc: 'Téléchargez en HD ou partagez directement sur Instagram, WhatsApp, Reels et toutes vos plateformes.' },
            ].map((s, i) => (
              <motion.div key={i}
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] } } }}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center p-6">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-[#059669] flex items-center justify-center shadow-lg shadow-emerald-200">
                      <s.icon className="w-9 h-9 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black flex items-center justify-center">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION — TÉLÉCHARGER L'APP
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 bg-[#059669]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="space-y-7"
          >
            <div className="text-white/70 text-sm font-bold uppercase tracking-[0.2em]">Téléchargement gratuit</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Commencez à diffuser la sagesse islamique aujourd&apos;hui
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Rejoignez des centaines d&apos;utilisateurs qui partagent la sagesse de l&apos;Islam avec leurs proches chaque jour.
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
                className="flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-full text-base transition-all"
              >
                <Download className="w-5 h-5" />
                Télécharger l&apos;APK
              </a>
            </div>
            <p className="text-white/50 text-xs">Gratuit · Sans inscription · Disponible sur Android</p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — COMMUNITY LINKS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div
            className="glass dark:bg-slate-800/80 dark:border-slate-700 rounded-3xl p-8 text-center group hover:-translate-y-1 transition-transform"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Rocket className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Quoi de neuf ?</h3>
            <p className="text-zinc-500 dark:text-slate-400 mb-6 text-sm">Découvrez nos dernières mises à jour et futures fonctionnalités.</p>
            <Link href="/updates">
              <button className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:border-primary hover:text-primary transition-colors text-sm font-medium">
                Voir les nouveautés
              </button>
            </Link>
          </motion.div>

          <motion.div
            className="glass dark:bg-slate-800/80 dark:border-slate-700 rounded-3xl p-8 text-center group hover:-translate-y-1 transition-transform"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(240,192,64,0.1)' }}>
              <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" style={{ color: '#F0C040' }} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Votre avis</h3>
            <p className="text-zinc-500 dark:text-slate-400 mb-6 text-sm">Aidez-nous à faire de HikmaClips un meilleur outil pour la communauté.</p>
            <Link href="/feedback">
              <button className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors" style={{ borderColor: 'rgba(240,192,64,0.4)', color: '#F0C040' }}>
                Donner mon avis
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — CONTACT + COLLAB
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="w-full bg-white/60 dark:bg-slate-900/80 rounded-[3rem] p-2 md:p-3 border border-emerald-100 dark:border-slate-700 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[2.5rem] overflow-hidden">

              {/* Left: collab */}
              <div className="relative bg-emerald-600 p-10 md:p-16 flex flex-col justify-between min-h-[420px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/50 via-transparent to-emerald-800/30" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4">
                      Appel à la Collaboration
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Collaboration avec les <span className="text-emerald-100 italic">Prédicateurs</span>
                    </h3>
                    <p className="text-emerald-100/80">
                      Imam, prédicateur ou association islamique ? Contactez-nous pour un accès premium gratuit et participez au développement de HikmaClips.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-8">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent("Demande de Collaboration - HikmaClips");
                      const body = encodeURIComponent("As-salamu alaykum l'équipe HikmaClips,\n\nJe souhaiterais discuter d'une collaboration.");
                      window.location.href = `mailto:contact@hikmaclips.fr?subject=${subject}&body=${body}`;
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-emerald-700 bg-white transition-all active:scale-95 hover:bg-emerald-50"
                  >
                    Demander une collaboration
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right: contact form */}
              <div className="bg-white dark:bg-slate-800 p-10 md:p-16 flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Votre avis compte</h3>
                  <p className="text-zinc-500 dark:text-slate-400 text-sm">Notre équipe lit chaque message avec attention.</p>
                  <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-zinc-700 dark:text-slate-300 text-sm font-medium">elmalkidigital@gmail.com</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400 dark:text-slate-500 uppercase tracking-wider">Email</label>
                    <input name="email" type="email" required placeholder="votre@email.com"
                      className="w-full bg-zinc-50 dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:border-primary transition-all"
                      style={{ '--tw-ring-color': 'rgba(16,185,129,0.3)' } as any}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">Sujet</label>
                    <input name="subject" required placeholder="Ex: Devenir testeur, Bug..."
                      className="w-full bg-zinc-50 dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:border-primary transition-all"
                      style={{ '--tw-ring-color': 'rgba(16,185,129,0.3)' } as any}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                    <textarea name="message" required rows={3} placeholder="Dites-nous tout..."
                      className="w-full bg-zinc-50 dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:border-primary transition-all resize-none"
                      style={{ '--tw-ring-color': 'rgba(16,185,129,0.3)' } as any}
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors active:scale-[0.98] text-sm disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin border-2 border-zinc-700 border-t-transparent rounded-full" />
                        Envoi en cours...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Envoyer le message
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — VIDEO / COLLABORATION BANNER
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 shadow-sm rounded-[2.5rem] overflow-hidden"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12 lg:p-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-bold uppercase tracking-wide">
                  <Star className="h-4 w-4" />
                  Programme Partenaire
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
                  Partenariat <span className="text-primary italic">Prédicateurs</span>
                </h2>
                <p className="text-zinc-500 dark:text-slate-400 leading-relaxed">
                  As-salamu alaykum. HikmaClips propose un partenariat gratuit aux imams, prédicateurs et associations qui souhaitent diffuser des contenus islamiques authentiques sur les réseaux sociaux.
                </p>
                <button
                  className="h-14 px-8 rounded-2xl font-bold text-white flex items-center gap-3 transition-all active:scale-95"
                  style={{ background: '#10B981', boxShadow: '0 8px 30px rgba(16,185,129,0.25)' }}
                  onClick={() => {
                    const s = encodeURIComponent("Demande de Collaboration - HikmaClips");
                    const b = encodeURIComponent("As-salamu alaykum l'équipe HikmaClips,\n\nJe suis prédicateur/étudiant et je souhaiterais discuter d'une collaboration.");
                    window.location.href = `mailto:contact@hikmaclips.fr?subject=${s}&body=${b}`;
                  }}
                >
                  Demander une collaboration
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>

              <div className="relative aspect-[9/16] md:h-[580px] bg-black group overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                  autoPlay loop muted={isMuted} playsInline
                  onClick={() => setIsMuted(!isMuted)}
                  poster="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.jpg"
                >
                  <source src="https://res.cloudinary.com/db2ljqpdt/video/upload/v1770664519/hikmaclips-promo_m0xswu.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Play className="h-7 w-7 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    className="h-10 w-10 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  >
                    <Volume2 className={cn("h-4 w-4", isMuted && "opacity-40")} />
                  </button>
                  <button
                    className="h-10 w-10 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-emerald-100 dark:border-slate-800 mt-16 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Moon className="h-4 w-4 text-zinc-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">HikmaClips</span>
              <span className="text-zinc-600 dark:text-slate-400 text-sm">v1.0.5</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-500 dark:text-slate-400">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Confidentialité</Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">CGU</Link>
              <Link href="/updates" className="hover:text-primary transition-colors">Nouveautés</Link>
              <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
            </nav>
          </div>

          <div className="mt-8 pt-8 border-t border-emerald-100 dark:border-slate-800 text-center text-sm text-zinc-400 dark:text-slate-500">
            © {new Date().getFullYear()} HikmaClips · Développé par{' '}
            <a href="http://web-linecreator.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              web-linecreator.fr
            </a>
            {' '}· Meknès, Maroc
          </div>
        </div>
      </footer>
    </div>
  );
}
