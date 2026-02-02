import { z } from 'zod';

const categoryLabels = {
  hadith: 'Hadith',
  ramadan: 'Conseil ou invocation du Ramadan',
  'recherche-ia': 'Verset coranique recherché par IA',
  coran: 'Verset du Coran',
};

export const GenerateHadithInputSchema = z.object({
  category: z.string(),
  topic: z.string().optional(),
});
export type GenerateHadithInput = z.infer<typeof GenerateHadithInputSchema>;

export const GenerateHadithOutputSchema = z.object({
  content: z.string(),
  source: z.string(),
});
export type GenerateHadithOutput = z.infer<typeof GenerateHadithOutputSchema>;

export async function generateHadith(
  input: GenerateHadithInput
): Promise<GenerateHadithOutput> {
  const { category, topic } = input;
  const label = categoryLabels[category as keyof typeof categoryLabels] || category;

  // Use NEXT_PUBLIC_ for client-side access in static export
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey || apiKey === 'VOTRE_CLE_API_ICI') {
    throw new Error("Clé API Gemini manquante. Veuillez configurer NEXT_PUBLIC_GOOGLE_GENAI_API_KEY.");
  }

  const prompt = `Tu es un expert rigoureux en sciences islamiques et en spiritualité musulmane.
Ton objectif est de fournir une citation ou un conseil court pour la catégorie : ${label}.
${topic ? `Thème : ${topic}.` : 'Choisis un thème inspirant.'}

### CONVENTIONS ISLAMIQUES OBLIGATOIRES :
- Utilise TOUJOURS le nom "Allah" (jamais "Dieu" seul).
- Après toute mention du Prophète Muhammad, ajoute TOUJOURS "(ﷺ)" (Salla Allahou Alayhi wa Sallam).
- Après toute mention d'un autre prophète, ajoute "(عليه السلام)".
- Pour les compagnons, ajoute "(رضي الله عنه)" la première fois.

### CONSIGNES DE SÉCURITÉ CRITIQUES :
1. **ZÉRO COMMENTAIRE** : Si la catégorie est "Hadith", "Verset du Coran" ou "Verset coranique recherché par IA", tu dois renvoyer UNIQUEMENT le texte original. Interdiction formelle d'ajouter des phrases personnelles dans le champ "content".
2. **AUTHENTICITÉ** : Ne cite que des sources dont tu es sûr. Pour les Hadiths, privilégie Sahih Boukhari ou Sahih Muslim. Pour le Coran, indique toujours la sourate et le numéro du verset.
3. **SÉPARATION** : Le champ "content" contient la citation exacte. Le champ "source" contient uniquement la référence (Auteur, Recueil, Chapitre/Verset).
4. **LANGUE** : Tout doit être en Français.
5. **RAMADAN** : Si la catégorie est "Ramadan", fournis des invocations (douas), des conseils spirituels ou des hadiths authentiques liés au jeûne, à la prière nocturne (Tarawih), à la générosité et à la piété pendant le Ramadan.
6. **RECHERCHE IA** : Si la catégorie est "Verset coranique recherché par IA", recherche un verset du Coran correspondant au thème demandé. Fournis le texte traduit en français avec la référence exacte (Sourate, verset).

Réponds EXCLUSIVEMENT en JSON sous ce format :
{
  "content": "Le texte exact et authentique de la citation.",
  "source": "La source précise (ex: Rapporté par Muslim, 2664 ou Sourate Al-Baqara, verset 183)"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 1
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Détails erreur Gemini:", errorData);
      throw new Error(errorData.error?.message || "Erreur lors de l'appel à Gemini");
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Réponse vide de Gemini");

    // Nettoyage au cas où l'IA retourne des backticks markdown (```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      return GenerateHadithOutputSchema.parse(parsed);
    } catch (parseError) {
      console.error("Erreur de parsing JSON. Texte reçu:", text);
      throw new Error("Le format de réponse de l'IA est invalide.");
    }
  } catch (error) {
    console.error("Erreur AI détaillée:", error);
    throw error;
  }
}

