import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

abstract final class HikmaColors {
  static const emerald = Color(0xFF158047);
  static const emeraldBright = Color(0xFF29B766);
  static const emeraldDeep = Color(0xFF0B4C32);
  static const mint = Color(0xFFE5F7ED);
  static const ivory = Color(0xFFF8F6F0);
  static const surface = Color(0xFFFFFEFB);
  static const ink = Color(0xFF10251B);
  static const secondary = Color(0xFF68736C);
  static const line = Color(0xFFE6E4DC);
  static const gold = Color(0xFFE8B84A);
  static const amber = Color(0xFFF28B29);
  static const rose = Color(0xFFE45C72);
}

abstract final class HikmaTheme {
  static ThemeData get light {
    const scheme = ColorScheme.light(
      primary: HikmaColors.emerald,
      onPrimary: Colors.white,
      secondary: HikmaColors.gold,
      onSecondary: HikmaColors.ink,
      surface: HikmaColors.surface,
      onSurface: HikmaColors.ink,
      outline: HikmaColors.line,
      error: HikmaColors.rose,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: HikmaColors.ivory,
      fontFamily: 'SF Pro Display',
      fontFamilyFallback: const ['Roboto', 'Arial', 'sans-serif'],
      visualDensity: VisualDensity.standard,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: FadeForwardsPageTransitionsBuilder(),
          TargetPlatform.linux: FadeForwardsPageTransitionsBuilder(),
        },
      ),
      textTheme: const TextTheme(
        displaySmall: TextStyle(
          fontSize: 34,
          height: 1.05,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.1,
          color: HikmaColors.ink,
        ),
        headlineMedium: TextStyle(
          fontSize: 28,
          height: 1.08,
          fontWeight: FontWeight.w800,
          letterSpacing: -.7,
          color: HikmaColors.ink,
        ),
        titleLarge: TextStyle(
          fontSize: 20,
          height: 1.15,
          fontWeight: FontWeight.w700,
          letterSpacing: -.25,
          color: HikmaColors.ink,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          height: 1.45,
          fontWeight: FontWeight.w500,
          color: HikmaColors.ink,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          height: 1.4,
          fontWeight: FontWeight.w500,
          color: HikmaColors.secondary,
        ),
        labelLarge: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          letterSpacing: .05,
        ),
      ),
      cardTheme: CardThemeData(
        margin: EdgeInsets.zero,
        color: HikmaColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        hintStyle: const TextStyle(
          color: Color(0xFF99A19D),
          fontWeight: FontWeight.w500,
        ),
        prefixIconColor: HikmaColors.secondary,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 18,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: const BorderSide(color: Color(0x150B4C32)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: const BorderSide(
            color: HikmaColors.emeraldBright,
            width: 1.4,
          ),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.all(Colors.white),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? HikmaColors.emerald
              : const Color(0xFFDADDD9),
        ),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
    );
  }

  static ThemeData get dark {
    const scheme = ColorScheme.dark(
      primary: Color(0xFF56D88E),
      onPrimary: Color(0xFF062517),
      secondary: HikmaColors.gold,
      onSecondary: Color(0xFF211A06),
      surface: Color(0xFF10251B),
      onSurface: Color(0xFFF7F5EE),
      onSurfaceVariant: Color(0xFFB8C4BC),
      outline: Color(0xFF3D5146),
      outlineVariant: Color(0xFF263B30),
      error: Color(0xFFFF8DA0),
    );

    final base = light;
    return base.copyWith(
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFF07140F),
      canvasColor: const Color(0xFF07140F),
      cardColor: scheme.surface,
      textTheme: base.textTheme.apply(
        bodyColor: scheme.onSurface,
        displayColor: scheme.onSurface,
      ),
      cardTheme: CardThemeData(
        margin: EdgeInsets.zero,
        color: scheme.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
      ),
      inputDecorationTheme: base.inputDecorationTheme.copyWith(
        fillColor: const Color(0xFF183127),
        hintStyle: const TextStyle(
          color: Color(0xFF98A89E),
          fontWeight: FontWeight.w500,
        ),
        prefixIconColor: scheme.onSurfaceVariant,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      dividerColor: scheme.outlineVariant,
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.all(Colors.white),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? HikmaColors.emerald
              : const Color(0xFF405248),
        ),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
    );
  }
}
