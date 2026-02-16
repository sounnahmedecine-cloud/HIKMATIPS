"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const CATEGORIES = [
    { id: "foi", label: "Foi & Tawakkul", emoji: "🕌", desc: "Confiance en Allah", slug: "foi" },
    { id: "patience", label: "Patience (Sabr)", emoji: "🛡️", desc: "Épreuves & endurance", slug: "patience" },
    { id: "effort", label: "Effort & Réussite", emoji: "💪", desc: "Travail halal, baraka", slug: "effort" },
    { id: "famille", label: "Famille & Mariage", emoji: "👨‍👩‍👧", desc: "Relations pieuses", slug: "famille" },
    { id: "sante", label: "Santé & Anxiété", emoji: "❤️", desc: "Corps/esprit, guérison", slug: "sante" },
    { id: "repentir", label: "Repentir (Tawba)", emoji: "🙏", desc: "Purification, pardon", slug: "repentir" },
];

export default function CategoriesPage() {
    const router = useRouter();

    return (
        <div className="min-h-full pb-32">
            <div className="mb-8 p-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-purple-50 mb-2">Catégories</h1>
                <p className="text-slate-500 dark:text-slate-400">Choisissez un thème pour vos rappels quotidiens.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {CATEGORIES.map((cat, index) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card
                            className="group hover:shadow-xl cursor-pointer border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all rounded-3xl overflow-hidden"
                            onClick={() => router.push(`/generate/${cat.slug}`)}
                        >
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                    <span className="text-3xl">{cat.emoji}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 dark:text-purple-50">{cat.label}</h3>
                                <p className="text-xs opacity-75 dark:text-purple-200/60 leading-tight">{cat.desc}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
