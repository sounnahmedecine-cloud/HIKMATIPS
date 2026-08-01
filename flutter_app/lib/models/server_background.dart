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

  String get category {
    final hint = imageHint.toLowerCase();
    if (hint.contains('ramadan')) return 'Ramadan';
    if (hint.contains('islam') ||
        hint.contains('mosque') ||
        hint.contains('coran') ||
        hint.contains('kaaba') ||
        hint.contains('calligraphy')) {
      return 'Islamique';
    }
    if (hint.contains('nature') ||
        hint.contains('astronomy') ||
        hint.contains('mountain')) {
      return 'Nature';
    }
    return 'Autres';
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
