import 'package:flutter/material.dart';

import '../theme/hikma_theme.dart';

/// Gros cœur qui surgit au centre du clip lors d'un double tap, à la
/// manière des réseaux sociaux : il grossit, pulse, puis s'efface.
class HeartBurst extends StatefulWidget {
  const HeartBurst({required this.onCompleted, super.key});

  /// Appelé une fois l'animation terminée, pour que l'écran retire le
  /// cœur de l'arbre plutôt que de le laisser invisible par-dessus.
  final VoidCallback onCompleted;

  @override
  State<HeartBurst> createState() => _HeartBurstState();
}

class _HeartBurstState extends State<HeartBurst>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    duration: const Duration(milliseconds: 900),
    vsync: this,
  );

  late final Animation<double> _scale = TweenSequence<double>([
    // Jaillissement : dépasse la taille finale avant de se poser.
    TweenSequenceItem(
      tween: Tween(
        begin: .2,
        end: 1.15,
      ).chain(CurveTween(curve: Curves.easeOutBack)),
      weight: 32,
    ),
    TweenSequenceItem(
      tween: Tween(
        begin: 1.15,
        end: 1.0,
      ).chain(CurveTween(curve: Curves.easeOut)),
      weight: 18,
    ),
    TweenSequenceItem(tween: ConstantTween(1.0), weight: 26),
    // Puis s'échappe vers le haut en se dissipant.
    TweenSequenceItem(
      tween: Tween(
        begin: 1.0,
        end: 1.35,
      ).chain(CurveTween(curve: Curves.easeIn)),
      weight: 24,
    ),
  ]).animate(_controller);

  late final Animation<double> _opacity = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.0), weight: 18),
    TweenSequenceItem(tween: ConstantTween(1.0), weight: 52),
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.0), weight: 30),
  ]).animate(_controller);

  late final Animation<double> _lift = Tween<double>(
    begin: 0,
    end: -46,
  ).chain(CurveTween(curve: Curves.easeIn)).animate(_controller);

  @override
  void initState() {
    super.initState();
    _controller.forward().whenComplete(widget.onCompleted);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Purement décoratif : ne doit jamais intercepter un geste.
    return IgnorePointer(
      child: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) => Transform.translate(
            offset: Offset(0, _lift.value),
            child: Transform.scale(
              scale: _scale.value,
              child: Opacity(
                opacity: _opacity.value.clamp(0.0, 1.0),
                child: const Icon(
                  Icons.favorite_rounded,
                  size: 132,
                  color: HikmaColors.rose,
                  shadows: [Shadow(color: Color(0x8C000000), blurRadius: 32)],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
