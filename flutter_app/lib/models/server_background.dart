import 'dart:convert';

import 'package:flutter/services.dart';

class ServerBackground {
  const ServerBackground({
    required this.id,
    required this.description,
    required this.imageUrl,
    required this.imageHint,
  });

  final String id;
  final String description;
  final String imageUrl;
  final String imageHint;

  /// Categorie affichee dans la galerie. Les tags bruts sont bruyants et
  /// se recoupent : on les ramene a quatre familles lisibles, en testant
  /// du plus specifique au plus general.
  String get category {
    final hint = imageHint.toLowerCase();
    if (hint.contains('ramadan') || hint.contains('lantern')) {
      return 'Ramadan';
    }
    if (hint.contains('islam') ||
        hint.contains('mosque') ||
        hint.contains('coran') ||
        hint.contains('quran') ||
        hint.contains('kaaba') ||
        hint.contains('calligraphy') ||
        hint.contains('musulman')) {
      return 'Islamique';
    }
    // Le ciel avant la nature : « night stars » et « astronomy » sont plus
    // proches du firmament que d'un paysage.
    if (hint.contains('night') ||
        hint.contains('star') ||
        hint.contains('galaxy') ||
        hint.contains('astronomy') ||
        hint.contains('sky') ||
        hint.contains('moon')) {
      return 'Ciel';
    }
    if (hint.contains('nature') ||
        hint.contains('mountain') ||
        hint.contains('forest') ||
        hint.contains('sea') ||
        hint.contains('ocean') ||
        hint.contains('desert')) {
      return 'Nature';
    }
    return 'Sobres';
  }
}

Future<List<ServerBackground>>? _serverBackgroundsFuture;

Future<List<ServerBackground>> loadServerBackgrounds() =>
    _serverBackgroundsFuture ??= _loadServerBackgrounds();

Future<List<ServerBackground>> _loadServerBackgrounds() async {
  final raw = await rootBundle.loadString(
    'assets/data/server_backgrounds.json',
  );
  final decoded = jsonDecode(raw) as Map<String, dynamic>;
  final entries = decoded['placeholderImages'] as List<dynamic>? ?? const [];
  final backgrounds = <ServerBackground>[];
  final knownUrls = <String>{};

  for (final entry in entries) {
    if (entry is! Map<String, dynamic>) continue;
    final imageUrl = entry['imageUrl']?.toString() ?? '';
    final uri = Uri.tryParse(imageUrl);
    if (uri == null ||
        uri.scheme != 'https' ||
        uri.host != 'res.cloudinary.com' ||
        !knownUrls.add(imageUrl)) {
      continue;
    }

    backgrounds.add(
      ServerBackground(
        id: entry['id']?.toString() ?? 'server-${backgrounds.length}',
        description: entry['description']?.toString() ?? '',
        imageUrl: imageUrl,
        imageHint: entry['imageHint']?.toString() ?? '',
      ),
    );
  }

  return List.unmodifiable(backgrounds);
}
