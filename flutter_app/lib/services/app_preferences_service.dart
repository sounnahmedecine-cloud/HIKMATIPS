import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'haptics_service.dart';

class AppPreferencesController extends ChangeNotifier {
  AppPreferencesController._();

  static final AppPreferencesController instance = AppPreferencesController._();

  static const _themeKey = 'app_theme_mode';
  static const _hapticsKey = 'haptics_enabled';
  static const _onboardingKey = 'onboarding_seen';
  static const _coachMarksKey = 'coach_marks_seen';

  SharedPreferencesAsync? _preferences;
  int _themeIndex = 0;
  bool _hapticsEnabled = true;
  bool _onboardingSeen = false;
  bool _coachMarksSeen = false;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  int get themeIndex => _themeIndex;
  bool get hapticsEnabled => _hapticsEnabled;

  /// Faux au tout premier lancement : les slides d'accueil s'affichent
  /// alors une seule fois.
  bool get onboardingSeen => _onboardingSeen;

  /// Faux tant que le guidage de l'écran Clips n'a pas été vu.
  bool get coachMarksSeen => _coachMarksSeen;

  ThemeMode get themeMode => switch (_themeIndex) {
    1 => ThemeMode.light,
    2 => ThemeMode.dark,
    _ => ThemeMode.system,
  };

  Future<void> initialize() async {
    try {
      _themeIndex = await _store.getInt(_themeKey) ?? 0;
      _hapticsEnabled = await _store.getBool(_hapticsKey) ?? true;
      _onboardingSeen = await _store.getBool(_onboardingKey) ?? false;
      _coachMarksSeen = await _store.getBool(_coachMarksKey) ?? false;
    } on Object {
      _themeIndex = 0;
      _hapticsEnabled = true;
      _onboardingSeen = false;
      _coachMarksSeen = false;
    }
    HapticsService.enabled = _hapticsEnabled;
  }

  Future<void> markOnboardingSeen() async {
    if (_onboardingSeen) return;
    _onboardingSeen = true;
    notifyListeners();
    await _store.setBool(_onboardingKey, true);
  }

  /// Ne notifie pas : le guidage vit dans l'état local de l'écran, et un
  /// rebuild global le remonterait aussitôt.
  Future<void> markCoachMarksSeen() async {
    if (_coachMarksSeen) return;
    _coachMarksSeen = true;
    await _store.setBool(_coachMarksKey, true);
  }

  Future<void> setThemeIndex(int value) async {
    if (value < 0 || value > 2 || value == _themeIndex) return;
    _themeIndex = value;
    notifyListeners();
    await _store.setInt(_themeKey, value);
  }

  Future<void> setHapticsEnabled(bool value) async {
    if (value == _hapticsEnabled) return;
    _hapticsEnabled = value;
    HapticsService.enabled = value;
    notifyListeners();
    await _store.setBool(_hapticsKey, value);
    if (value) await HapticsService.selection();
  }
}
