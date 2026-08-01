class HikmaBook {
  const HikmaBook({
    required this.title,
    required this.subtitle,
    required this.assetPath,
    required this.coverAsset,
  });

  final String title;
  final String subtitle;
  final String assetPath;
  final String coverAsset;
}

const hikmaBooks = <HikmaBook>[
  HikmaBook(
    title: '50 questions-réponses sur la Aqida',
    subtitle: 'Document PDF hors ligne',
    assetPath: 'assets/books/aqida.pdf',
    coverAsset: 'assets/book_covers/book-1-preuves-unicite.png',
  ),
  HikmaBook(
    title: 'Leçons importantes pour toute la communauté',
    subtitle: 'Shaykh Ibn Bāz',
    assetPath: 'assets/books/lecons-importantes.pdf',
    coverAsset: 'assets/book_covers/book-2-lecons-importantes.png',
  ),
  HikmaBook(
    title: 'Commentaire des leçons importantes',
    subtitle: 'Document PDF hors ligne',
    assetPath: 'assets/books/commentaire-lecons.pdf',
    coverAsset: 'assets/book_covers/book-3-commentaire-lecons.png',
  ),
  HikmaBook(
    title: 'Explication des 40 hadiths An-Nawawi',
    subtitle: 'Document PDF hors ligne',
    assetPath: 'assets/books/40-nawawi.pdf',
    coverAsset: 'assets/book_covers/book-4-nawawi.png',
  ),
  HikmaBook(
    title: 'Kitab At-Tawhid',
    subtitle: 'Shaykh Ibn Bāz',
    assetPath: 'assets/books/kitab-tawhid.pdf',
    coverAsset: 'assets/book_covers/book-6-kitab-tawhid.png',
  ),
  HikmaBook(
    title: 'Les Jardins des vertueux',
    subtitle: 'Riyad As-Salihin · français',
    assetPath: 'assets/books/riyad-salihin.pdf',
    coverAsset: 'assets/book_covers/book-7-riyad-salihin.png',
  ),
  HikmaBook(
    title: 'La véritable confiance en Allah',
    subtitle: 'Shaykh Abderrazzaq Al-Badr',
    assetPath: 'assets/books/confiance-allah.pdf',
    coverAsset: 'assets/book_covers/book-8-veritable-confiance.png',
  ),
  HikmaBook(
    title: 'Le repentir',
    subtitle: 'Shaykh Al-Outhaymin',
    assetPath: 'assets/books/repentir.pdf',
    coverAsset: 'assets/book_covers/book-10-repentir.png',
  ),
  HikmaBook(
    title: 'Les pieux prédécesseurs pendant Ramadan',
    subtitle: 'Shaykh Sa’îd Ibn Sâlim Ad-Dermaky',
    assetPath: 'assets/books/pieux-predecesseurs-ramadan.pdf',
    coverAsset: 'assets/book_covers/book-9-ainsi-etaient.png',
  ),
];
