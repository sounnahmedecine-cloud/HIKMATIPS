import { HikmaAppDock } from '@/components/HikmaAppDock';
import { QuranAudioPlayer } from '@/components/quran/QuranAudioPlayer';

export const metadata = {
  title: 'Coran — HikmaClips',
  description: 'Écoutez le Saint Coran avec les meilleurs récitateurs.',
};

export default function CoranPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCFB] text-[#1E2922] pb-[90px]">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#15703A]/5 to-[#2E9E44]/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#F5960F]/5 to-[#2E9E44]/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[430px] pt-8">
        <header className="mb-6 px-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#15703A] [font-family:var(--font-display)]">
            Coran
          </h1>
          <p className="mt-2 text-sm text-[#7A857D]">
            Trouvez la paix en écoutant la parole d'Allah
          </p>
        </header>

        <main className="px-4">
          <QuranAudioPlayer />
        </main>
      </div>

      <HikmaAppDock active="coran" />
    </div>
  );
}
