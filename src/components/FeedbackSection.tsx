'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function FeedbackSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [questionnaireData, setQuestionnaireData] = useState({
        origine: '',
        facilite: 3,
        attente: '',
        plusUtile: '',
        moinsUtile: '',
        plusHadiths: 'oui',
        propresRappels: 'oui',
        contribuer: 'non',
        enseignement: 'oui',
        commentaires: '',
    });

    const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { firestore } = initializeFirebase();
            await addDoc(collection(firestore, 'tester_feedback'), {
                ...questionnaireData,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Merci pour votre participation !",
                description: "Vos retours nous aident énormément à améliorer HikmaClips.",
            });

            setQuestionnaireData({
                origine: '',
                facilite: 3,
                attente: '',
                plusUtile: '',
                moinsUtile: '',
                plusHadiths: 'oui',
                propresRappels: 'oui',
                contribuer: 'non',
                enseignement: 'oui',
                commentaires: '',
            });
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Questionnaire Testeurs & Visiteurs</h2>
                    <p className="text-muted-foreground text-lg">
                        Prenez 5 minutes pour nous aider à faire de HikmaClips un outil d'excellence.
                        Chaque retour est une brique pour l'avenir du projet.
                    </p>
                </div>

                <Card className="border-none shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary text-primary-foreground p-8">
                        <CardTitle className="text-2xl flex items-center gap-3">
                            <MessageCircle className="h-6 w-6" />
                            Dites-nous tout
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                            "Quiconque fait un atome de bien le verra" — Vos conseils sont précieux.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleQuestionnaireSubmit} className="space-y-10">
                            {/* 1. Origine */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">1. Comment avez-vous connu HIKMATIPS ?</Label>
                                <RadioGroup
                                    value={questionnaireData.origine}
                                    onValueChange={(v) => setQuestionnaireData({ ...questionnaireData, origine: v })}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                                >
                                    {['TikTok', 'WhatsApp', 'Facebook', 'Proche', 'Autre'].map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                                            <RadioGroupItem value={opt.toLowerCase()} id={`org-${opt}`} />
                                            <Label htmlFor={`org-${opt}`} className="cursor-pointer font-normal">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* 2. Facilité */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-lg font-semibold">2. Facilité d'utilisation</Label>
                                    <span className="text-2xl font-bold text-primary">{questionnaireData.facilite}/5</span>
                                </div>
                                <Slider
                                    value={[questionnaireData.facilite]}
                                    min={1}
                                    max={5}
                                    step={1}
                                    onValueChange={(v) => setQuestionnaireData({ ...questionnaireData, facilite: v[0] })}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Très difficile</span>
                                    <span>Très facile</span>
                                </div>
                            </div>

                            {/* 3, 4, 5. Questions ouvertes courtes */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">3. Quel ajout attendez-vous le plus ?</Label>
                                    <Input
                                        placeholder="Ex: Favoris, recherche avancée..."
                                        value={questionnaireData.attente}
                                        onChange={(e) => setQuestionnaireData({ ...questionnaireData, attente: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">4. Quelle fonction est la plus utile ?</Label>
                                    <Input
                                        placeholder="Ex: Le générateur de hadiths..."
                                        value={questionnaireData.plusUtile}
                                        onChange={(e) => setQuestionnaireData({ ...questionnaireData, plusUtile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">5. Quelle fonction est la moins utile ?</Label>
                                <Input
                                    placeholder="Écrivez ici..."
                                    value={questionnaireData.moinsUtile}
                                    onChange={(e) => setQuestionnaireData({ ...questionnaireData, moinsUtile: e.target.value })}
                                />
                            </div>

                            {/* 6, 7, 8, 9. Questions Oui/Non */}
                            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                                {[
                                    { key: 'plusHadiths', label: '6. Souhaitez-vous plus de Hadiths ?' },
                                    { key: 'propresRappels', label: '7. Pouvoir incruster vos propres rappels ?' },
                                    { key: 'contribuer', label: '8. Voulez-vous contribuer à la base de données ?' },
                                    { key: 'enseignement', label: '9. Voulez-vous une section "Enseignement" ?' },
                                ].map((q) => (
                                    <div key={q.key} className="space-y-3">
                                        <Label className="font-semibold block">{q.label}</Label>
                                        <RadioGroup
                                            value={(questionnaireData as any)[q.key]}
                                            onValueChange={(v) => setQuestionnaireData({ ...questionnaireData, [q.key]: v })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2 border px-4 py-2 rounded-lg">
                                                <RadioGroupItem value="oui" id={`${q.key}-oui`} />
                                                <Label htmlFor={`${q.key}-oui`}>Oui</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 border px-4 py-2 rounded-lg">
                                                <RadioGroupItem value="non" id={`${q.key}-non`} />
                                                <Label htmlFor={`${q.key}-non`}>Non</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>

                            {/* 10. Commentaires */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">10. Autres suggestions ou commentaires ?</Label>
                                <Textarea
                                    placeholder="Votre avis nous aide à grandir..."
                                    className="min-h-[120px]"
                                    value={questionnaireData.commentaires}
                                    onChange={(e) => setQuestionnaireData({ ...questionnaireData, commentaires: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full text-lg h-14 bg-gradient-to-r from-primary to-accent"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Envoi en cours..." : "Soumettre mon questionnaire"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
