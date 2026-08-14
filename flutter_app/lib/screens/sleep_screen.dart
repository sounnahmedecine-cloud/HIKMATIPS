import 'dart:async';
import 'dart:math' show Random;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:just_audio/just_audio.dart';

import '../data/surah_names.dart';
import '../models/hikma_clip.dart';
import '../services/haptics_service.dart';
import '../services/quran_audio_service.dart';
import '../theme/hikma_theme.dart';

/// Écran de veille : l'heure en grand sur un fond qui change tout seul,
/// avec la récitation du Coran. Pensé pour poser le téléphone à côté de
/// soi, l'écran restant allumé.
class SleepScreen extends StatefulWidget {
  const SleepScreen({super.key});

  @override
  State<SleepScreen> createState() => _SleepScreenState();
}

class _SleepScreenState extends State<SleepScreen> {
  static const _screenChannel = MethodChannel('com.hikmatips.app/screen');

  final QuranAudioService _audio = QuranAudioService();
  final Random _random = Random();

  late int _backgroundIndex;
  late Timer _clock;
  late Timer _backgroundTimer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _backgroundIndex = _random.nextInt(hikmaBackgrounds.length);

    // L'horloge se cale sur la seconde suivante pour éviter de sauter
    // une minute d'affichage.
    _clock = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });

    // Fond renouvelé régulièrement, sans jamais répéter le précédent.
    _backgroundTimer = Timer.periodic(const Duration(seconds: 45), (_) {
      if (!mounted) return;
      setState(() {
        var next = _random.nextInt(hikmaBackgrounds.length);
        if (hikmaBackgrounds.length > 1) {
          while (next == _backgroundIndex) {
            next = _random.nextInt(hikmaBackgrounds.length);
          }
        }
        _backgroundIndex = next;
      });
    });

    // Plein écran et écran maintenu allumé tant que la veille est ouverte.
    unawaited(
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky),
    );
    unawaited(_setKeepAwake(true));
  }

  /// Le canal natif est absent sur les autres plateformes : l'échec est
  /// sans conséquence, l'écran s'éteindra simplement comme d'habitude.
  Future<void> _setKeepAwake(bool enabled) async {
    try {
      await _screenChannel.invokeMethod<void>('keepAwake', {
        'enabled': enabled,
      });
    } on PlatformException {
      // Sans importance : fonctionnalité de confort.
    } on MissingPluginException {
      // Idem sur Web et desktop.
    }
  }

  @override
  void dispose() {
    _clock.cancel();
    _backgroundTimer.cancel();
    unawaited(_setKeepAwake(false));
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  String get _time =>
      '${_now.hour.toString().padLeft(2, '0')}:'
      '${_now.minute.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 900),
            child: Image.asset(
              hikmaBackgrounds[_backgroundIndex],
              key: ValueKey(_backgroundIndex),
              fit: BoxFit.cover,
              gaplessPlayback: true,
            ),
          ),
          // Assombrit le fond : de nuit, une photo claire éblouit et
          // l'heure devient illisible.
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xB3000000),
                  Color(0x99041A10),
                  Color(0xD9000000),
                ],
                stops: [0, .5, 1],
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: IconButton(
                      tooltip: 'Quitter la veille',
                      onPressed: () {
                        HapticsService.selection();
                        Navigator.pop(context);
                      },
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: .14),
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  _time,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 86,
                    height: 1,
                    fontWeight: FontWeight.w200,
                    letterSpacing: -2,
                    fontFeatures: [FontFeature.tabularFigures()],
                    shadows: [Shadow(color: Color(0x99000000), blurRadius: 24)],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _frenchDate(_now),
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: .78),
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    letterSpacing: .4,
                  ),
                ),
                const Spacer(),
                _SleepPlayer(audio: _audio),
                const SizedBox(height: 28),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _frenchDate(DateTime date) {
    const days = [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ];
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];
    return '${days[date.weekday - 1]} ${date.day} ${months[date.month - 1]}';
  }
}

/// Commandes de récitation réduites à l'essentiel : sourate en cours,
/// précédent, lecture/pause, suivant.
class _SleepPlayer extends StatelessWidget {
  const _SleepPlayer({required this.audio});

  final QuranAudioService audio;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .12),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withValues(alpha: .16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          StreamBuilder<int>(
            stream: audio.currentSurahStream,
            initialData: audio.currentSurah,
            builder: (context, snapshot) {
              final surah = snapshot.data ?? audio.currentSurah;
              final entry = surahData[surah - 1];
              return Column(
                children: [
                  Text(
                    entry['arabic']!,
                    textDirection: TextDirection.rtl,
                    style: const TextStyle(
                      color: HikmaColors.gold,
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Sourate $surah · ${entry['french']}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: .82),
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                iconSize: 30,
                color: Colors.white,
                onPressed: audio.previousSurah,
                icon: const Icon(Icons.skip_previous_rounded),
              ),
              StreamBuilder<PlayerState>(
                stream: audio.player.playerStateStream,
                builder: (context, snapshot) {
                  final state = snapshot.data;
                  final playing = state?.playing ?? false;
                  final loading =
                      state?.processingState == ProcessingState.loading ||
                      state?.processingState == ProcessingState.buffering;

                  if (loading) {
                    return const SizedBox(
                      width: 52,
                      height: 52,
                      child: Padding(
                        padding: EdgeInsets.all(10),
                        child: CircularProgressIndicator(
                          color: HikmaColors.gold,
                          strokeWidth: 2.4,
                        ),
                      ),
                    );
                  }

                  return IconButton(
                    iconSize: 52,
                    color: HikmaColors.gold,
                    onPressed: () {
                      HapticsService.selection();
                      if (playing) {
                        audio.player.pause();
                      } else {
                        audio.playSurah(audio.currentSurah);
                      }
                    },
                    icon: Icon(
                      playing
                          ? Icons.pause_circle_filled_rounded
                          : Icons.play_circle_fill_rounded,
                    ),
                  );
                },
              ),
              IconButton(
                iconSize: 30,
                color: Colors.white,
                onPressed: audio.nextSurah,
                icon: const Icon(Icons.skip_next_rounded),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
