import 'package:flutter/material.dart';

import 'onboarding_notifications_screen.dart';
import 'onboarding_screen.dart';
import 'onboarding_widgets_screen.dart';
import 'premium_screen.dart';

/// Parcours du premier lancement : les slides de présentation, puis le
/// réglage des rappels, l'annonce des widgets et l'offre Premium.
class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({required this.onComplete, super.key});

  final VoidCallback onComplete;

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

enum _Step { slides, notifications, widgets, premium }

class _OnboardingFlowState extends State<OnboardingFlow> {
  _Step _step = _Step.slides;

  void _goTo(_Step step) {
    if (!mounted) return;
    setState(() => _step = step);
  }

  @override
  Widget build(BuildContext context) {
    // Le fondu évite une coupure sèche entre deux écrans plein écran.
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 280),
      child: switch (_step) {
        _Step.slides => OnboardingScreen(
          key: const ValueKey('onboarding-slides'),
          onComplete: () => _goTo(_Step.notifications),
        ),
        _Step.notifications => OnboardingNotificationsScreen(
          key: const ValueKey('onboarding-notifications'),
          onContinue: () => _goTo(_Step.widgets),
          onSkip: () => _goTo(_Step.widgets),
        ),
        _Step.widgets => OnboardingWidgetsScreen(
          key: const ValueKey('onboarding-widgets'),
          onContinue: () => _goTo(_Step.premium),
          onSkip: () => _goTo(_Step.premium),
        ),
        _Step.premium => PremiumScreen(
          key: const ValueKey('onboarding-premium'),
          onClose: widget.onComplete,
        ),
      },
    );
  }
}
