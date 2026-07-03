import { z } from 'zod';
import { GEMINI_API_KEY } from '@/config/api-keys';
import { searchHadithByFragment, type DetailedHadith } from '@/lib/hadith-search';

// ─── Schema ────────────────────────────────────────────────────────

export const HadithSearchResultSchema = z.object({
    hadithComplet: z.string(),
    textArabe: z.string().optional(),
    source: z.string(),
    livre: z.string(),
    numero: z.number().optional(),
    explication: z.string().optional(),
    fiabilite: z.enum(['authentique', 'ia-verifie', 'non-verifie']),
});
export type HadithSearchResult = z.infer<typeof HadithSearchResultSchema>;

export interface AgentSearchResponse {
    results: HadithSearchResult[];
    totalFound: number;
    searchMethod: 'local' | 'ai' | 'mixed';
    query: string;
}

// ─── Local search ──────────────────────────────────────────────────

function mapLocalToResult(hadith: DetailedHadith): HadithSearchResult {
    return {
        hadithComplet: hadith.french,
        textArabe: undefined,
        source: hadith.source,
        livre: hadith.bookName || 'Recueil authentique',
        numero: hadith.hadithNumber || hadith.id,
        fiabilite: 'authentique',
    };
}

async function searchLocal(fragment: string): Promise<HadithSearchResult[]> {
    try {
        const localResults = await searchHadithByFragment(fragment, 15);
        return localResults.map(mapLocalToResult);
    } catch (error) {
        console.error('Local search error:', error);
        return [];
    }
}

// ─── AI search (Gemini fallback) ───────────────────────────────────

async function searchWithAI(
    fragment: string,
    localResults: HadithSearchResult[]
): Promise<HadithSearchResult[]> {
    const apiKey = GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Clé API Gemini manquante pour la recherche IA');
        return [];
    }

    const localContext = localResults.length > 0
        ? `\nJ'ai déjà trouvé ces résultats dans ma base locale :\n${localResults.slice(0, 3).map((r, i) =>
            `${i + 1}. "${r.hadithComplet.substring(0, 150)}..." — ${r.source}`
        ).join('\n')}\n\nSi un de ces résultats correspond, confirme-le. Sinon, trouve le bon hadith.`
        : '';

    const prompt = `Tu es un savant expert en sciences du hadith (Muhaddith).

L'étudiant cherche un hadith dont voici un fragment/début :
"${fragment}"
${localContext}

TA MISSION :
1. Identifie le hadith EXACT auquel ce fragment correspond.
2. Donne le texte COMPLET du hadith en français.
3. Si possible, donne le texte en arabe.
4. Donne la source PRÉCISE (livre, numéro du hadith).
5. Indique le livre d'origine.

### RÈGLES OBLIGATOIRES :
- Utilise TOUJOURS "Allah" (JAMAIS "Dieu").
- Après le Prophète Muhammad, ajoute "(ﷺ)".
- LANGUE du hadith : Français.
- Réponds UNIQUEMENT en JSON valide (un tableau d'objets).
- Donne entre 1 et 5 hadiths maximum, les plus pertinents.
- Si tu ne trouves AUCUN hadith correspondant, retourne un tableau vide [].
- NE FABRIQUE PAS de hadith. Si tu n'es pas sûr, indique-le.

FORMAT de chaque objet :
{
  "hadithComplet": "Le texte complet du hadith en français",
  "textArabe": "Le texte en arabe (si connu)",
  "source": "Référence précise (ex: Sahih al-Bukhari, Hadith n°6)",
  "livre": "Nom du recueil",
  "numero": 6,
  "fiabilite": "ia-verifie"
}

Réponds avec un tableau JSON uniquement.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return [];
        }

        const data = JSON.parse(await response.text());
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return [];

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
            parsed = [parsed];
        }

        return parsed
            .filter((item: any) => item && typeof item === 'object' && item.hadithComplet)
            .map((item: any) => ({
                hadithComplet: item.hadithComplet || '',
                textArabe: item.textArabe || undefined,
                source: item.source || 'Source non identifiée',
                livre: item.livre || 'Non identifié',
                numero: item.numero || undefined,
                fiabilite: 'ia-verifie' as const,
            }));
    } catch (error) {
        console.error('AI search error:', error);
        return [];
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── Main Agent Function ───────────────────────────────────────────

/**
 * Main entry point for the hadith search agent.
 * 1. Searches local database (6 authentic books, ~32K hadiths)
 * 2. If insufficient results, queries Gemini AI as fallback
 * 3. Deduplicates and returns sorted results
 */
export async function searchHadithAgent(
    fragment: string
): Promise<AgentSearchResponse> {
    if (!fragment || fragment.trim().length < 3) {
        return {
            results: [],
            totalFound: 0,
            searchMethod: 'local',
            query: fragment,
        };
    }

    const query = fragment.trim();

    // Step 1: Local search
    const localResults = await searchLocal(query);

    // Step 2: If local results are strong enough, return them
    if (localResults.length >= 5) {
        return {
            results: localResults,
            totalFound: localResults.length,
            searchMethod: 'local',
            query,
        };
    }

    // Step 3: AI fallback / enrichment
    const aiResults = await searchWithAI(query, localResults);

    // Step 4: Deduplicate (prefer local over AI)
    const localTexts = new Set(
        localResults.map(r => r.hadithComplet.toLowerCase().substring(0, 80))
    );

    const uniqueAiResults = aiResults.filter(
        ai => !localTexts.has(ai.hadithComplet.toLowerCase().substring(0, 80))
    );

    const combined = [...localResults, ...uniqueAiResults];

    return {
        results: combined,
        totalFound: combined.length,
        searchMethod: localResults.length > 0 && uniqueAiResults.length > 0
            ? 'mixed'
            : localResults.length > 0
                ? 'local'
                : 'ai',
        query,
    };
}

// ─── Explanation function ──────────────────────────────────────────

/**
 * Generates a pedagogical explanation of a hadith using Gemini AI.
 */
export async function explainHadith(
    hadithText: string,
    source: string
): Promise<string> {
    const apiKey = GEMINI_API_KEY;
    if (!apiKey) return "Clé API manquante.";

    const prompt = `Tu es un enseignant en sciences islamiques (Talib 'Ilm).
Explique ce hadith de manière pédagogique, simple et inspirante pour un étudiant.

HADITH : "${hadithText}"
SOURCE : ${source}

Ta réponse doit contenir :
1. **Le contexte** : Dans quelles circonstances ce hadith a été dit (si connu).
2. **Explication des termes clés** : Explique les mots ou concepts importants.
3. **Leçons à retenir** : 3 points clés pratiques pour la vie quotidienne.
4. **Conclusion spirituelle** : Un rappel court et inspirant.

Format : Markdown structuré. Pas de JSON.
Utilise "Allah" (jamais "Dieu"). Après le Prophète, ajoute (ﷺ).
Reste concis mais complet (environ 250 mots).`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.6 },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error in explainHadith:", response.status, errText);
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = JSON.parse(await response.text());
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Explication indisponible.";
    } catch (e: any) {
        console.error("Exception in explainHadith:", e);
        return "Une erreur est survenue lors de la génération de l'explication.";
    }
}
