import { getBasePath } from '@/lib/utils';

export interface Surah {
  id: number;
  nameArabic: string;
  nameFr: string;
  nameSimple: string;
  versesCount: number;
  startPage: number;
  endPage: number;
  revelationPlace: 'makkah' | 'madinah';
}

export interface Reciter {
  id: string;
  name: string;
  server: string;
}

export const MUSHAF_TOTAL_PAGES = 604;

export const RECITERS: Reciter[] = [
  { id: 'muaiqly', name: 'Maher Al Muaiqly', server: 'https://server12.mp3quran.net/maher/' },
  { id: 'ajaber', name: 'Ali Jaber', server: 'https://server11.mp3quran.net/a_jbr/' },
  { id: 'shatri', name: 'Abou Bakr Al Shatri', server: 'https://server11.mp3quran.net/shatri/' },
];

export const SURAHS: Surah[] = [
  { id: 1, nameArabic: "الفاتحة", nameFr: "L'ouverture", nameSimple: "Al-Fatihah", versesCount: 7, startPage: 1, endPage: 1, revelationPlace: "makkah" },
  { id: 2, nameArabic: "البقرة", nameFr: "La vache", nameSimple: "Al-Baqarah", versesCount: 286, startPage: 2, endPage: 49, revelationPlace: "madinah" },
  { id: 3, nameArabic: "آل عمران", nameFr: "La famille de 'imran", nameSimple: "Ali 'Imran", versesCount: 200, startPage: 50, endPage: 76, revelationPlace: "madinah" },
  { id: 4, nameArabic: "النساء", nameFr: "Les femmes", nameSimple: "An-Nisa", versesCount: 176, startPage: 77, endPage: 106, revelationPlace: "madinah" },
  { id: 5, nameArabic: "المائدة", nameFr: "La table servie", nameSimple: "Al-Ma'idah", versesCount: 120, startPage: 106, endPage: 127, revelationPlace: "madinah" },
  { id: 6, nameArabic: "الأنعام", nameFr: "Les bestiaux", nameSimple: "Al-An'am", versesCount: 165, startPage: 128, endPage: 150, revelationPlace: "makkah" },
  { id: 7, nameArabic: "الأعراف", nameFr: "Al-A'raf", nameSimple: "Al-A'raf", versesCount: 206, startPage: 151, endPage: 176, revelationPlace: "makkah" },
  { id: 8, nameArabic: "الأنفال", nameFr: "Le butin", nameSimple: "Al-Anfal", versesCount: 75, startPage: 177, endPage: 186, revelationPlace: "madinah" },
  { id: 9, nameArabic: "التوبة", nameFr: "Le repentir", nameSimple: "At-Tawbah", versesCount: 129, startPage: 187, endPage: 207, revelationPlace: "madinah" },
  { id: 10, nameArabic: "يونس", nameFr: "Jonas", nameSimple: "Yunus", versesCount: 109, startPage: 208, endPage: 221, revelationPlace: "makkah" },
  { id: 11, nameArabic: "هود", nameFr: "Houd", nameSimple: "Hud", versesCount: 123, startPage: 221, endPage: 235, revelationPlace: "makkah" },
  { id: 12, nameArabic: "يوسف", nameFr: "Joseph", nameSimple: "Yusuf", versesCount: 111, startPage: 235, endPage: 248, revelationPlace: "makkah" },
  { id: 13, nameArabic: "الرعد", nameFr: "Le tonnerre", nameSimple: "Ar-Ra'd", versesCount: 43, startPage: 249, endPage: 255, revelationPlace: "madinah" },
  { id: 14, nameArabic: "ابراهيم", nameFr: "Abraham", nameSimple: "Ibrahim", versesCount: 52, startPage: 255, endPage: 261, revelationPlace: "makkah" },
  { id: 15, nameArabic: "الحجر", nameFr: "Al-Hijr", nameSimple: "Al-Hijr", versesCount: 99, startPage: 262, endPage: 267, revelationPlace: "makkah" },
  { id: 16, nameArabic: "النحل", nameFr: "Les abeilles", nameSimple: "An-Nahl", versesCount: 128, startPage: 267, endPage: 281, revelationPlace: "makkah" },
  { id: 17, nameArabic: "الإسراء", nameFr: "Le voyage nocturne", nameSimple: "Al-Isra", versesCount: 111, startPage: 282, endPage: 293, revelationPlace: "makkah" },
  { id: 18, nameArabic: "الكهف", nameFr: "La caverne", nameSimple: "Al-Kahf", versesCount: 110, startPage: 293, endPage: 304, revelationPlace: "makkah" },
  { id: 19, nameArabic: "مريم", nameFr: "Marie", nameSimple: "Maryam", versesCount: 98, startPage: 305, endPage: 312, revelationPlace: "makkah" },
  { id: 20, nameArabic: "طه", nameFr: "Ta-Ha", nameSimple: "Taha", versesCount: 135, startPage: 312, endPage: 321, revelationPlace: "makkah" },
  { id: 21, nameArabic: "الأنبياء", nameFr: "Les prophètes", nameSimple: "Al-Anbya", versesCount: 112, startPage: 322, endPage: 331, revelationPlace: "makkah" },
  { id: 22, nameArabic: "الحج", nameFr: "Le pèlerinage", nameSimple: "Al-Hajj", versesCount: 78, startPage: 332, endPage: 341, revelationPlace: "madinah" },
  { id: 23, nameArabic: "المؤمنون", nameFr: "Les croyants", nameSimple: "Al-Mu'minun", versesCount: 118, startPage: 342, endPage: 349, revelationPlace: "makkah" },
  { id: 24, nameArabic: "النور", nameFr: "La lumière", nameSimple: "An-Nur", versesCount: 64, startPage: 350, endPage: 359, revelationPlace: "madinah" },
  { id: 25, nameArabic: "الفرقان", nameFr: "Le discernement", nameSimple: "Al-Furqan", versesCount: 77, startPage: 359, endPage: 366, revelationPlace: "makkah" },
  { id: 26, nameArabic: "الشعراء", nameFr: "Les poètes", nameSimple: "Ash-Shu'ara", versesCount: 227, startPage: 367, endPage: 376, revelationPlace: "makkah" },
  { id: 27, nameArabic: "النمل", nameFr: "Les fourmis", nameSimple: "An-Naml", versesCount: 93, startPage: 377, endPage: 385, revelationPlace: "makkah" },
  { id: 28, nameArabic: "القصص", nameFr: "Le récit", nameSimple: "Al-Qasas", versesCount: 88, startPage: 385, endPage: 396, revelationPlace: "makkah" },
  { id: 29, nameArabic: "العنكبوت", nameFr: "L'araignée", nameSimple: "Al-'Ankabut", versesCount: 69, startPage: 396, endPage: 404, revelationPlace: "makkah" },
  { id: 30, nameArabic: "الروم", nameFr: "Les romains", nameSimple: "Ar-Rum", versesCount: 60, startPage: 404, endPage: 410, revelationPlace: "makkah" },
  { id: 31, nameArabic: "لقمان", nameFr: "Louqman", nameSimple: "Luqman", versesCount: 34, startPage: 411, endPage: 414, revelationPlace: "makkah" },
  { id: 32, nameArabic: "السجدة", nameFr: "La prosternation", nameSimple: "As-Sajdah", versesCount: 30, startPage: 415, endPage: 417, revelationPlace: "makkah" },
  { id: 33, nameArabic: "الأحزاب", nameFr: "Les coalisés", nameSimple: "Al-Ahzab", versesCount: 73, startPage: 418, endPage: 427, revelationPlace: "madinah" },
  { id: 34, nameArabic: "سبإ", nameFr: "Saba'", nameSimple: "Saba", versesCount: 54, startPage: 428, endPage: 434, revelationPlace: "makkah" },
  { id: 35, nameArabic: "فاطر", nameFr: "Le Créateur", nameSimple: "Fatir", versesCount: 45, startPage: 434, endPage: 440, revelationPlace: "makkah" },
  { id: 36, nameArabic: "يس", nameFr: "Ya-Sin", nameSimple: "Ya-Sin", versesCount: 83, startPage: 440, endPage: 445, revelationPlace: "makkah" },
  { id: 37, nameArabic: "الصافات", nameFr: "Les rangés", nameSimple: "As-Saffat", versesCount: 182, startPage: 446, endPage: 452, revelationPlace: "makkah" },
  { id: 38, nameArabic: "ص", nameFr: "Sad", nameSimple: "Sad", versesCount: 88, startPage: 453, endPage: 458, revelationPlace: "makkah" },
  { id: 39, nameArabic: "الزمر", nameFr: "Les groupes", nameSimple: "Az-Zumar", versesCount: 75, startPage: 458, endPage: 467, revelationPlace: "makkah" },
  { id: 40, nameArabic: "غافر", nameFr: "Le Pardonneur", nameSimple: "Ghafir", versesCount: 85, startPage: 467, endPage: 476, revelationPlace: "makkah" },
  { id: 41, nameArabic: "فصلت", nameFr: "Les versets explicites", nameSimple: "Fussilat", versesCount: 54, startPage: 477, endPage: 482, revelationPlace: "makkah" },
  { id: 42, nameArabic: "الشورى", nameFr: "La concertation", nameSimple: "Ash-Shuraa", versesCount: 53, startPage: 483, endPage: 489, revelationPlace: "makkah" },
  { id: 43, nameArabic: "الزخرف", nameFr: "L'ornement", nameSimple: "Az-Zukhruf", versesCount: 89, startPage: 489, endPage: 495, revelationPlace: "makkah" },
  { id: 44, nameArabic: "الدخان", nameFr: "La fumée", nameSimple: "Ad-Dukhan", versesCount: 59, startPage: 496, endPage: 498, revelationPlace: "makkah" },
  { id: 45, nameArabic: "الجاثية", nameFr: "L'agenouillée", nameSimple: "Al-Jathiyah", versesCount: 37, startPage: 499, endPage: 502, revelationPlace: "makkah" },
  { id: 46, nameArabic: "الأحقاف", nameFr: "Al-Ahqaf", nameSimple: "Al-Ahqaf", versesCount: 35, startPage: 502, endPage: 506, revelationPlace: "makkah" },
  { id: 47, nameArabic: "محمد", nameFr: "Mouhammad", nameSimple: "Muhammad", versesCount: 38, startPage: 507, endPage: 510, revelationPlace: "madinah" },
  { id: 48, nameArabic: "الفتح", nameFr: "La victoire éclatante", nameSimple: "Al-Fath", versesCount: 29, startPage: 511, endPage: 515, revelationPlace: "madinah" },
  { id: 49, nameArabic: "الحجرات", nameFr: "Les appartements", nameSimple: "Al-Hujurat", versesCount: 18, startPage: 515, endPage: 517, revelationPlace: "madinah" },
  { id: 50, nameArabic: "ق", nameFr: "Qaf", nameSimple: "Qaf", versesCount: 45, startPage: 518, endPage: 520, revelationPlace: "makkah" },
  { id: 51, nameArabic: "الذاريات", nameFr: "Qui éparpillent", nameSimple: "Adh-Dhariyat", versesCount: 60, startPage: 520, endPage: 523, revelationPlace: "makkah" },
  { id: 52, nameArabic: "الطور", nameFr: "Le mont At-Tour", nameSimple: "At-Tur", versesCount: 49, startPage: 523, endPage: 525, revelationPlace: "makkah" },
  { id: 53, nameArabic: "النجم", nameFr: "L'étoile", nameSimple: "An-Najm", versesCount: 62, startPage: 526, endPage: 528, revelationPlace: "makkah" },
  { id: 54, nameArabic: "القمر", nameFr: "La lune", nameSimple: "Al-Qamar", versesCount: 55, startPage: 528, endPage: 531, revelationPlace: "makkah" },
  { id: 55, nameArabic: "الرحمن", nameFr: "Le Tout Miséricordieux", nameSimple: "Ar-Rahman", versesCount: 78, startPage: 531, endPage: 534, revelationPlace: "madinah" },
  { id: 56, nameArabic: "الواقعة", nameFr: "L'inévitable", nameSimple: "Al-Waqi'ah", versesCount: 96, startPage: 534, endPage: 537, revelationPlace: "makkah" },
  { id: 57, nameArabic: "الحديد", nameFr: "Le fer", nameSimple: "Al-Hadid", versesCount: 29, startPage: 537, endPage: 541, revelationPlace: "madinah" },
  { id: 58, nameArabic: "المجادلة", nameFr: "La discussion", nameSimple: "Al-Mujadila", versesCount: 22, startPage: 542, endPage: 545, revelationPlace: "madinah" },
  { id: 59, nameArabic: "الحشر", nameFr: "L'exode", nameSimple: "Al-Hashr", versesCount: 24, startPage: 545, endPage: 548, revelationPlace: "madinah" },
  { id: 60, nameArabic: "الممتحنة", nameFr: "L'éprouvée", nameSimple: "Al-Mumtahanah", versesCount: 13, startPage: 549, endPage: 551, revelationPlace: "madinah" },
  { id: 61, nameArabic: "الصف", nameFr: "Le rang", nameSimple: "As-Saf", versesCount: 14, startPage: 551, endPage: 552, revelationPlace: "madinah" },
  { id: 62, nameArabic: "الجمعة", nameFr: "Le vendredi", nameSimple: "Al-Jumu'ah", versesCount: 11, startPage: 553, endPage: 554, revelationPlace: "madinah" },
  { id: 63, nameArabic: "المنافقون", nameFr: "Les hypocrites", nameSimple: "Al-Munafiqun", versesCount: 11, startPage: 554, endPage: 555, revelationPlace: "madinah" },
  { id: 64, nameArabic: "التغابن", nameFr: "La grande perte", nameSimple: "At-Taghabun", versesCount: 18, startPage: 556, endPage: 557, revelationPlace: "madinah" },
  { id: 65, nameArabic: "الطلاق", nameFr: "Le divorce", nameSimple: "At-Talaq", versesCount: 12, startPage: 558, endPage: 559, revelationPlace: "madinah" },
  { id: 66, nameArabic: "التحريم", nameFr: "L'interdiction", nameSimple: "At-Tahrim", versesCount: 12, startPage: 560, endPage: 561, revelationPlace: "madinah" },
  { id: 67, nameArabic: "الملك", nameFr: "La royauté", nameSimple: "Al-Mulk", versesCount: 30, startPage: 562, endPage: 564, revelationPlace: "makkah" },
  { id: 68, nameArabic: "القلم", nameFr: "La plume", nameSimple: "Al-Qalam", versesCount: 52, startPage: 564, endPage: 566, revelationPlace: "makkah" },
  { id: 69, nameArabic: "الحاقة", nameFr: "L'inéluctable", nameSimple: "Al-Haqqah", versesCount: 52, startPage: 566, endPage: 568, revelationPlace: "makkah" },
  { id: 70, nameArabic: "المعارج", nameFr: "Les voies d'ascension", nameSimple: "Al-Ma'arij", versesCount: 44, startPage: 568, endPage: 570, revelationPlace: "makkah" },
  { id: 71, nameArabic: "نوح", nameFr: "Noé", nameSimple: "Nuh", versesCount: 28, startPage: 570, endPage: 571, revelationPlace: "makkah" },
  { id: 72, nameArabic: "الجن", nameFr: "Les djinns", nameSimple: "Al-Jinn", versesCount: 28, startPage: 572, endPage: 573, revelationPlace: "makkah" },
  { id: 73, nameArabic: "المزمل", nameFr: "L'enveloppé", nameSimple: "Al-Muzzammil", versesCount: 20, startPage: 574, endPage: 575, revelationPlace: "makkah" },
  { id: 74, nameArabic: "المدثر", nameFr: "Celui qui se couvre", nameSimple: "Al-Muddaththir", versesCount: 56, startPage: 575, endPage: 577, revelationPlace: "makkah" },
  { id: 75, nameArabic: "القيامة", nameFr: "La résurrection", nameSimple: "Al-Qiyamah", versesCount: 40, startPage: 577, endPage: 578, revelationPlace: "makkah" },
  { id: 76, nameArabic: "الانسان", nameFr: "L'homme", nameSimple: "Al-Insan", versesCount: 31, startPage: 578, endPage: 580, revelationPlace: "madinah" },
  { id: 77, nameArabic: "المرسلات", nameFr: "Les envoyés", nameSimple: "Al-Mursalat", versesCount: 50, startPage: 580, endPage: 581, revelationPlace: "makkah" },
  { id: 78, nameArabic: "النبإ", nameFr: "La nouvelle", nameSimple: "An-Naba", versesCount: 40, startPage: 582, endPage: 583, revelationPlace: "makkah" },
  { id: 79, nameArabic: "النازعات", nameFr: "Ceux qui arrachent", nameSimple: "An-Nazi'at", versesCount: 46, startPage: 583, endPage: 584, revelationPlace: "makkah" },
  { id: 80, nameArabic: "عبس", nameFr: "Il s'est renfrogné", nameSimple: "'Abasa", versesCount: 42, startPage: 585, endPage: 585, revelationPlace: "makkah" },
  { id: 81, nameArabic: "التكوير", nameFr: "L'obscurcissement", nameSimple: "At-Takwir", versesCount: 29, startPage: 586, endPage: 586, revelationPlace: "makkah" },
  { id: 82, nameArabic: "الإنفطار", nameFr: "La rupture", nameSimple: "Al-Infitar", versesCount: 19, startPage: 587, endPage: 587, revelationPlace: "makkah" },
  { id: 83, nameArabic: "المطففين", nameFr: "Les fraudeurs", nameSimple: "Al-Mutaffifin", versesCount: 36, startPage: 587, endPage: 589, revelationPlace: "makkah" },
  { id: 84, nameArabic: "الإنشقاق", nameFr: "La déchirure", nameSimple: "Al-Inshiqaq", versesCount: 25, startPage: 589, endPage: 589, revelationPlace: "makkah" },
  { id: 85, nameArabic: "البروج", nameFr: "Les constellations", nameSimple: "Al-Buruj", versesCount: 22, startPage: 590, endPage: 590, revelationPlace: "makkah" },
  { id: 86, nameArabic: "الطارق", nameFr: "L'astre nocturne", nameSimple: "At-Tariq", versesCount: 17, startPage: 591, endPage: 591, revelationPlace: "makkah" },
  { id: 87, nameArabic: "الأعلى", nameFr: "Le Très-Haut", nameSimple: "Al-A'la", versesCount: 19, startPage: 591, endPage: 592, revelationPlace: "makkah" },
  { id: 88, nameArabic: "الغاشية", nameFr: "L'enveloppante", nameSimple: "Al-Ghashiyah", versesCount: 26, startPage: 592, endPage: 592, revelationPlace: "makkah" },
  { id: 89, nameArabic: "الفجر", nameFr: "L'aube", nameSimple: "Al-Fajr", versesCount: 30, startPage: 593, endPage: 594, revelationPlace: "makkah" },
  { id: 90, nameArabic: "البلد", nameFr: "La cité", nameSimple: "Al-Balad", versesCount: 20, startPage: 594, endPage: 594, revelationPlace: "makkah" },
  { id: 91, nameArabic: "الشمس", nameFr: "Le soleil", nameSimple: "Ash-Shams", versesCount: 15, startPage: 595, endPage: 595, revelationPlace: "makkah" },
  { id: 92, nameArabic: "الليل", nameFr: "La nuit", nameSimple: "Al-Layl", versesCount: 21, startPage: 595, endPage: 596, revelationPlace: "makkah" },
  { id: 93, nameArabic: "الضحى", nameFr: "Le jour montant", nameSimple: "Ad-Duhaa", versesCount: 11, startPage: 596, endPage: 596, revelationPlace: "makkah" },
  { id: 94, nameArabic: "الشرح", nameFr: "L'ouverture", nameSimple: "Ash-Sharh", versesCount: 8, startPage: 596, endPage: 596, revelationPlace: "makkah" },
  { id: 95, nameArabic: "التين", nameFr: "Les figues", nameSimple: "At-Tin", versesCount: 8, startPage: 597, endPage: 597, revelationPlace: "makkah" },
  { id: 96, nameArabic: "العلق", nameFr: "L'adhérence", nameSimple: "Al-'Alaq", versesCount: 19, startPage: 597, endPage: 597, revelationPlace: "makkah" },
  { id: 97, nameArabic: "القدر", nameFr: "La destinée", nameSimple: "Al-Qadr", versesCount: 5, startPage: 598, endPage: 598, revelationPlace: "makkah" },
  { id: 98, nameArabic: "البينة", nameFr: "La preuve", nameSimple: "Al-Bayyinah", versesCount: 8, startPage: 598, endPage: 599, revelationPlace: "madinah" },
  { id: 99, nameArabic: "الزلزلة", nameFr: "Le séisme", nameSimple: "Az-Zalzalah", versesCount: 8, startPage: 599, endPage: 599, revelationPlace: "madinah" },
  { id: 100, nameArabic: "العاديات", nameFr: "Les coursiers", nameSimple: "Al-'Adiyat", versesCount: 11, startPage: 599, endPage: 600, revelationPlace: "makkah" },
  { id: 101, nameArabic: "القارعة", nameFr: "Le fracas", nameSimple: "Al-Qari'ah", versesCount: 11, startPage: 600, endPage: 600, revelationPlace: "makkah" },
  { id: 102, nameArabic: "التكاثر", nameFr: "La course aux richesses", nameSimple: "At-Takathur", versesCount: 8, startPage: 600, endPage: 600, revelationPlace: "makkah" },
  { id: 103, nameArabic: "العصر", nameFr: "Le temps", nameSimple: "Al-'Asr", versesCount: 3, startPage: 601, endPage: 601, revelationPlace: "makkah" },
  { id: 104, nameArabic: "الهمزة", nameFr: "Les calomniateurs", nameSimple: "Al-Humazah", versesCount: 9, startPage: 601, endPage: 601, revelationPlace: "makkah" },
  { id: 105, nameArabic: "الفيل", nameFr: "L'éléphant", nameSimple: "Al-Fil", versesCount: 5, startPage: 601, endPage: 601, revelationPlace: "makkah" },
  { id: 106, nameArabic: "قريش", nameFr: "Les Quraysh", nameSimple: "Quraysh", versesCount: 4, startPage: 602, endPage: 602, revelationPlace: "makkah" },
  { id: 107, nameArabic: "الماعون", nameFr: "L'entraide", nameSimple: "Al-Ma'un", versesCount: 7, startPage: 602, endPage: 602, revelationPlace: "makkah" },
  { id: 108, nameArabic: "الكوثر", nameFr: "L'abondance", nameSimple: "Al-Kawthar", versesCount: 3, startPage: 602, endPage: 602, revelationPlace: "makkah" },
  { id: 109, nameArabic: "الكافرون", nameFr: "Les mécréants", nameSimple: "Al-Kafirun", versesCount: 6, startPage: 603, endPage: 603, revelationPlace: "makkah" },
  { id: 110, nameArabic: "النصر", nameFr: "Le secours", nameSimple: "An-Nasr", versesCount: 3, startPage: 603, endPage: 603, revelationPlace: "madinah" },
  { id: 111, nameArabic: "المسد", nameFr: "Les fibres", nameSimple: "Al-Masad", versesCount: 5, startPage: 603, endPage: 603, revelationPlace: "makkah" },
  { id: 112, nameArabic: "الإخلاص", nameFr: "La sincérité", nameSimple: "Al-Ikhlas", versesCount: 4, startPage: 604, endPage: 604, revelationPlace: "makkah" },
  { id: 113, nameArabic: "الفلق", nameFr: "L'aube naissante", nameSimple: "Al-Falaq", versesCount: 5, startPage: 604, endPage: 604, revelationPlace: "makkah" },
  { id: 114, nameArabic: "الناس", nameFr: "Les humains", nameSimple: "An-Nas", versesCount: 6, startPage: 604, endPage: 604, revelationPlace: "makkah" },];

export function getSurahAudioUrl(reciterId: string, surahNumber: number): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
  const padded = String(surahNumber).padStart(3, '0');
  return `${reciter.server}${padded}.mp3`;
}

export function getMushafPageImageUrl(pageNumber: number): string {
  return `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/hafs-wasat/${pageNumber}.jpg`;
}

export function resolveQuranAssetPath(path: string): string {
  return `${getBasePath()}${path}`;
}
