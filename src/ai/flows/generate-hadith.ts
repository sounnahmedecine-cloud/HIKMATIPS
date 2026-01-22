// 'use server'; // Disabled for static export
/**
 * @fileOverview Un flux Genkit pour générer du contenu inspirant.
 *
 * - generateHadith - Une fonction qui génère une citation et sa source en fonction d'une catégorie et d'un sujet.
 * - GenerateHadithInput - Le type d'entrée pour la fonction generateHadith.
 * - GenerateHadithOutput - Le type de retour pour la fonction generateHadith.
 */

import { z } from 'zod'; // Changed from 'genkit' to 'zod' if possible or keep using 'zod' directly if 'genkit' exports it.
// Actually 'genkit' likely exports z from zod. But to be safe and avoid genkit dep, I should import z from 'zod' if installed.
// Checking package.json... zod is installed: "zod": "^3.24.2"

const categoryLabels = {
  hadith: 'Hadith',
  sante: 'Conseil de Santé',
  sport: 'Conseil de Sport et Bien-être',
  coran: 'Verset du Coran',
};

export const GenerateHadithInputSchema = z.object({
  category: z
    .string()
    .describe(
      `La catégorie du contenu à générer. Peut être 'hadith', 'sante', 'sport', ou 'coran'.`
    ),
  topic: z
    .string()
    .optional()
    .describe('Le sujet ou thème spécifique pour la citation. Ex: "patience", "nutrition".'),
});
export type GenerateHadithInput = z.infer<typeof GenerateHadithInputSchema>;

export const GenerateHadithOutputSchema = z.object({
  content: z.string().describe('La citation ou le conseil généré.'),
  source: z.string().describe('La source de la citation (ex: "Boukhari", "Sourate Al-Baqarah, 286").'),
});
export type GenerateHadithOutput = z.infer<typeof GenerateHadithOutputSchema>;

export async function generateHadith(
  input: GenerateHadithInput
): Promise<GenerateHadithOutput> {
  // Mock implementation for static export / Capacitor
  console.log("Generating hadith (mock) for:", input);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mocks: Record<string, GenerateHadithOutput[]> = {
    hadith: [
      { content: "La richesse n'est pas la quantité de biens, mais la richesse est la richesse de l'âme.", source: "Boukhari" },
      { content: "Celui qui ne remercie pas les gens ne remercie pas Allah.", source: "Tirmidhi" }
    ],
    coran: [
      { content: "Et avec la difficulté, il y a certes une facilité.", source: "Sourate Ash-Sharh, 5-6" },
      { content: "Allah n'impose à aucune âme une charge supérieure à sa capacité.", source: "Sourate Al-Baqarah, 286" }
    ],
    sante: [
      { content: "Votre corps a des droits sur vous.", source: "Hadith (Boukhari)" },
      { content: "Mangez et buvez, mais ne commettez pas d'excès.", source: "Sourate Al-Araf, 31" }
    ],
    sport: [
      { content: "Le croyant fort est meilleur et plus aimé d'Allah que le croyant faible.", source: "Mouslim" }
    ]
  };

  const cat = input.category as keyof typeof mocks;
  const list = mocks[cat] || mocks.hadith;
  return list[Math.floor(Math.random() * list.length)];
}

