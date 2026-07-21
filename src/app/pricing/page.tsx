import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Clapperboard, Crown, PenLine, Sparkles, X, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Premium — HikmaClips',
  description: 'Passez à HikmaClips Premium et diffusez la science sans limites.',
};

const features = [
  { label: 'Export HD sans filigrane', icon: Clapperboard },
  { label: 'Fonds & calligraphies exclusifs', icon: Sparkles },
  { label: 'Générations illimitées', icon: Zap },
  { label: 'Signature personnalisée', icon: PenLine },
];

export default function PricingPage() {
  return (
    <main className="fixed inset-0 z-10 overflow-y-auto bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 py-[max(1.5rem,env(safe-area-inset-top))] text-white [font-family:var(--font-hikma-ui)]">
      <div className="absolute left-1/2 top-[14%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[64px]" />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col">
        <Link href="/generateur" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/85 backdrop-blur-xl" aria-label="Fermer">
          <X className="h-4 w-4" />
        </Link>

        <section className="flex flex-1 flex-col justify-center pb-5 pt-3 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] border border-white/30 bg-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.20)] backdrop-blur-xl">
            <Crown className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/80">HikmaClips Premium</p>
          <h1 className="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-0.7px] [font-family:var(--font-display)]">Passe à la vitesse supérieure</h1>

          <div className="mt-7 rounded-[20px] border border-white/20 bg-white/10 px-4 py-1 text-left backdrop-blur-xl">
            {features.map(({ label, icon: Icon }, index) => (
              <div key={label} className={`flex items-center gap-3 py-3.5 text-[13px] font-semibold ${index < features.length - 1 ? 'border-b border-white/15' : ''}`}>
                <Icon className="h-[18px] w-[18px]" /> {label}
              </div>
            ))}
          </div>
        </section>

        <section className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center justify-between rounded-[16px] bg-white px-4 py-3.5 text-left text-[#14201A] shadow-lg">
            <div>
              <p className="text-[13px] font-bold">Annuel · <span className="text-[#2E9E44]">2 mois offerts</span></p>
              <p className="mt-1 text-[10px] font-medium text-[#9AA39B]">19,99 €/an — soit 1,67 €/mois</p>
            </div>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white"><Check className="h-3.5 w-3.5" /></span>
          </div>
          <button className="h-14 w-full rounded-[18px] bg-white text-[15px] font-bold text-[#15703A] shadow-[0_14px_30px_rgba(0,0,0,0.28)]">Commencer l’essai gratuit</button>
          <p className="mt-3 text-center text-[10px] font-medium text-white/70">7 jours offerts · Restaurer mes achats</p>
        </section>
      </div>
    </main>
  );
}
