import 'dart:convert';

import 'package:flutter/services.dart';

class HikmaClip {
  const HikmaClip({
    required this.id,
    required this.imageAsset,
    required this.arabic,
    required this.quote,
    required this.source,
    required this.tag,
    required this.kind,
  });

  final String id;
  final String imageAsset;
  final String arabic;
  final String quote;
  final String source;
  final String tag;
  final String kind;
}

const hikmaBackgrounds = <String>[
  'assets/images/hero-prayer.jpg',
  'assets/images/hero-aube.png',
  'assets/images/hero-matin.png',
  'assets/images/hero-apres-midi.png',
  'assets/images/hero-maghrib.png',
  'assets/images/hero-soir.png',
  'assets/images/1764276055176-019ac70b-7597-7d90-bd84-f410dc8b9466_bdehmc.jpg',
  'assets/images/1770368464428_nyjfzr.jpg',
  'assets/images/1770368681324_eltq7s.jpg',
  'assets/images/2445fbdbebc12e5ffe412790a3229873_vmcqpl.jpg',
  'assets/images/2e4977661bcd232eba96336af33b3022_awtvu4.jpg',
  'assets/images/3bfe17035089daca7379a201b755d507_meewa6.jpg',
  'assets/images/5412c2edad8875186a501526cde9ad0e_etbhc3.jpg',
  'assets/images/5ca1d47ba5b604d4705f16631d19960f_jwz5b0.jpg',
  'assets/images/79756b65fbdbf142396e8ab50b551fea_aywvyt.jpg',
  'assets/images/7a06037dce3a4a31946c7476cac5b102_xhdrpi.jpg',
  'assets/images/924384f8cc55fcd1cb29753eef6e1ec3_u4fyi7.jpg',
  'assets/images/98a86ef4671d16f829ad416227a966a0_ydiakn.jpg',
  'assets/images/a985daba50552fe35494a531ea005d4d_ykelon.jpg',
  'assets/images/b8304e729daf9b07301d673e987fb2af_k73guy.jpg',
  'assets/images/badaecc7ae115fe80e26e7ac89b42628_tluett.jpg',
  'assets/images/c62604ded7ef97c1a1577fbbc863d3bd_r1s3ej.jpg',
  'assets/images/e41c0bce7281b6d35f39b4352ed01104_l4nnb6.jpg',
  'assets/images/e67e2fe25d34d670df6af90e974351d2_kth915.jpg',
  'assets/images/ff228d254a9915835c4a2c168c427980_ecwpze.jpg',
];

const fallbackHikmaClips = <HikmaClip>[
  HikmaClip(
    id: 'dhariyat-55',
    imageAsset: 'assets/images/hero-prayer.jpg',
    arabic: 'وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',
    quote: 'Et rappelle, car le rappel profite aux croyants.',
    source: 'SOURATE ADH-DHÂRIYÂT · 51:55',
    tag: 'RAPPEL',
    kind: 'coran',
  ),
  HikmaClip(
    id: 'ash-sharh-6',
    imageAsset: 'assets/images/hero-maghrib.png',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    quote: 'Certes, avec la difficulté il y a une facilité.',
    source: 'SOURATE ASH-SHARH · 94:6',
    tag: 'ESPÉRANCE',
    kind: 'coran',
  ),
  HikmaClip(
    id: 'al-hadid-4',
    imageAsset: 'assets/images/hero-aube.png',
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    quote: 'Et Il est avec vous où que vous soyez.',
    source: 'SOURATE AL-HADÎD · 57:4',
    tag: 'PRÉSENCE',
    kind: 'coran',
  ),
];

Future<List<HikmaClip>>? _catalogFuture;

Future<List<HikmaClip>> loadHikmaClips() {
  return _catalogFuture ??= _loadHikmaClips();
}

Future<List<HikmaClip>> _loadHikmaClips() async {
  try {
    final raw = await rootBundle.loadString('assets/data/hikma_catalog.json');
    final payload = jsonDecode(raw) as Map<String, dynamic>;
    final citadellePayload =
        jsonDecode(
              await rootBundle.loadString('assets/data/hisn_al_muslim.json'),
            )
            as Map<String, dynamic>;
    final rabbanaPayload =
        jsonDecode(await rootBundle.loadString('assets/data/rabbana.json'))
            as Map<String, dynamic>;
    final clips = <HikmaClip>[];
    final seenQuotes = <String>{};

    void addEntries(
      Map<String, dynamic> sourcePayload,
      String key,
      String kind,
      String idPrefix,
    ) {
      final entries = sourcePayload[key] as List<dynamic>? ?? const [];
      for (final (index, value) in entries.indexed) {
        final entry = value as Map<String, dynamic>;
        final quote = (entry['content'] as String? ?? '').trim();
        final source = (entry['source'] as String? ?? '').trim();
        if (quote.isEmpty || source.isEmpty) continue;

        final normalizedQuote = quote.toLowerCase().replaceAll(
          RegExp(r'[^a-zà-ÿ0-9]+'),
          '',
        );
        if (!seenQuotes.add(normalizedQuote)) continue;

        final legacy = _legacyVerse(source);
        final category = (entry['category'] as String? ?? kind).trim();
        clips.add(
          HikmaClip(
            id: legacy?.id ?? '$idPrefix-${entry['id'] ?? index + 1}',
            imageAsset:
                hikmaBackgrounds[clips.length % hikmaBackgrounds.length],
            arabic: legacy?.arabic ?? '',
            quote: quote,
            source: _displaySource(source),
            tag: _displayTag(category, kind),
            kind: kind,
          ),
        );
      }
    }

    addEntries(payload, 'hadiths', 'hadith', 'hadith');
    addEntries(payload, 'quran_verses', 'coran', 'coran');
    addEntries(payload, 'ramadan_content', 'ramadan', 'ramadan');
    addEntries(citadellePayload, 'citadelle', 'invocation', 'citadelle');
    addEntries(rabbanaPayload, 'rabbana', 'invocation', 'rabbana');
    return clips.length > fallbackHikmaClips.length
        ? List.unmodifiable(clips)
        : fallbackHikmaClips;
  } on Object {
    return fallbackHikmaClips;
  }
}

({String id, String arabic})? _legacyVerse(String source) {
  if (source.contains('51:55')) {
    return (
      id: 'dhariyat-55',
      arabic: 'وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',
    );
  }
  if (source.contains('94:6')) {
    return (id: 'ash-sharh-6', arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا');
  }
  if (source.contains('57:4')) {
    return (id: 'al-hadid-4', arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ');
  }
  return null;
}

String _displaySource(String source) {
  return source
      .replaceFirst('Sahih al-Bukhari', 'SAHIH AL-BUKHARI')
      .replaceFirst('Sahih Muslim', 'SAHIH MUSLIM')
      .replaceFirst('Sourate ', 'SOURATE ')
      .toUpperCase();
}

String _displayTag(String category, String kind) {
  if (category.isEmpty) return kind == 'coran' ? 'CORAN' : 'HADITH';
  final normalized = category
      .replaceAll('epreuve', 'épreuve')
      .replaceAll('esperance', 'espérance')
      .replaceAll('misericorde', 'miséricorde')
      .replaceAll('veracite', 'véracité')
      .replaceAll('fraternite', 'fraternité')
      .replaceAll('proximite', 'proximité');
  return normalized.toUpperCase();
}
