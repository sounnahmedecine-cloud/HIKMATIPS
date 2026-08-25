import 'package:flutter/material.dart';

import '../theme/hikma_theme.dart';

/// Fond uni ou dégradé, dessiné en code : aucun octet dans l'APK, aucun
/// téléchargement. C'est l'offre gratuite, les photos restant Premium.
class SolidBackground {
  const SolidBackground({
    required this.id,
    required this.label,
    required this.colors,
    this.dark = true,
  });

  final String id;
  final String label;

  /// Une seule couleur donne un aplat, deux ou plus un dégradé.
  final List<Color> colors;

  /// Vrai quand le fond est sombre : le texte blanc du clip reste alors
  /// lisible sans voile supplémentaire.
  final bool dark;

  Gradient get gradient => LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: colors.length == 1 ? [colors.first, colors.first] : colors,
  );
}

/// Palette tirée de l'identité HikmaClips. Toutes sont sombres : le clip
/// affiche son texte en blanc, un fond clair le rendrait illisible.
const solidBackgrounds = <SolidBackground>[
  SolidBackground(
    id: 'solid-emerald',
    label: 'Émeraude',
    colors: [HikmaColors.emeraldDeep, Color(0xFF0E3A27)],
  ),
  SolidBackground(
    id: 'solid-forest',
    label: 'Forêt',
    colors: [Color(0xFF10251B), Color(0xFF07140F)],
  ),
  SolidBackground(
    id: 'solid-dawn',
    label: 'Aube',
    colors: [Color(0xFF1B3A4B), Color(0xFF0B1F2A)],
  ),
  SolidBackground(
    id: 'solid-night',
    label: 'Nuit',
    colors: [Color(0xFF141B33), Color(0xFF070B18)],
  ),
  SolidBackground(
    id: 'solid-amber',
    label: 'Ambre',
    colors: [Color(0xFF5C3A12), Color(0xFF2A1908)],
  ),
  SolidBackground(
    id: 'solid-rose',
    label: 'Grenat',
    colors: [Color(0xFF4A1F2B), Color(0xFF230D14)],
  ),
  SolidBackground(
    id: 'solid-ink',
    label: 'Encre',
    colors: [HikmaColors.ink, Color(0xFF060D0A)],
  ),
  SolidBackground(
    id: 'solid-sand',
    label: 'Sable',
    colors: [Color(0xFF3D372B), Color(0xFF1C1913)],
  ),
];

SolidBackground? solidBackgroundById(String? id) {
  if (id == null) return null;
  for (final background in solidBackgrounds) {
    if (background.id == id) return background;
  }
  return null;
}
