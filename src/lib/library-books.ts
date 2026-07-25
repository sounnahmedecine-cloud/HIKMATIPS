import { getBasePath } from '@/lib/utils';

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverPath: string;
  pdfPath: string;
  shelfIndex: 0 | 1 | 2;
  slotIndex: 0 | 1 | 2;
}

// Le Coran — Arabe/Français est volontairement exclu pour l'instant : son PDF fait 97 Mo
// (probablement un scan plutôt que du texte), bien trop lourd pour être embarqué dans
// l'app. À réintégrer si une version plus légère est fournie — sa couverture reste dans
// public/bibilio/Coran-fr.png en attendant. Ça laisse 9 livres, repartis 3 par tablette.
export const LIBRARY_BOOKS: LibraryBook[] = [
  // Tablette du haut
  {
    id: 'preuves-unicite',
    title: "Les preuves de l'unicité — 50 questions sur la foi",
    author: "L'Imam Mohamed Ibn Abdel Wahab",
    coverPath: '/bibilio/covers/book-1-preuves-unicite.png',
    pdfPath: '/bibilio/50 questions-réponses sur la Aqida.pdf',
    shelfIndex: 0,
    slotIndex: 0,
  },
  {
    id: 'lecons-importantes',
    title: 'Les leçons importantes pour toute la communauté',
    author: 'Ibn Baz',
    coverPath: '/bibilio/covers/book-2-lecons-importantes.png',
    pdfPath: '/bibilio/Leçons importantes pour toute la communauté - Ibn Baz.pdf',
    shelfIndex: 0,
    slotIndex: 1,
  },
  {
    id: 'commentaire-lecons',
    title: 'Commentaire sur les leçons importantes pour toute la communauté',
    author: 'Ibn Baz',
    coverPath: '/bibilio/covers/book-3-commentaire-lecons.png',
    pdfPath: '/bibilio/Commentaire_sur_les_leçons_importantes_pour_toute_la_communauté.pdf',
    shelfIndex: 0,
    slotIndex: 2,
  },
  // Tablette du milieu
  {
    id: 'nawawi',
    title: "Charh des 40 Ahadîth de l'Imâm An-Nawâwî",
    author: "Al-'Uthaymîn",
    coverPath: '/bibilio/covers/book-4-nawawi.png',
    pdfPath: '/bibilio/Explication des 40 Nawawi.pdf',
    shelfIndex: 1,
    slotIndex: 0,
  },
  {
    id: 'kitab-tawhid',
    title: "Explication du livre Kitâb At-Tawhîd (le livre de l'unicité)",
    author: "Cheikh 'Abd Al-'Azîz ibn 'Abdoullah ibn Baz",
    coverPath: '/bibilio/covers/book-6-kitab-tawhid.png',
    pdfPath: '/bibilio/Kitab At Tawhid - Sheikh Ibn Baz.pdf',
    shelfIndex: 1,
    slotIndex: 1,
  },
  {
    id: 'repentir',
    title: 'Le repentir',
    author: "Cheikh Muhammad Ibn Sâlih Al-'Uthaymîn",
    coverPath: '/bibilio/covers/book-10-repentir.png',
    pdfPath: '/bibilio/Le repentir - Sheikh Al Outhaymin.pdf',
    shelfIndex: 1,
    slotIndex: 2,
  },
  // Tablette du bas
  {
    id: 'riyad-salihin',
    title: 'Riyâd As-Sâlihîn — Les jardins des vertueux',
    author: "L'imam An-Nawawi",
    coverPath: '/bibilio/covers/book-7-riyad-salihin.png',
    pdfPath: '/bibilio/Les jardin des vertueux (Riyad as salihine) en français.pdf',
    shelfIndex: 2,
    slotIndex: 0,
  },
  {
    id: 'veritable-confiance',
    title: 'La véritable confiance en Allah',
    author: "Cheikh 'Abd Ar-Razzâq Ibn 'Abd El-Muhsin Al 'Abbâd El-Badr",
    coverPath: '/bibilio/covers/book-8-veritable-confiance.png',
    pdfPath: '/bibilio/La véritable confiance en ALLAH - Sheikh Abderrazzaq el Badr.pdf',
    shelfIndex: 2,
    slotIndex: 1,
  },
  {
    id: 'ainsi-etaient',
    title: 'Ainsi étaient les pieux prédécesseurs pendant le Ramadan',
    author: "Shaykh Sa'îd Ibn Sâlim Ad-Dermaky",
    coverPath: '/bibilio/covers/book-9-ainsi-etaient.png',
    pdfPath: "/bibilio/Ainsi était nos pieux prédécesseurs pendant le Ramadan - Shaykh Sa'îd Ibn Sâlim Ad-Dermaky.pdf",
    shelfIndex: 2,
    slotIndex: 2,
  },
];

export function resolveAssetPath(path: string): string {
  return `${getBasePath()}${path}`;
}
