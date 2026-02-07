import { z } from 'zod';
import { GEMINI_API_KEY } from '@/config/api-keys';

// Types pour la base de données locale
interface LocalHadith {
  id: number;
  content: string;
  source: string;
  category: string;
  narrator?: string;
}

interface LocalVerse {
  id: number;
  content: string;
  source: string;
  category: string;
}

interface HadithDatabase {
  hadiths: LocalHadith[];
  quran_verses: LocalVerse[];
  ramadan_content: LocalVerse[];
}

// Cache pour la base de données
let cachedDatabase: HadithDatabase | null = null;

async function loadDatabase(): Promise<HadithDatabase> {
  if (cachedDatabase) return cachedDatabase;

  try {
    const response = await fetch('/data/hadiths.json');
    if (!response.ok) throw new Error('Failed to load database');
    cachedDatabase = await response.json();
    return cachedDatabase!;
  } catch (error) {
    console.error('Error loading local database:', error);
    throw error;
  }
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function filterByTopic<T extends { content: string; category: string }>(
  items: T[],
  topic?: string
): T[] {
  if (!topic) return items;

  const topicLower = topic.toLowerCase();
  const filtered = items.filter(item =>
    item.content.toLowerCase().includes(topicLower) ||
    item.category.toLowerCase().includes(topicLower)
  );

  return filtered.length > 0 ? filtered : items;
}

const categoryLabels = {
  hadith: 'Hadith',
  ramadan: 'Conseil ou invocation du Ramadan',
  'thematique': 'Verset coranique recherché par IA',
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

// Génération depuis la base locale
async function generateFromLocal(
  category: string,
  topic?: string
): Promise<GenerateHadithOutput | null> {
  try {
    const db = await loadDatabase();

    if (category === 'hadith') {
      const filtered = filterByTopic(db.hadiths, topic);
      const item = getRandomItem(filtered);
      return { content: item.content, source: item.source };
    }

    if (category === 'coran') {
      const filtered = filterByTopic(db.quran_verses, topic);
      const item = getRandomItem(filtered);
      return { content: item.content, source: item.source };
    }

    if (category === 'ramadan') {
      const filtered = filterByTopic(db.ramadan_content, topic);
      const item = getRandomItem(filtered);
      return { content: item.content, source: item.source };
    }

    return null;
  } catch (error) {
    console.error('Error generating from local:', error);
    return null;
  }
}

// Génération via IA (fallback ou recherche personnalisée)
async function generateFromAI(
  category: string,
  topic?: string
): Promise<GenerateHadithOutput> {
  const apiKey = GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Gemini manquante.");
  }

  const baseRules = `### RÈGLES OBLIGATOIRES :
- Utilise TOUJOURS "Allah" (JAMAIS "Dieu").
- Après le Prophète Muhammad, ajoute "(ﷺ)".
- LANGUE : Français uniquement.
- Réponds UNIQUEMENT en JSON valide.`;

  const getPromptByCategory = () => {
    if (category === 'hadith') {
      return `Tu es un spécialiste des hadiths authentiques. Donne-moi UN hadith CÉLÈBRE et AUTHENTIQUE.
${topic ? `Thème souhaité : ${topic}` : 'Choisis parmi les thèmes : bonté, patience, prière, parents, science, sincérité, frères en Islam.'}

${baseRules}

{
  "content": "Le hadith en français",
  "source": "Rapporté par Boukhari, n°XXXX"
}`;
    }

    if (category === 'ramadan') {
      return `Tu es un spécialiste du Ramadan. Donne-moi UN hadith ou UNE invocation AUTHENTIQUE sur le Ramadan.
${topic ? `Thème : ${topic}` : 'Choisis parmi : jeûne, iftar, suhur, Laylat al-Qadr, prière de nuit, récompenses du Ramadan.'}

${baseRules}

{
  "content": "Le hadith ou l'invocation en français",
  "source": "Rapporté par Boukhari, n°XXXX"
}`;
    }

    if (category === 'coran' || category === 'thematique') {
      return `Donne-moi UN verset du Coran en français.
${topic ? `Thème recherché : ${topic}` : 'Choisis un verset inspirant sur : foi, patience, miséricorde, gratitude, ou guidée.'}

${baseRules}

{
  "content": "Le verset traduit en français",
  "source": "Sourate Al-Nom (numéro), verset numéro"
}`;
    }

    return `Donne-moi une citation islamique authentique sur ${topic || 'un thème inspirant'}.
${baseRules}
{
  "content": "Le texte",
  "source": "La source"
}`;
  };

  const prompt = getPromptByCategory();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.7
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || "Erreur lors de l'appel à Gemini";
    console.error("Détails erreur Gemini:", errorData);

    if (errorMessage.includes("leaked")) {
      throw new Error("Clé API Gemini bloquée car elle a été divulguée (leaked). Veuillez générer une nouvelle clé sur Google AI Studio et mettre à jour votre fichier .env.local.");
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Réponse vide de Gemini");

  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    return GenerateHadithOutputSchema.parse(parsed);
  } catch (parseError) {
    console.error("Erreur de parsing JSON. Texte reçu:", text);
    throw new Error("Le format de réponse de l'IA est invalide.");
  }
}

export async function generateHadith(
  input: GenerateHadithInput
): Promise<GenerateHadithOutput> {
  const { category, topic } = input;

  // Pour "thematique" avec un thème spécifique, toujours utiliser l'IA
  if (category === 'thematique' && topic && topic.trim() !== '') {
    try {
      return await generateFromAI(category, topic);
    } catch (error) {
      console.error("AI generation failed, falling back to local:", error);
    }
  }

  // Essayer d'abord la base locale
  const localResult = await generateFromLocal(category, topic);
  if (localResult) {
    return localResult;
  }

  // Fallback vers l'IA si la base locale échoue
  try {
    return await generateFromAI(category, topic);
  } catch (error) {
    console.error("Erreur AI détaillée:", error);
    throw error;
  }
}
