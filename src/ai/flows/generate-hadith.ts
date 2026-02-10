import { z } from 'zod';
import { GEMINI_API_KEY } from '@/config/api-keys';
import { searchHadiths } from '@/lib/hadith-search';

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
  'thematique': 'Verset coranique trouvé par l\'Agent',
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
- Réponds UNIQUEMENT en JSON valide.
- FORMAT : Retourne UN SEUL OBJET (pas de tableau).
- CONTENU STRICT : Le champ "content" doit contenir UNIQUEMENT le texte sacré. PAS D'EXPLICATION, PAS DE COMMENTAIRE.`;

  const getPromptByCategory = () => {
    if (category === 'hadith') {
      return `Tu es un spécialiste des hadiths authentiques. Donne-moi UN hadith CÉLÈBRE et AUTHENTIQUE.
${topic ? `Thème souhaité : ${topic}` : 'Choisis parmi les thèmes : bonté, patience, prière, parents, science, sincérité, frères en Islam.'}

IMPORTANT : Le hadith doit être COURT et COMPLET (maximum 300 caractères).
Privilégie les hadiths concis et percutants plutôt que les longs récits.
Si le hadith d'origine est long, cite uniquement la partie essentielle avec "(...)" pour indiquer l'abréviation.

FORMAT OBLIGATOIRE : Commence le texte par "Le Prophète (ﷺ) a dit :" suivi du hadith entre guillemets.
EXCLUSION : Ne mets pas la chaîne de rapporteurs (isnad) au début. Uniquement les paroles du Prophète.

${baseRules}

{
  "content": "Le Prophète (ﷺ) a dit : \"Le hadith...\"",
  "source": "Rapporté par Boukhari, n°XXXX"
}`;
    }

    if (category === 'ramadan') {
      return `Tu es un spécialiste du Ramadan. Donne-moi UN hadith ou UNE invocation AUTHENTIQUE sur le Ramadan.
${topic ? `Thème : ${topic}` : 'Choisis parmi : jeûne, iftar, suhur, Laylat al-Qadr, prière de nuit, récompenses du Ramadan.'}

IMPORTANT : Le hadith/invocation doit être CONCIS (maximum 300 caractères).
Privilégie les invocations courtes et percutantes.

${baseRules}

{
  "content": "Le hadith ou l'invocation en français (max 300 caractères)",
  "source": "Rapporté par Boukhari, n°XXXX"
}`;
    }

    if (category === 'coran' || category === 'thematique') {
      return `Donne-moi UN verset du Coran en français.
${topic ? `Thème recherché : ${topic}` : 'Choisis un verset inspirant sur : foi, patience, miséricorde, gratitude, ou guidée.'}

IMPORTANT : Choisis un verset COURT et PERCUTANT (maximum 250 caractères).
Si le verset complet est long, cite uniquement la partie la plus inspirante avec "(...)"

${baseRules}

{
  "content": "Le verset traduit en français (max 250 caractères)",
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              source: { type: 'string' }
            },
            required: ['content', 'source']
          },
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
    let parsed = JSON.parse(text);

    // Si l'IA renvoie un tableau au lieu d'un objet (cela arrive parfois avec certains modèles),
    // on prend le premier élément du tableau.
    if (Array.isArray(parsed)) {
      console.warn("L'IA a renvoyé un tableau au lieu d'un objet, utilisation du premier élément.");
      parsed = parsed[0];
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Le contenu parsé n'est pas un objet valide");
    }

    return GenerateHadithOutputSchema.parse(parsed);
  } catch (parseError) {
    console.error("Erreur de parsing ou de validation JSON. Texte reçu:", text);
    console.error("Détails de l'erreur:", parseError);
    throw new Error("Le format de réponse de l'IA est invalide.");
  }
}



// Analyse d'un hadith spécifique via IA
async function generateAnalysisFromAI(
  hadithContent: string,
  hadithSource: string,
  userQuery: string
): Promise<GenerateHadithOutput> {
  const apiKey = GEMINI_API_KEY;

  const prompt = `Tu es un savant spécialiste du hadith.
L'utilisateur a fait une recherche sur : "${userQuery}".
J'ai trouvé ce hadith dans les recueils authentiques :
"${hadithContent}"
Source : ${hadithSource}

Ta mission :
1. Si le hadith est COURT (moins de 300 caractères), reprends-le tel quel.
2. Si le hadith est LONG (plus de 300 caractères), RÉSUME-LE en gardant l'ESSENTIEL du message.
3. Le résultat final doit être CONCIS et COMPLET (maximum 300 caractères).
4. NE RAJOUTE AUCUNE EXPLICATION, JUSTE le texte du hadith (ou sa version abrégée).
5. Si tu abréges, utilise "(...)" pour indiquer les parties omises.

### RÈGLES OBLIGATOIRES :
- Utilise "Allah" (JAMAIS "Dieu").
- LANGUE : Français uniquement.
- FORMAT OBLIGATOIRE : Le texte DOIT commencer par "Le Prophète (ﷺ) a dit :" suivi du hadith entre guillemets.
- Pas de contexte narratif initial.
- Réponds UNIQUEMENT en JSON.

{
  "content": "Le texte du hadith (max 300 caractères)",
  "source": "${hadithSource}"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.3
        }
      }),
    }
  );

  if (!response.ok) throw new Error("Erreur AI");

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(text);

  return GenerateHadithOutputSchema.parse(parsed);
}

export async function generateHadith(
  input: GenerateHadithInput
): Promise<GenerateHadithOutput> {
  const { category, topic } = input;

  // Si c'est une recherche IA avec un thème, on essaie de trouver un hadith authentique dans nos 9 livres
  if (category === 'recherche-ia' && topic && topic.trim() !== '') {
    try {
      // Dans un environnement client-side, on fait la recherche
      const localMatches = await searchHadiths(topic);

      if (localMatches.length > 0) {
        // On prend le meilleur match ou on envoie les top matches à l'IA pour synthèse
        // Pour l'instant, on prend le premier
        const bestMatch = localMatches[0];

        // Optionnel: Demander à l'IA d'analyser ce hadith spécifique
        return await generateAnalysisFromAI(bestMatch.french, bestMatch.source, topic);
      }
    } catch (error) {
      console.error("Local search failed for AI research:", error);
    }
  }

  // Pour "thematique" avec un thème spécifique, toujours utiliser l'Agent
  if (category === 'thematique' && topic && topic.trim() !== '') {
    try {
      return await generateFromAI(category, topic);
    } catch (error) {
      console.error("Agent Hikma generation failed, falling back to local:", error);
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

// Nouvelle fonction pour le mode "Étudiant" sur la Landing Page (Explications détaillées)
export async function generateExplanation(
  hadithContent: string,
  hadithSource: string
): Promise<string> {
  const apiKey = GEMINI_API_KEY;

  if (!apiKey) return "Clé API manquante.";

  const prompt = `Tu es un enseignant en sciences islamiques (Talib 'Ilm).
Explique ce hadith de manière pédagogique, simple et inspirante pour un étudiant.

HADITH : "${hadithContent}"
SOURCE : ${hadithSource}

Ta réponse doit contenir :
1. Le contexte (s'il est connu/pertinent).
2. L'explication des termes clés.
3. Les leçons à en tirer (3 points clés).
4. Une conclusion spirituelle courte.

Format : Markdown bien structuré. Pas de JSON. Réponds directement en texte.
Reste concis mais complet (environ 200 mots).`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7
          }
        }),
      }
    );

    if (!response.ok) throw new Error("Erreur AI Explication");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "Impossible de générer une explication.";
  } catch (error) {
    console.error("Erreur explication:", error);
    return "Une erreur est survenue lors de l'explication.";
  }
}
