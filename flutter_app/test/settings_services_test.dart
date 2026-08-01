import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hikmaclips/services/app_preferences_service.dart';
import 'package:hikmaclips/services/haptics_service.dart';
import 'package:hikmaclips/services/reminder_service.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
  });

  tearDown(() {
    debugDefaultTargetPlatformOverride = null;
    SharedPreferencesAsyncPlatform.instance = null;
  });

  test(
    'appearance and haptics settings are applied by the controller',
    () async {
      final controller = AppPreferencesController.instance;
      await controller.initialize();

      await controller.setThemeIndex(2);
      expect(controller.themeIndex, 2);

      await controller.setHapticsEnabled(false);
      expect(controller.hapticsEnabled, isFalse);
      expect(HapticsService.enabled, isFalse);
    },
  );

  test('daily reminder time and enabled state are persisted', () async {
    const time = ReminderTime(hour: 12, minute: 42);
    final updated = await ReminderService.instance.updateReminder(
      slot: ReminderSlot.midi,
      enabled: true,
      time: time,
    );
    final settings = await ReminderService.instance.loadSettings();

    expect(updated, isTrue);
    expect(settings[ReminderSlot.midi]?.enabled, isTrue);
    expect(settings[ReminderSlot.midi]?.time.hour, 12);
    expect(settings[ReminderSlot.midi]?.time.minute, 42);
  });
}
