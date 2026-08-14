import 'package:flutter/material.dart';

import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

/// Une étape du guidage : la zone à éclairer et le texte associé.
class CoachStep {
  const CoachStep({
    required this.targetKey,
    required this.title,
    required this.message,
    this.radius = 22,
    this.padding = 10,
  });

  /// Clé de l'élément réel à mettre en avant. Si elle n'est pas montée,
  /// l'étape est ignorée plutôt que d'éclairer une zone vide.
  final GlobalKey targetKey;
  final String title;
  final String message;
  final double radius;
  final double padding;
}

/// Superpose un voile sombre percé d'une fenêtre sur l'élément visé, avec
/// une bulle explicative. Affiché une seule fois, après les slides.
class CoachMarksOverlay extends StatefulWidget {
  const CoachMarksOverlay({
    required this.steps,
    required this.onFinish,
    super.key,
  });

  final List<CoachStep> steps;
  final VoidCallback onFinish;

  @override
  State<CoachMarksOverlay> createState() => _CoachMarksOverlayState();
}

class _CoachMarksOverlayState extends State<CoachMarksOverlay> {
  int _index = 0;

  List<CoachStep> get _visibleSteps => widget.steps
      .where((step) => step.targetKey.currentContext != null)
      .toList();

  void _next() {
    HapticsService.selection();
    if (_index >= _visibleSteps.length - 1) {
      widget.onFinish();
      return;
    }
    setState(() => _index++);
  }

  /// Rectangle de l'élément visé, en coordonnées de cet overlay.
  Rect? _targetRect(CoachStep step) {
    final targetContext = step.targetKey.currentContext;
    final overlayBox = context.findRenderObject() as RenderBox?;
    if (targetContext == null || overlayBox == null) return null;

    final targetBox = targetContext.findRenderObject() as RenderBox?;
    if (targetBox == null || !targetBox.hasSize) return null;

    final topLeft = targetBox.localToGlobal(Offset.zero, ancestor: overlayBox);
    return Rect.fromLTWH(
      topLeft.dx,
      topLeft.dy,
      targetBox.size.width,
      targetBox.size.height,
    ).inflate(step.padding);
  }

  @override
  Widget build(BuildContext context) {
    final steps = _visibleSteps;
    if (steps.isEmpty) return const SizedBox.shrink();

    final step = steps[_index.clamp(0, steps.length - 1)];
    final rect = _targetRect(step);
    final isLast = _index >= steps.length - 1;

    // La hauteur de référence est celle de l'overlay, pas celle de l'écran :
    // sur grand écran l'application est rendue dans un cadre plus étroit.
    final overlayBox = context.findRenderObject() as RenderBox?;
    final overlayHeight = overlayBox?.hasSize == true
        ? overlayBox!.size.height
        : MediaQuery.sizeOf(context).height;

    // Place la bulle du côté où il reste le plus de place.
    final showBelow = rect == null || rect.center.dy < overlayHeight / 2;

    return Material(
      color: Colors.transparent,
      child: Stack(
        children: [
          // Voile percé : le trou laisse voir l'élément réel.
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: _next,
              child: CustomPaint(
                painter: _SpotlightPainter(rect: rect, radius: step.radius),
              ),
            ),
          ),
          if (rect != null)
            Positioned(
              left: rect.left,
              top: rect.top,
              child: IgnorePointer(
                child: Container(
                  width: rect.width,
                  height: rect.height,
                  decoration: BoxDecoration(
                    border: Border.all(color: HikmaColors.gold, width: 2),
                    borderRadius: BorderRadius.circular(step.radius),
                  ),
                ),
              ),
            ),
          // La bulle s'ancre en haut ou en bas, du côté opposé à la zone
          // éclairée. La marge basse dégage le dock flottant, qui est rendu
          // par-dessus cet overlay et intercepterait les taps.
          Align(
            alignment: showBelow ? Alignment.bottomCenter : Alignment.topCenter,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 22, 22, 116),
              child: _CoachBubble(
                title: step.title,
                message: step.message,
                current: _index + 1,
                total: steps.length,
                isLast: isLast,
                onNext: _next,
                onSkip: widget.onFinish,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpotlightPainter extends CustomPainter {
  const _SpotlightPainter({required this.rect, required this.radius});

  final Rect? rect;
  final double radius;

  @override
  void paint(Canvas canvas, Size size) {
    final veil = Paint()..color = const Color(0xE6041A10);
    final full = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    if (rect == null) {
      canvas.drawPath(full, veil);
      return;
    }

    final hole = Path()
      ..addRRect(RRect.fromRectAndRadius(rect!, Radius.circular(radius)));
    canvas.drawPath(Path.combine(PathOperation.difference, full, hole), veil);
  }

  @override
  bool shouldRepaint(_SpotlightPainter oldDelegate) =>
      oldDelegate.rect != rect || oldDelegate.radius != radius;
}

class _CoachBubble extends StatelessWidget {
  const _CoachBubble({
    required this.title,
    required this.message,
    required this.current,
    required this.total,
    required this.isLast,
    required this.onNext,
    required this.onSkip,
  });

  final String title;
  final String message;
  final int current;
  final int total;
  final bool isLast;
  final VoidCallback onNext;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(26),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 30,
            offset: Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 7),
          Text(
            message,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 14,
              height: 1.45,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Text(
                '$current / $total',
                style: const TextStyle(
                  color: HikmaColors.emerald,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const Spacer(),
              if (!isLast)
                TextButton(
                  key: const ValueKey('coach-skip'),
                  onPressed: onSkip,
                  child: const Text('Passer'),
                ),
              const SizedBox(width: 4),
              FilledButton(
                onPressed: onNext,
                style: FilledButton.styleFrom(
                  backgroundColor: HikmaColors.emerald,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(isLast ? 'C’est parti' : 'Suivant'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
