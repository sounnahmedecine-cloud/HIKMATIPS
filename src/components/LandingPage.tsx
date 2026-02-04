'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const scrollToApp = () => {
    setShowGenerator(true);
    setTimeout(() => {
      document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/dhjwimevi/image/upload/v1770072891/ChatGPT_Image_2_f%C3%A9vr._2026_23_43_44_edeg9a.png"
              alt="HikmaClips"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-hikma-gradient">HikmaClips</span>
          </div>
          <div className="flex items-center gap-4">
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
              Générateur de contenu islamique
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Créez des{' '}
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
            >
              <ArrowDown className="h-8 w-8 animate-bounce mx-auto" />
            </button>
          </motion.div>
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
              HikmaClips simplifie la création de contenu islamique de qualité
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
                icon: Instagram,
                title: 'Créateurs de contenu',
                description: 'Pages Instagram, TikTok, YouTube dédiées au contenu islamique',
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
              'Génération par IA pour des thèmes personnalisés',
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à créer votre premier{' '}
            <span className="text-hikma-gradient">HikmaClip</span> ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Commencez gratuitement, sans inscription obligatoire.
          </p>
          <Button
            onClick={scrollToApp}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Lancer l'application
          </Button>
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
                <p className="text-lg font-medium mb-4">Prêt à créer votre HikmaClip ?</p>
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

      {/* Footer */}
      <footer className="border-t py-12 px-4">
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
              © {new Date().getFullYear()} HikmaClips · Créé par{' '}
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
