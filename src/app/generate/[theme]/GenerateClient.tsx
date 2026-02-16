"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Sparkles, ChevronLeft, Loader2 } from "lucide-react"
import { generateHadith } from "@/ai/flows/generate-hadith"

const SUBTAGS: Record<string, string[]> = {
    foi: ["Matin", "Soir", "Avant prières", "Crise de foi", "Nouveaux convertis"],
    patience: ["Perte job", "Maladie", "Échec exam", "Dispute famille", "Attente rizq"],
    effort: ["Lancement business", "Routine gym", "Apprentissage skill", "Éviter procrastination", "Examen", "Projet important"],
    famille: ["Mariage", "Enfants éducation", "Parents âgés", "Conflits couple"],
    sante: ["Stress/anxiété", "Fatigue chronique", "Insomnie", "Après opération"],
    repentir: ["Péché récurrent", "Culpabilité passée", "Recommencer fort"],
};

export function GenerateClient({ params }: { params: Promise<{ theme: string }> }) {
    const { theme } = use(params);
    const router = useRouter();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customNeed, setCustomNeed] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const subtags = SUBTAGS[theme] || [];

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : prev.length < 2 ? [...prev, tag] : prev
        );
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            console.log("Starting generation with theme:", theme, "tags:", selectedTags, "custom:", customNeed);

            const topic = `${theme} - ${selectedTags.join(', ')} ${customNeed ? ` - (${customNeed})` : ''}`;
            const categoryMapping: Record<string, string> = {
                'foi': 'thematique',
                'patience': 'thematique',
                'effort': 'thematique',
                'famille': 'thematique',
                'sante': 'thematique',
                'repentir': 'recherche-ia'
            };

            console.log("Calling generateHadith with category:", categoryMapping[theme], "topic:", topic);

            const result = await generateHadith({
                category: categoryMapping[theme] || 'thematique',
                topic: topic
            });

            console.log("Generation result:", result);

            localStorage.setItem('lastGeneratedHikma', JSON.stringify(result));
            router.push("/studio");
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Erreur lors de la génération. Vérifiez que votre clé API Gemini est configurée dans .env.local");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full pb-32 max-w-lg mx-auto p-4">
            <Button
                variant="ghost"
                className="mb-6 -ml-2 text-slate-500"
                onClick={() => router.back()}
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Retour
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-purple-50 mb-2 capitalize">
                    {theme}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Personnalisez votre Hikma en choisissant jusqu'à 2 tags.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
                {subtags.map((tag, index) => (
                    <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                    >
                        <Button
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTag(tag)}
                            className={selectedTags.includes(tag)
                                ? "bg-purple-400 hover:bg-purple-500 rounded-full px-5 h-10 border-none shadow-md text-white"
                                : "rounded-full px-5 h-10 border-purple-100 dark:border-purple-700 text-slate-600 dark:text-slate-300"}
                        >
                            {tag}
                        </Button>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Besoin spécifique ?
                </label>
                <Input
                    placeholder="Ex: 'anxiété avant voyage'"
                    value={customNeed}
                    onChange={(e) => setCustomNeed(e.target.value)}
                    className="w-full h-14 p-4 border-purple-100 dark:border-purple-700 rounded-2xl text-lg bg-white/50 dark:bg-slate-900/50 focus:ring-purple-400"
                />

                <Button
                    className="w-full mt-6 bg-purple-400 hover:bg-purple-500 h-16 rounded-2xl text-xl font-bold shadow-xl shadow-purple-400/20 group text-white"
                    onClick={handleGenerate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                    )}
                    Générer ma Hikma
                </Button>
            </div>
        </div>
    )
}
