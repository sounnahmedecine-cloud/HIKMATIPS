import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

/// Une ambiance sonore apaisante, jouée en boucle sur l'écran de veille.
class Ambience {
  const Ambience({
    required this.id,
    required this.label,
    required this.icon,
    required this.asset,
  });

  final String id;
  final String label;
  final IconData icon;
  final String asset;
}

const ambiences = <Ambience>[
  Ambience(
    id: 'rain',
    label: 'Pluie',
    icon: Icons.water_drop_outlined,
    asset: 'assets/ambience/rain.mp3',
  ),
  Ambience(
    id: 'forest',
    label: 'Forêt',
    icon: Icons.forest_outlined,
    asset: 'assets/ambience/forest.mp3',
  ),
  Ambience(
    id: 'sea',
    label: 'Mer',
    icon: Icons.waves_outlined,
    asset: 'assets/ambience/sea.mp3',
  ),
];

/// Lecteur dédié aux ambiances, distinct de celui du Coran : les deux
/// peuvent jouer ensemble, récitation par-dessus le fond sonore.
class AmbienceService {
  static final AmbienceService instance = AmbienceService._();

  AmbienceService._();

  final AudioPlayer _player = AudioPlayer();
  final ValueNotifier<String?> current = ValueNotifier<String?>(null);

  /// Volume propre à l'ambiance, pour la garder discrète sous la
  /// récitation.
  double get volume => _player.volume;

  Future<void> toggle(Ambience ambience) async {
    if (current.value == ambience.id) {
      await stop();
      return;
    }
    await play(ambience);
  }

  Future<void> play(Ambience ambience) async {
    try {
      await _player.setAsset(ambience.asset);
      await _player.setLoopMode(LoopMode.one);
      await _player.setVolume(.6);
      await _player.play();
      current.value = ambience.id;
    } on Object {
      // Asset manquant ou décodage impossible : on reste silencieux
      // plutôt que d'interrompre la veille.
      current.value = null;
    }
  }

  Future<void> setVolume(double value) => _player.setVolume(value);

  Future<void> stop() async {
    await _player.stop();
    current.value = null;
  }

  void dispose() {
    current.dispose();
    _player.dispose();
  }
}
