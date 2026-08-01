import 'package:flutter/material.dart';

import 'screens/home_shell.dart';
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
          home: const HomeShell(),
          builder: (context, child) {
            final width = MediaQuery.sizeOf(context).width;
            if (width < 700) return child ?? const SizedBox.shrink();

            return ColoredBox(
              color: HikmaColors.ink,
              child: Center(
                child: Container(
                  width: 460,
                  margin: const EdgeInsets.symmetric(vertical: 18),
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(38),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: .12),
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x73000000),
                        blurRadius: 54,
                        offset: Offset(0, 24),
                      ),
                    ],
                  ),
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
