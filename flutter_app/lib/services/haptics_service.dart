import 'package:flutter/services.dart';

abstract final class HapticsService {
  static bool enabled = true;

  static Future<void> selection() async {
    if (enabled) await HapticFeedback.selectionClick();
  }

  static Future<void> light() async {
    if (enabled) await HapticFeedback.lightImpact();
  }

  static Future<void> medium() async {
    if (enabled) await HapticFeedback.mediumImpact();
  }
}
