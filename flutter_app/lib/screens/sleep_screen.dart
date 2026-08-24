import 'dart:async';
import 'dart:math' show Random;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/hikma_clip.dart';
import '../models/server_background.dart';
import '../services/ambience_service.dart';
import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

/// Écran de veille : l'heure en grand sur un fond qui change tout seul,
/// avec une ambiance sonore apaisante. Pensé pour poser le téléphone à
/// côté de soi, l'écran restant allumé.
class SleepScreen extends StatefulWidget {
  const SleepScreen({super.key});

  @override
  State<SleepScreen> createState() => _SleepScreenState();
}

class _SleepScreenState extends State<SleepScreen> {
  static const _screenChannel = MethodChannel('com.hikmatips.app/screen');

  final Random _random = Random();

  late int _backgroundIndex;
  late Timer _clock;
  late Timer _backgroundTimer;
  DateTime _now = DateTime.now();

  /// Fonds HD du serveur, bien plus beaux que les images embarquées.
  /// Vides tant qu'ils ne sont pas chargés : on affiche alors le local.
  List<String> _serverUrls = const [];

  @override
  void initState() {
    super.initState();
    _backgroundIndex = _random.nextInt(hikmaBackgrounds.length);
    _loadServerBackgrounds();

    // L'horloge se cale sur la seconde suivante pour éviter de sauter
    // une minute d'affichage.
    _clock = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });

    // Fond renouvelé régulièrement, sans jamais répéter le précédent.
    _backgroundTimer = Timer.periodic(const Duration(seconds: 45), (_) {
      if (!mounted) return;
      setState(() {
        final count = _backgroundCount;
        var next = _random.nextInt(count);
        if (count > 1) {
          while (next == _backgroundIndex) {
            next = _random.nextInt(count);
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

  /// Sans réseau la veille garde les fonds embarqués : elle doit rester
  /// utilisable hors ligne.
  Future<void> _loadServerBackgrounds() async {
    try {
      final backgrounds = await loadServerBackgrounds();
      if (!mounted || backgrounds.isEmpty) return;
      setState(() {
        _serverUrls = backgrounds.map((b) => b.imageUrl).toList();
        _backgroundIndex = _random.nextInt(_serverUrls.length);
      });
    } on Object {
      // On conserve les images locales.
    }
  }

  int get _backgroundCount =>
      _serverUrls.isEmpty ? hikmaBackgrounds.length : _serverUrls.length;

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
    // L'ambiance appartient à la veille : elle s'arrête en sortant.
    unawaited(AmbienceService.instance.stop());
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
            child: _serverUrls.isEmpty
                ? Image.asset(
                    hikmaBackgrounds[_backgroundIndex %
                        hikmaBackgrounds.length],
                    key: ValueKey('local-$_backgroundIndex'),
                    fit: BoxFit.cover,
                    gaplessPlayback: true,
                  )
                : Image.network(
                    _serverUrls[_backgroundIndex % _serverUrls.length],
                    key: ValueKey('server-$_backgroundIndex'),
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.high,
                    gaplessPlayback: true,
                    // Une image HD qui ne charge pas ne doit pas laisser
                    // un écran noir : on retombe sur le fond local.
                    errorBuilder: (_, _, _) => Image.asset(
                      hikmaBackgrounds[_backgroundIndex %
                          hikmaBackgrounds.length],
                      fit: BoxFit.cover,
                    ),
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
                const _AmbienceBar(),
                const SizedBox(height: 14),
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

/// Ambiances apaisantes, jouables seules ou sous la récitation.
class _AmbienceBar extends StatelessWidget {
  const _AmbienceBar();

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String?>(
      valueListenable: AmbienceService.instance.current,
      builder: (context, activeId, _) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: ambiences.map((ambience) {
            final active = ambience.id == activeId;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: Material(
                color: active
                    ? HikmaColors.gold.withValues(alpha: .9)
                    : Colors.white.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(99),
                child: InkWell(
                  borderRadius: BorderRadius.circular(99),
                  onTap: () {
                    HapticsService.selection();
                    AmbienceService.instance.toggle(ambience);
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 15,
                      vertical: 9,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          ambience.icon,
                          size: 16,
                          color: active ? HikmaColors.ink : Colors.white,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          ambience.label,
                          style: TextStyle(
                            color: active ? HikmaColors.ink : Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

/// Commandes de récitation réduites à l'essentiel : sourate en cours,
/// précédent, lecture/pause, suivant.
