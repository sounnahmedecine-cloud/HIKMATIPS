'use client';

import { motion } from 'framer-motion';
import { Rocket, Sparkles, CheckCircle2, ListChecks } from 'lucide-react';

export function UpdatesSection() {
    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 border border-primary/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Rocket className="h-32 w-32" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            <Rocket className="h-8 w-8 text-primary" />
                            Nouveautés & Prochaines Étapes
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                                    <Sparkles className="h-5 w-5" />
                                    Dernières mises à jour
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <span>Interface mobile-first optimisée</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <span>Recherche intelligente de Hadiths authentiques</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <span>Export HD pour Instagram et TikTok</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-accent">
                                    <ListChecks className="h-5 w-5" />
                                    Arrive bientôt
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full border-2 border-accent shrink-0 mt-0.5" />
                                        <span className="font-medium text-accent">Sauvegarde des messages dans votre profil</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">Plus de thèmes visuels premium</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">Multilingue (Arabe, Anglais)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
