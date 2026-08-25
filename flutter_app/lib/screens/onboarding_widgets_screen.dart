import 'package:flutter/material.dart';

import '../theme/hikma_theme.dart';

/// Présente le widget d'écran d'accueil. L'aperçu montre à quoi ressemble
/// la vignette une fois posée sur le bureau du téléphone.
class OnboardingWidgetsScreen extends StatelessWidget {
  const OnboardingWidgetsScreen({
    required this.onContinue,
    required this.onSkip,
    super.key,
  });

  final VoidCallback onContinue;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HikmaColors.emeraldDeep,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onSkip,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white.withValues(alpha: .85),
                ),
                child: const Text(
                  'Passer',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  children: [
                    const SizedBox(height: 8),
                    const _WidgetPreview(),
                    const SizedBox(height: 32),
                    const Text(
                      'Widgets pratiques',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 27,
                        height: 1.15,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -.7,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Recevez des Hikma positifs directement sur l’écran '
                      'd’accueil de votre appareil.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: .84),
                        fontSize: 14.5,
                        height: 1.6,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: HikmaColors.gold.withValues(alpha: .18),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: const Text(
                        'Bientôt disponible',
                        style: TextStyle(
                          color: HikmaColors.gold,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: .4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: onContinue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: HikmaColors.emeraldDeep,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: const Text(
                    'Continuer',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WidgetPreview extends StatelessWidget {
  const _WidgetPreview();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withValues(alpha: .18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 26,
                height: 26,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [HikmaColors.emerald, HikmaColors.gold],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  size: 15,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 9),
              Text(
                'HikmaClips',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: .8),
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            '« Certes, avec la difficulté il y a une facilité. »',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              height: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(width: 22, height: 2, color: HikmaColors.gold),
              const SizedBox(width: 8),
              Text(
                'ASH-SHARH 94:6',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: .78),
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
