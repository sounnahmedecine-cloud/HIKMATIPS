import 'package:flutter/material.dart';

import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

/// Voile d'accueil affiché à la toute première arrivée sur les clips :
/// une main monte en boucle pour montrer le geste, puis l'utilisateur
/// découvre le double tap.
class SwipeHintOverlay extends StatefulWidget {
  const SwipeHintOverlay({required this.onDismiss, super.key});

  final VoidCallback onDismiss;

  @override
  State<SwipeHintOverlay> createState() => _SwipeHintOverlayState();
}

class _SwipeHintOverlayState extends State<SwipeHintOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1900),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: .82),
      child: InkWell(
        onTap: () {
          HapticsService.selection();
          widget.onDismiss();
        },
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  height: 150,
                  child: AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      // La main monte puis s'efface, en boucle.
                      final t = Curves.easeInOut.transform(_controller.value);
                      return Opacity(
                        opacity: (1 - (t - .5).abs() * 2).clamp(.15, 1.0),
                        child: Transform.translate(
                          offset: Offset(0, 46 - t * 92),
                          child: child,
                        ),
                      );
                    },
                    child: const Icon(
                      Icons.touch_app_rounded,
                      size: 64,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Balayez vers le haut ou vers le bas\npour lire des Hikma',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 19,
                    height: 1.4,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -.4,
                  ),
                ),
                const SizedBox(height: 30),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .1),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.favorite_rounded,
                        color: HikmaColors.rose,
                        size: 22,
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: Text(
                          'Double tap pour méditer sur cette parole\net '
                          'l’ajouter à vos favoris',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: .9),
                            fontSize: 13,
                            height: 1.45,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 34),
                Text(
                  'Touchez l’écran pour commencer',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: .6),
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: .3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
