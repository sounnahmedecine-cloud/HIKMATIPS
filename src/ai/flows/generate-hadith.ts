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
  citadelle: LocalVerse[];
  authentiques: LocalHadith[];
  rabbana: LocalVerse[];
}

// Cache pour la base de données
let cachedDatabase: HadithDatabase | null = null;

async function loadDatabase(): Promise<HadithDatabase> {
  if (cachedDatabase) return cachedDatabase;

  try {
    const [hadithsResponse, citadelleResponse, authentiquesResponse, rabbanaResponse] = await Promise.all([
      fetch('/data/hadiths.json'),
      fetch('/data/hisn-al-muslim.json'),
      fetch('/data/hadiths-authentiques.json'),
      fetch('/data/rabbana.json')
    ]);

    if (!hadithsResponse.ok) throw new Error('Failed to load hadiths database');

    const hadithsData = await hadithsResponse.json();
    let citadelleData = { citadelle: [] };
    let authentiquesData = { hadiths: [] };
    let rabbanaData = { rabbana: [] };

    if (citadelleResponse.ok) citadelleData = await citadelleResponse.json();
    if (authentiquesResponse.ok) authentiquesData = await authentiquesResponse.json();
    if (rabbanaResponse.ok) rabbanaData = await rabbanaResponse.json();

    cachedDatabase = {
      ...hadithsData,
      ...citadelleData,
      authentiques: authentiquesData.hadiths,
      rabbana: rabbanaData.rabbana
    };
    return cachedDatabase!;
  } catch (error) {
    throw error;
  }
}

// Track recently shown items to avoid repeats
const recentlyShown = new Set<string>();
const MAX_RECENT = 10;

function getRandomItem<T extends { content: string }>(array: T[]): T {
  if (array.length <= 1) return array[0];

  // Filter out recently shown items
  const available = array.filter(item => !recentlyShown.has(item.content));

  // If all items were recently shown, clear history and use full array
  const pool = available.length > 0 ? available : array;

  const item = pool[Math.floor(Math.random() * pool.length)];

  // Track this item
  recentlyShown.add(item.content);
  if (recentlyShown.size > MAX_RECENT) {
    const first = recentlyShown.values().next().value;
    if (first) recentlyShown.delete(first);
  }

  return item;
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

const categoryLabels: Record<string, string> = {
  hadith: 'Hadith',
  ramadan: 'Conseil ou invocation du Ramadan',
  thematique: 'Verset coranique trouvé par l\'Agent',
  coran: 'Verset du Coran',
  citadelle: 'Citadelle du Musulman',
  'recherche-ia': 'Agent Hikma',
  rabbana: 'Les 40 Rabbana',
};

export const GenerateHadithInputSchema = z.object({
  category: z.string(),
  topic: z.string().optional(),
});
export type GenerateHadithInput = z.infer<typeof GenerateHadithInputSchema>;

export const GenerateHadithOutputSchema = z.object({
  arabe: z.string().optional(),
  content: z.string(),
  source: z.string(),
  surah: z.number().optional(),
  ayah: z.number().optional(),
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
      // Use the new authentic database for 'hadith' category too
      const source = db.authentiques.length > 0 ? db.authentiques : db.hadiths;
      const filtered = filterByTopic(source, topic);
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

    if (category === 'citadelle') {
      const filtered = filterByTopic(db.citadelle, topic);
      const item = getRandomItem(filtered);
      return { content: item.content, source: item.source };
    }

    if (category === 'rabbana') {
      const filtered = filterByTopic(db.rabbana, topic);
      const item = getRandomItem(filtered);
      return { content: item.content, source: item.source };
    }

    return null;
  } catch {
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

  const randomSeed = Math.random().toString(36).substring(7);
  const baseRules = `### RÈGLES OBLIGATOIRES :
- Utilise TOUJOURS "Allah" (JAMAIS "Dieu").
- Après le Prophète Muhammad, ajoute "(ﷺ)".
- LANGUE : Français uniquement.
- Réponds UNIQUEMENT en JSON valide.
- FORMAT : Retourne UN SEUL OBJET (pas de tableau).
- CONTENU STRICT : Le champ "content" doit contenir UNIQUEMENT le texte sacré. PAS D'EXPLICATION, PAS DE COMMENTAIRE.
- VARIÉTÉ : Token de hasard : ${randomSeed}. PROPOSE UN CONTENU DIFFÉRENT À CHAQUE FOIS.`;

  const getPrompt = () => {
    if (category === 'recherche-ia' || category === 'auto') {
      return `Tu es l'Agent Hikma, expert en sciences islamiques. L'utilisateur cherche une inspiration puissante sur : "${topic || 'un rappel au hasard'}". 
      
      TA MISSION : Trouve le rappel le plus PERCUTANT, UNIVERSEL et SPIRITUEL parmi ces sources AUTHENTIQUES :
      1. Un VERS DU CORAN (avec le texte arabe obligatoire).
      2. Un HADITH Court (Bukhari ou Muslim uniquement).
      3. Une INVOCATION (Citadelle du Musulman).
      4. Un CONSEIL ou RAPPEL sur le mois de RAMADAN.
      
      RÈGLES :
      - Le texte doit être court, percutant et parler au cœur (universel). Max 450 caractères.
      - Si le thème est une émotion, privilégie une Invocation ou un Verset.
      - Si le thème est un comportement, privilégie un Hadith.
      - Si le thème concerne le jeûne ou le mois sacré, privilégie le Ramadan.
      
      ${baseRules}
      
      {
        "arabe": "Texte en arabe (si verset ou courte invocation)",
        "content": "Le texte sacré en français uniquement",
        "source": "Référence précise (ex: Sourate 2, Verset 255 ou Sahih Bukhari n°...)",
        "surah": 0,
        "ayah": 0
      }`;
    }

    if (category === 'hadith') {
      return `Tu es un expert des Hadiths. Donne-moi UN hadith extrêmement PERCUTANT et UNIVERSEL issu EXCLUSIVEMENT de SAHIH AL-BUKHARI ou SAHIH MUSLIM.
${topic ? `Thème : ${topic}` : 'Choisis un thème varié et puissant : comportement, purification, aumône, mort, paradis, invocation.'}

IMPORTANT :
1. SOURCE STRICTE : Uniquement Sahih Al-Bukhari ou Sahih Muslim.
2. TONE : Le hadith doit être court et avoir un impact spirituel immédiat (max 450 caractères).
3. FORMAT : Pas d'explication. Juste le texte.

${baseRules}

{
  "content": "Le Prophète (ﷺ) a dit : \"...\"",
  "source": "Rapporté par Bukhari/Muslim, n°..."
}`;
    }

    if (category === 'ramadan') {
      return `Tu es un spécialiste du Ramadan. Donne-moi UN rappel STRICTEMENT lié au RAMADAN (Hadith ou Dua authentique).
${topic ? `Thème spécifique : ${topic}` : 'Choisis parmi : jeûne, iftar, récompenses, spirituel.'}

IMPORTANT : Le contenu doit être CONCIS (max 450 caractères) et porter exclusivement sur le mois de Ramadan.

${baseRules}

{
  "content": "Le texte en français",
  "source": "Source authentique (Bukhari, Muslim, Tirmidhi...)"
}`;
    }

    if (category === 'coran') {
      return `Tu es un guide expert du Coran. Donne-moi UN verset du Coran extrêmement PUISSANT, UNIVERSEL et PERCUTANT.
${topic ? `Thème : ${topic}` : 'Choisis un verset qui touche l\'âme.'}

IMPORTANT :
1. SOURCE STRICTE : Uniquement un verset du Saint Coran.
2. TEXTE ARABE : Inclus TOUJOURS le texte original en arabe.
3. IMPACT : Le verset doit être court et universellement inspirant (max 450 caractères).

${baseRules}

{
  "arabe": "Le texte en arabe",
  "content": "La traduction en français",
  "source": "Sourate X, Verset Y",
  "surah": 1,
  "ayah": 1
}`;
    }

    if (category === 'citadelle') {
      return `Tu es un expert de la "Citadelle du Musulman" (Hisn al-Muslim). Donne-moi UNE invocation précise issue de ce livre.
${topic ? `Thème : ${topic}` : 'Choisis une invocation puissante (matin, soir, protection, tristesse).'}

IMPORTANT :
1. SOURCE STRICTE : Doit provenir exclusivement de la Citadelle du Musulman.
2. TONE : Doit être une invocation directe (max 450 caractères).

${baseRules}

{
  "arabe": "Le texte en arabe",
  "content": "L'invocation en français",
  "source": "Citadelle du Musulman - [Chapitre]"
}`;
    }

    if (category === 'thematique') {
      return `Tu es l'Agent Hikma. Donne-moi une sagesse ou un rappel islamique PUISSANT sur le thème : "${topic || 'la vie'}".
Ceci peut être un verset, un hadith ou une parole de compagnon, mais cela doit être extrêmement percutant.

${baseRules}

{
  "content": "Le texte",
  "source": "La source exacte"
}`;
    }

    return `Donne-moi une citation islamique authentique sur ${topic || 'un thème inspirant'}.
${baseRules}
{
  "content": "Le texte",
  "source": "La source"
}`;
  };

  const prompt = getPrompt();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            response_schema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                source: { type: 'string' },
                surah: { type: 'number' },
                ayah: { type: 'number' }
              },
              required: ['content', 'source']
            },
            temperature: 0.8
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        }),
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || "Erreur lors de l'appel à Gemini";

    if (errorMessage.includes("leaked")) {
      throw new Error("Clé API Gemini bloquée. Veuillez générer une nouvelle clé sur Google AI Studio.");
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
      parsed = parsed[0];
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Le contenu parsé n'est pas un objet valide");
    }

    return GenerateHadithOutputSchema.parse(parsed);
  } catch {
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
  "source": "${hadithSource}",
  "surah": 1,
  "ayah": 1
}`;

  const analysisController = new AbortController();
  const analysisTimeoutId = setTimeout(() => analysisController.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: analysisController.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            response_schema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                source: { type: 'string' },
                surah: { type: 'number' },
                ayah: { type: 'number' }
              },
              required: ['content', 'source']
            },
            temperature: 0.3
          }
        }),
      }
    );
  } finally {
    clearTimeout(analysisTimeoutId);
  }

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

  // Priorité absolue à l'IA pour garantir un contenu "infini" et percutant
  // Sauf si on veut explicitement forcer le local (non implémenté ici pour maximiser l'expérience Agent)
  try {
    // 0. Pour la catégorie rabbana, on utilise uniquement la base locale
    if (category === 'rabbana') {
      const localResult = await generateFromLocal(category, topic);
      if (localResult) return localResult;
      throw new Error('Impossible de charger les Rabbana.');
    }

    // 1. Pour les thèmes spécifiques ou Agent Universel, on utilise toujours l'IA
    if (category === 'recherche-ia' || category === 'auto' || (category === 'thematique' && topic && topic.trim() !== '')) {
      if (topic) {
        const db = await loadDatabase();
        const localMatches = filterByTopic(db.authentiques, topic);
        if (localMatches.length > 0) {
          const randomMatch = getRandomItem(localMatches);
          // On passe par l'IA pour "formater" et garantir le ton percutant même pour le local
          return await generateAnalysisFromAI(randomMatch.content, randomMatch.source, topic || '');
        }
      }
      return await generateFromAI(category, topic);
    }

    // 2. Pour les catégories classiques (coran, hadith, ramadan, citadelle), 
    // on tente TOUJOURS l'IA en premier pour assurer la variété infinie demandée.
    return await generateFromAI(category, topic);

  } catch (error) {

    // Fallback vers la base locale uniquement si l'IA échoue
    const localResult = await generateFromLocal(category, topic);
    if (localResult) {
      return localResult;
    }

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
  } catch {
    return "Une erreur est survenue lors de l'explication.";
  }
}
