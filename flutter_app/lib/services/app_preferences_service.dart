import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'haptics_service.dart';

class AppPreferencesController extends ChangeNotifier {
  AppPreferencesController._();

  static final AppPreferencesController instance = AppPreferencesController._();

  static const _themeKey = 'app_theme_mode';
  static const _hapticsKey = 'haptics_enabled';

  SharedPreferencesAsync? _preferences;
  int _themeIndex = 0;
  bool _hapticsEnabled = true;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  int get themeIndex => _themeIndex;
  bool get hapticsEnabled => _hapticsEnabled;

  ThemeMode get themeMode => switch (_themeIndex) {
    1 => ThemeMode.light,
    2 => ThemeMode.dark,
    _ => ThemeMode.system,
  };

  Future<void> initialize() async {
    try {
      _themeIndex = await _store.getInt(_themeKey) ?? 0;
      _hapticsEnabled = await _store.getBool(_hapticsKey) ?? true;
    } on Object {
      _themeIndex = 0;
      _hapticsEnabled = true;
    }
    HapticsService.enabled = _hapticsEnabled;
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
