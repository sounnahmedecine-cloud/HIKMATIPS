'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ArrowDown,
  Download,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  BookOpen,
  ImageIcon,
  Plus,
  Star,
  Gift,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logEvent } from '@/lib/analytics';

/* ────────────────────────────────────────────────────────────
   HikmaClips — Landing page (refonte moderne, couleurs du logo)
   Palette : vert #2E9E44 / #25873a — orange #F5960F / #E07C05
   Fonts recommandées (à charger dans layout.tsx via next/font) :
     Space Grotesk (display) · Plus Jakarta Sans (body) · Amiri (arabe)
   ──────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const QUOTES = [
  { ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', fr: 'À côté de la difficulté est, certes, une facilité.', src: 'Ash-Sharh 94:6' },
  { ar: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', fr: 'Les actions ne valent que par leurs intentions.', src: 'Sahih Bukhari' },
  { ar: 'فَاصْبِرْ صَبْرًا جَمِيلًا', fr: "Endure d'une belle patience.", src: "Al-Ma'arij 70:5" },
];

const PHONE_GRADS = [
  'linear-gradient(165deg,#2E9E44 0%,#1f8a58 55%,#F5960F 130%)',
  'linear-gradient(165deg,#15703A 0%,#2E9E44 50%,#FDBA4D 130%)',
  'linear-gradient(165deg,#0E5C33 0%,#2E9E44 45%,#F5960F 120%)',
];

const RECUEILS = ['Bukhari', 'Muslim', 'Abu Dawud', "An-Nasa'i", 'Ibn Majah', 'Malik'];

const FEATURES = [
  {
    title: 'Versets & Hadiths',
    desc: 'Une base de 32 400+ hadiths et versets issus des recueils authentiques, avec traduction française certifiée.',
    Icon: BookOpen,
    tone: 'green' as const,
  },
  {
    title: 'Génération instantanée',
    desc: "Choisis un thème, l'Agent Hikma compose un visuel harmonieux prêt à publier en quelques secondes.",
    Icon: Zap,
    tone: 'orange' as const,
  },
  {
    title: 'Export HD 9:16',
    desc: 'Des images haute définition sans filigrane, calibrées pour Reels, Shorts et Stories.',
    Icon: ImageIcon,
    tone: 'green' as const,
  },
];

const STEPS = [
  { n: '01', title: 'Choisis un thème', desc: "Patience, gratitude, pardon, invocations… ou laisse l'Agent Hikma te surprendre." },
  { n: '02', title: 'Personnalise le clip', desc: 'Ajuste le fond, la calligraphie et la mise en page selon ton style et ta plateforme.' },
  { n: '03', title: 'Partage la science', desc: 'Exporte en HD et publie sur TikTok, Instagram ou YouTube en un geste.' },
];

const CLIPS = [
  { grad: 'linear-gradient(165deg,#2E9E44,#1f8a58 60%,#F5960F)', ar: 'وَذَكِّرْ', fr: 'Et rappelle.', src: 'Adh-Dhariyat 51:55' },
  { grad: 'linear-gradient(165deg,#15703A,#2E9E44 55%,#FDBA4D)', ar: 'فَاذْكُرُونِي', fr: 'Souvenez-vous de Moi.', src: 'Al-Baqara 2:152' },
  { grad: 'linear-gradient(165deg,#0E5C33,#2E9E44 50%,#F5960F)', ar: 'رَبِّ زِدْنِي عِلْمًا', fr: 'Seigneur, accrois ma science.', src: 'Ta-Ha 20:114' },
  { grad: 'linear-gradient(165deg,#B96C05,#F5960F 55%,#2E9E44)', ar: 'لَا تَحْزَنْ', fr: "Ne t'afflige pas.", src: 'At-Tawba 9:40' },
];

const TESTIS = [
  { quote: "Enfin une app qui rend la da'wah simple. Je publie un rappel chaque jour sur Instagram en moins d'une minute.", name: 'Yassine B.', role: 'Créateur de contenu', ini: 'Y' },
  { quote: "Les sources sont vérifiées et affichées clairement. C'est ce qui me manquait pour partager en confiance.", name: 'Amina K.', role: 'Étudiante en sciences islamiques', ini: 'A' },
  { quote: 'Le rendu est magnifique et professionnel. MashaAllah, un vrai gain de temps pour notre mosquée.', name: 'Imam Réda', role: 'Responsable jeunesse', ini: 'R' },
];

const FAQS = [
  { q: "L'application est-elle vraiment gratuite ?", a: 'Oui. HikmaClips est gratuit et sans publicité intrusive. Une option Premium facultative débloque des styles et fonctionnalités avancées.' },
  { q: 'Les sources sont-elles fiables ?', a: 'Chaque hadith provient exclusivement des recueils authentiques (Bukhari, Muslim, Abu Dawud, An-Nasa’i, Ibn Majah et le Muwatta de Malik) avec sa référence affichée.' },
  { q: "Puis-je l'utiliser hors ligne ?", a: "Oui. L'application Android embarque 150 rappels, 25 arrière-plans et 9 livres consultables sans connexion. La recherche dans les 32 700 hadiths, la galerie de fonds HD et le Coran audio nécessitent Internet." },
  { q: 'Sur quelles plateformes puis-je publier ?', a: 'Les exports sont au format vertical 9:16, optimisés pour TikTok, Instagram Reels & Stories, et YouTube Shorts.' },
];

const NAV_ITEMS = [
  ['🏠', 'Accueil', 1],
  ['⚡', 'Générer', 0.38],
  ['❤️', 'Favoris', 0.38],
  ['⚙️', 'Réglages', 0.38],
] as const;

/* ── Reusable brand lockup ── */
function Brand({ size = 20 }: { size?: number }) {
  const box = size * 1.9;
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-[11px] shadow-[0_6px_18px_rgba(46,158,68,0.28)]"
        style={{ width: box, height: box, background: 'linear-gradient(135deg,#2E9E44,#F5960F)' }}
      >
        <svg width={size * 0.85} height={size * 0.85} viewBox="0 0 24 24" fill="#fff">
          <path d="M6 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 6 4.5Z" />
        </svg>
      </div>
      <span className="font-display font-bold tracking-[-0.5px]" style={{ fontSize: size }}>
        <span className="text-[#2E9E44]">Hikma</span>
        <span className="text-[#F5960F]">Clips</span>
      </span>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [betaPseudo, setBetaPseudo] = useState('');
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitting, setBetaSubmitting] = useState(false);
  const [betaSubmitted, setBetaSubmitted] = useState(false);

  const scrollToBeta = () => {
    document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!betaPseudo.trim() || !betaEmail.trim()) return;
    setBetaSubmitting(true);
    try {
      const { firestore } = initializeFirebase();
      await addDoc(collection(firestore, 'beta_testers'), {
        pseudo: betaPseudo.trim(),
        email: betaEmail.trim(),
        createdAt: serverTimestamp(),
      });
      setBetaSubmitted(true);
      logEvent('beta_signup');
      setBetaPseudo('');
      setBetaEmail('');
    } catch (error) {
      console.error('Error submitting beta signup:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setBetaSubmitting(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % QUOTES.length);
      setLiked(false);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goToApp = () => router.push('/generateur');
  const q = QUOTES[idx];

  return (
    <div className="relative w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] overflow-x-hidden bg-[#FBFAF7] text-[#14201A] -m-4 md:-m-8">
      {/* ambient orbs */}
      <div className="pointer-events-none absolute -right-52 -top-40 z-0 h-[620px] w-[620px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(46,158,68,0.14),transparent 68%)' }} />
      <div className="pointer-events-none absolute -bottom-52 -left-52 z-0 h-[560px] w-[560px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(245,150,15,0.12),transparent 68%)' }} />

      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-50 border-b border-[#EDE9E0] bg-[#FBFAF7]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-3.5">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-[14.5px] font-medium text-[#4A574F] hover:text-[#2E9E44]">Fonctionnalités</a>
            <a href="#how" className="text-[14.5px] font-medium text-[#4A574F] hover:text-[#2E9E44]">Comment ça marche</a>
            <a href="#showcase" className="text-[14.5px] font-medium text-[#4A574F] hover:text-[#2E9E44]">Exemples</a>
            <a href="#faq" className="text-[14.5px] font-medium text-[#4A574F] hover:text-[#2E9E44]">FAQ</a>
          </nav>
          <button
            onClick={goToApp}
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[14.5px] font-bold text-white shadow-[0_8px_20px_rgba(46,158,68,0.26)] transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#2E9E44,#25873a)' }}
          >
            <Zap className="h-4 w-4 fill-current" />
            Ouvrir l&apos;app
          </button>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-6 pb-10 pt-[76px] lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#2E9E44]/30 bg-[#2E9E44]/[0.07] px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E9E44] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E9E44]" />
            </span>
            <span className="text-[11.5px] font-bold uppercase tracking-[1.4px] text-[#25873a]">Rappels du Coran &amp; de la Sunnah</span>
          </div>

          <h1 className="mb-5 font-display text-[44px] font-bold leading-[1.02] tracking-[-2.2px] sm:text-[54px] lg:text-[60px]">
            Diffuse la
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(105deg,#2E9E44 0%,#3AA53A 30%,#F5960F 100%)' }}
            >
              sagesse, en un clip.
            </span>
          </h1>

          <p className="mb-[34px] max-w-[520px] text-[18.5px] font-normal leading-[1.6] text-[#54615A]">
            Hadiths authentiques, versets coraniques et invocations — transformés en visuels prêts à publier sur TikTok, Instagram et YouTube en quelques secondes.
          </p>

          <div className="mb-[34px] flex flex-wrap items-center gap-3.5">
            <button
              onClick={goToApp}
              className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(46,158,68,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(46,158,68,0.4)]"
              style={{ background: 'linear-gradient(135deg,#2E9E44,#25873a)' }}
            >
              <Zap className="h-[18px] w-[18px] fill-current" />
              Mon hadith du jour
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={scrollToBeta}
              className="inline-flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#F0C58A] bg-white px-6 py-3.5 text-[15.5px] font-bold text-[#B96C05] shadow-[0_8px_22px_rgba(245,150,15,0.12)] transition-colors hover:border-[#F5960F] hover:bg-[#FFF9F0]"
            >
              <Gift className="h-[18px] w-[18px] text-[#F5960F]" />
              Devenir bêta testeur
              <ArrowDown className="h-4 w-4 text-[#9A8B78]" />
            </button>
          </div>

          <div className="mt-[30px] flex gap-9 border-t border-[#EAE6DD] pt-[26px]">
            {[
              ['32 700+', 'Hadiths authentiques'],
              ['6', 'Recueils majeurs'],
              ['100%', 'Sources vérifiées'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-[27px] font-bold">{v}</p>
                <p className="mt-0.5 text-[12.5px] text-[#7A857D]">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* phone mockup */}
        <motion.div
          className="relative flex min-h-[560px] items-center justify-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
        >
          <div className="absolute h-[420px] w-[250px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(46,158,68,0.28),transparent 68%)', filter: 'blur(50px)' }} />
          <motion.div className="relative w-[278px]" animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="rounded-[52px] border border-[#2c3833] bg-[#1c2622] p-1 shadow-[0_44px_90px_rgba(16,61,36,0.4)]">
              <div className="relative overflow-hidden rounded-[48px] bg-[#0b120e]" style={{ aspectRatio: '9/19.5' }}>
                <div className="absolute left-1/2 top-3 z-20 h-[22px] w-[82px] -translate-x-1/2 rounded-full border border-[#1c2622] bg-[#0b120e]" />
                <div className="absolute inset-0 transition-[background] duration-700" style={{ background: PHONE_GRADS[idx] }} />
                <div className="absolute left-1/2 top-[34%] h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" style={{ filter: 'blur(34px)' }} />

                <div className="absolute left-0 right-0 top-[46px] z-10 flex items-center justify-between px-3.5">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.14] px-2.5 py-1.5 backdrop-blur-md">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">Agent</span>
                  </div>
                  <div className="rounded-full border border-white/25 bg-[#F5960F]/30 px-2.5 py-1.5">
                    <span className="text-[9px] font-extrabold text-white">✦ Premium</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="mb-4 font-arabic text-[22px] leading-[1.7] text-white/90" dir="rtl">{q.ar}</p>
                    <p className="max-w-[190px] text-[14px] font-semibold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.28)]">"{q.fr}"</p>
                    <p className="mt-4 text-[9px] uppercase tracking-[2px] text-white/70">— {q.src} —</p>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5">
                  <button
                    onClick={() => setLiked((v) => !v)}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/25 transition-colors"
                    style={{ background: liked ? 'rgba(239,68,68,0.34)' : 'rgba(255,255,255,0.14)' }}
                  >
                    <Heart className="h-4 w-4" style={{ fill: liked ? '#EF4444' : 'none', color: '#fff' }} />
                  </button>
                  <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/25 bg-white/[0.14]">
                    <Share2 className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-[60px] left-0 right-0 z-10 flex items-center justify-center gap-2 px-3.5">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 bg-white/[0.14]">
                    <ChevronLeft className="h-[15px] w-[15px] text-white" />
                  </div>
                  <div className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2E9E44] shadow-[0_8px_20px_rgba(46,158,68,0.5)]">
                    <Zap className="h-3.5 w-3.5 fill-white text-white" />
                    <span className="text-[11.5px] font-bold text-white">Agent Hikma</span>
                  </div>
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 bg-white/[0.14]">
                    <ChevronRight className="h-[15px] w-[15px] text-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 flex h-[46px] items-center justify-around border-t border-white/15 bg-[#15703A]/40 backdrop-blur-md">
                  {NAV_ITEMS.map(([icon, label, op]) => (
                    <div key={label} className="flex flex-col items-center gap-0.5" style={{ opacity: op }}>
                      <span className="text-[14px]">{icon}</span>
                      <span className="text-[7px] text-white/85">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-3.5 top-[26%] flex items-center gap-2.5 rounded-2xl border border-[#ECE8DF] bg-white px-3.5 py-2.5 shadow-[0_16px_40px_rgba(16,61,36,0.14)]"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDECEC]">
              <Heart className="h-[15px] w-[15px] fill-[#EF4444] text-[#EF4444]" />
            </div>
            <div>
              <p className="text-[10.5px] text-[#8A948C]">Partages / jour</p>
              <p className="font-display text-[15px] font-bold">1 200+</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-3.5 bottom-[24%] rounded-2xl border border-[#ECE8DF] bg-white px-3.5 py-2.5 shadow-[0_16px_40px_rgba(16,61,36,0.14)]"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 5.5, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[10.5px] text-[#8A948C]">Sources vérifiées</p>
            <p className="flex items-center gap-1.5 font-display text-[15px] font-bold">
              <Check className="h-[15px] w-[15px] text-[#2E9E44]" strokeWidth={2.4} /> 9 Recueils
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="relative z-10 border-y border-[#EDE9E0] bg-white/50">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-6 px-6 py-[22px]">
          <span className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#9AA39B]">Recueils authentiques&nbsp;:</span>
          {RECUEILS.map((r) => (
            <span key={r} className="font-display text-[16px] font-semibold text-[#3D4A42] opacity-85">{r}</span>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="relative z-10 mx-auto max-w-[1200px] px-6 pb-10 pt-[88px]">
        <div className="mx-auto mb-[52px] max-w-[640px] text-center">
          <span className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#F5960F]">Fonctionnalités</span>
          <h2 className="mb-3.5 mt-3 font-display text-[40px] font-bold leading-[1.08] tracking-[-1.4px]">Tout pour partager la science, simplement</h2>
          <p className="text-[17px] leading-[1.55] text-[#5C6860]">Une bibliothèque vérifiée, un moteur de génération et des exports optimisés — pensés pour la da&apos;wah numérique.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              className="rounded-[18px] border border-[#ECE8DF] bg-white p-[26px] pt-[30px] shadow-[0_2px_14px_rgba(16,61,36,0.05)]"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]" style={{ background: f.tone === 'green' ? '#E8F5EC' : '#FDF0E0' }}>
                <f.Icon className="h-6 w-6" style={{ color: f.tone === 'green' ? '#2E9E44' : '#F5960F' }} strokeWidth={1.7} />
              </div>
              <h3 className="mb-2.5 font-display text-[20px] font-semibold tracking-[-0.4px]">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-[#63706A]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="relative z-10 mt-[60px] overflow-hidden" style={{ background: 'linear-gradient(160deg,#103D24 0%,#0B2E1B 100%)' }}>
        <div className="absolute -right-28 -top-36 h-[440px] w-[440px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(245,150,15,0.16),transparent 66%)', filter: 'blur(30px)' }} />
        <div className="absolute -bottom-40 -left-28 h-[420px] w-[420px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(46,158,68,0.28),transparent 66%)', filter: 'blur(30px)' }} />
        <div className="relative mx-auto max-w-[1200px] px-6 py-[84px]">
          <div className="mx-auto mb-14 max-w-[600px] text-center">
            <span className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#F5C97A]">Comment ça marche</span>
            <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.1] tracking-[-1.4px] text-white">Du choix au partage, en trois gestes</h2>
          </div>
          <div className="grid grid-cols-1 gap-[26px] md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-[26px] pt-[30px] backdrop-blur-sm">
                <div className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-xl font-display text-[15px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#2E9E44,#F5960F)' }}>{s.n}</div>
                <h3 className="mb-2.5 font-display text-[20px] font-semibold tracking-[-0.4px] text-white">{s.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-white/[0.68]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE ═══ */}
      <section id="showcase" className="relative z-10 mx-auto max-w-[1200px] px-6 pb-10 pt-[88px]">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[560px]">
            <span className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#F5960F]">Galerie</span>
            <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.1] tracking-[-1.4px]">Des visuels prêts à publier</h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-[1.55] text-[#63706A]">Chaque clip est généré au format vertical 9:16, calibré pour les Reels, Shorts et Stories.</p>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {CLIPS.map((c) => (
            <motion.div
              key={c.src}
              className="relative overflow-hidden rounded-[18px] shadow-[0_14px_36px_rgba(16,61,36,0.12)]"
              style={{ aspectRatio: '9/16' }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="absolute inset-0" style={{ background: c.grad }} />
              <div className="absolute left-1/2 top-[34%] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" style={{ filter: 'blur(28px)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-[18px] py-[22px] text-center">
                <p className="mb-3.5 font-arabic text-[19px] leading-[1.7] text-white/[0.94]" dir="rtl">{c.ar}</p>
                <p className="text-[12.5px] font-semibold leading-snug text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">"{c.fr}"</p>
                <p className="mt-3 text-[8px] uppercase tracking-[1.6px] text-white/[0.72]">{c.src}</p>
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/25 bg-white/[0.16]"><Heart className="h-3 w-3 fill-white text-white" /></span>
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/25 bg-white/[0.16]"><Share2 className="h-3 w-3 text-white" /></span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 pb-10 pt-[70px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIS.map((t) => (
            <div key={t.name} className="rounded-[18px] border border-[#ECE8DF] bg-white p-[26px] pt-7 shadow-[0_2px_14px_rgba(16,61,36,0.05)]">
              <div className="mb-4 flex gap-0.5 text-[#F5960F]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5960F]" />)}
              </div>
              <p className="mb-[22px] text-[15.5px] leading-[1.62] text-[#333F38]">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-[15px] font-extrabold text-white" style={{ background: 'linear-gradient(135deg,#2E9E44,#F5960F)' }}>{t.ini}</div>
                <div>
                  <p className="text-[14.5px] font-bold">{t.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-[#7E8981]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ DOWNLOAD CTA ═══ */}
      <section id="download" className="relative z-10 mx-auto mt-11 max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-[28px] px-14 py-16 shadow-[0_30px_70px_rgba(46,158,68,0.3)]" style={{ background: 'linear-gradient(130deg,#2E9E44 0%,#25873a 44%,#F5960F 130%)' }}>
          <div className="absolute -right-16 -top-28 h-[360px] w-[360px] rounded-full bg-white/[0.12]" style={{ filter: 'blur(20px)' }} />
          <div className="absolute -bottom-36 left-1/4 h-[320px] w-[320px] rounded-full bg-white/[0.08]" style={{ filter: 'blur(20px)' }} />
          <div className="relative flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-[560px]">
              <h2 className="mb-3.5 font-display text-[40px] font-bold leading-[1.1] tracking-[-1.4px] text-white">Emporte la sagesse partout avec toi</h2>
              <p className="mb-[30px] text-[17px] leading-[1.55] text-white/90">Télécharge l&apos;application Android et génère tes clips même hors ligne. Gratuit, sans publicité intrusive.</p>
              <div className="flex flex-wrap gap-3.5">
                <a href="https://drive.google.com/file/d/1p8C42qFhkHdZEdVIcIC59z6tCyVDMi_a/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-[15.5px] font-bold text-[#14201A] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5">
                  <Download className="h-5 w-5" /> Télécharger l&apos;APK
                </a>
                <button onClick={goToApp} className="inline-flex items-center gap-2.5 rounded-xl border border-white/40 bg-white/[0.14] px-6 py-3.5 text-[15.5px] font-bold text-white transition-colors hover:bg-white/[0.22]">
                  Ouvrir la version web <ArrowRight className="h-[17px] w-[17px]" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {['150 rappels et 9 livres hors ligne', 'Export HD sans filigrane', 'Mises à jour régulières', '100 % gratuit'].map((l) => (
                <div key={l} className="flex items-center gap-2.5 text-[14.5px] font-medium text-white">
                  <Check className="h-[19px] w-[19px]" strokeWidth={2.4} /> {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative z-10 mx-auto max-w-[820px] px-6 pb-10 pt-[84px]">
        <div className="mb-11 text-center">
          <span className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#F5960F]">FAQ</span>
          <h2 className="mt-3 font-display text-[38px] font-bold leading-[1.1] tracking-[-1.2px]">Questions fréquentes</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-[14px] border border-[#ECE8DF] bg-white">
                <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="font-display text-[17px] font-semibold">{f.q}</span>
                  <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-[#F3EFE6] transition-transform duration-200" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    <Plus className="h-[15px] w-[15px] text-[#2E9E44]" strokeWidth={2.4} />
                  </span>
                </button>
                <div className="overflow-hidden transition-[max-height] duration-300 ease-out" style={{ maxHeight: open ? 220 : 0 }}>
                  <p className="px-6 pb-[22px] text-[15px] leading-[1.62] text-[#5C6860]">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ BETA SIGNUP ═══ */}
      <section id="beta" className="relative z-10 mx-auto mt-11 max-w-[1200px] scroll-mt-24 px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-[#ECE8DF] bg-white px-6 py-14 text-center shadow-[0_20px_50px_rgba(16,61,36,0.08)] sm:px-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(46,158,68,0.12),transparent 68%)' }} />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-[280px] w-[280px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(245,150,15,0.12),transparent 68%)' }} />

          <div className="relative mx-auto max-w-[560px]">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-[#E8F5EC] px-3.5 py-1.5">
              <Gift className="h-3.5 w-3.5 text-[#2E9E44]" />
              <span className="text-[11.5px] font-bold uppercase tracking-[1.4px] text-[#25873a]">Accès à vie pour les bêta testeurs</span>
            </div>
            <h2 className="mb-3.5 font-display text-[36px] font-bold leading-[1.1] tracking-[-1.2px] sm:text-[40px]">Devenez bêta testeur</h2>
            <p className="text-[16px] leading-[1.6] text-[#5C6860]">
              Ouvrez l&apos;app quelques minutes, explorez les nouveautés (bibliothèque, Coran, jardin de la sagesse) et revenez sur quelques jours différents. Votre aide nous permet de rendre HikmaClips encore meilleur.
            </p>

            {betaSubmitted ? (
              <div className="mt-8 rounded-2xl border border-[#2E9E44]/30 bg-[#E8F5EC] px-6 py-5">
                <p className="font-display text-[17px] font-bold text-[#15703A]">Merci ! C&apos;est noté 🌱</p>
                <p className="mt-1.5 text-[14px] text-[#3D4A42]">Nous revenons vers vous très vite avec les prochaines étapes.</p>
              </div>
            ) : (
              <form onSubmit={handleBetaSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  required
                  value={betaPseudo}
                  onChange={(e) => setBetaPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  className="w-full flex-1 rounded-xl border border-[#ECE8DF] bg-[#FBFAF7] px-4 py-3.5 text-[15px] outline-none ring-[#2E9E44]/30 focus:ring-2"
                />
                <input
                  type="email"
                  required
                  value={betaEmail}
                  onChange={(e) => setBetaEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full flex-1 rounded-xl border border-[#ECE8DF] bg-[#FBFAF7] px-4 py-3.5 text-[15px] outline-none ring-[#2E9E44]/30 focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={betaSubmitting}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(46,158,68,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#2E9E44,#25873a)' }}
                >
                  {betaSubmitting ? 'Envoi...' : 'Je participe'}
                </button>
              </form>
            )}
            <p className="mt-4 text-[12px] text-[#9AA39B]">100% gratuit · Sans engagement · Accès à vie pour les bêta testeurs</p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-10 border-t border-[#EDE9E0] bg-white/60">
        <div className="mx-auto max-w-[1200px] px-6 pb-9 pt-[52px]">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="max-w-[320px]">
              <div className="mb-4"><Brand size={19} /></div>
              <p className="text-[14px] leading-[1.6] text-[#6B776F]">Partagez • Inspirez • Bénéficiez. Des rappels authentiques du Coran et de la Sunnah, prêts à diffuser.</p>
            </div>
            <div className="flex flex-wrap gap-14">
              <div>
                <p className="mb-3.5 text-[12px] font-bold uppercase tracking-wider text-[#9AA39B]">Produit</p>
                <div className="flex flex-col gap-2.5">
                  <a href="#features" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Fonctionnalités</a>
                  <a href="#how" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Comment ça marche</a>
                  <a href="#download" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Télécharger</a>
                </div>
              </div>
              <div>
                <p className="mb-3.5 text-[12px] font-bold uppercase tracking-wider text-[#9AA39B]">Légal</p>
                <div className="flex flex-col gap-2.5">
                  <Link href="/privacy-policy" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Confidentialité</Link>
                  <Link href="/terms-of-service" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">CGU</Link>
                  <Link href="/updates" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Nouveautés</Link>
                  <Link href="/feedback" className="text-[14px] text-[#4A574F] hover:text-[#2E9E44]">Feedback</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAE6DD] pt-[26px]">
            <p className="text-[13px] text-[#8A948C]">
              © {new Date().getFullYear()} HikmaClips · Développé par{' '}
              <a href="http://web-linecreation.fr" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#2E9E44] hover:underline">web-linecreation.fr</a> · Meknès, Maroc
            </p>
            <span className="text-[13px] text-[#8A948C]">v1.2.58</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
