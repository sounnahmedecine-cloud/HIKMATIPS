import 'package:flutter/material.dart';

import 'screens/home_shell.dart';
import 'screens/onboarding_flow.dart';
import 'services/app_preferences_service.dart';
import 'theme/hikma_theme.dart';

class HikmaClipsApp extends StatelessWidget {
  const HikmaClipsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppPreferencesController.instance,
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'HikmaClips',
          theme: HikmaTheme.light,
          darkTheme: HikmaTheme.dark,
          themeMode: AppPreferencesController.instance.themeMode,
          home: AppPreferencesController.instance.onboardingSeen
              ? const HomeShell()
              : OnboardingFlow(
                  onComplete:
                      AppPreferencesController.instance.markOnboardingSeen,
                ),
          // Sur tablette et web l'application occupe toute la largeur :
          // seule la largeur du contenu est bornée pour rester lisible,
          // au lieu d'être enfermée dans une maquette de téléphone.
          builder: (context, child) {
            final width = MediaQuery.sizeOf(context).width;
            if (width < 700) return child ?? const SizedBox.shrink();

            return ColoredBox(
              color: Theme.of(context).scaffoldBackgroundColor,
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 900),
                  child: child,
                ),
              ),
            );
          },
        );
      },
    );
  }
}
