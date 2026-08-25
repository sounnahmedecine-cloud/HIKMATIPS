import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

enum ReminderSlot {
  fajr(
    notificationId: 1101,
    label: 'Fajr',
    title: 'Un instant de Hikma pour Fajr',
    body: '« C’est dans l’évocation d’Allah que les cœurs se tranquillisent. »',
    defaultTime: ReminderTime(hour: 6, minute: 15),
  ),
  midi(
    notificationId: 1102,
    label: 'Midi',
    title: 'Votre pause Hikma',
    body: '« Et recherchez l’aide dans la patience et la prière. »',
    defaultTime: ReminderTime(hour: 12, minute: 30),
  ),
  isha(
    notificationId: 1103,
    label: 'Isha',
    title: 'Terminez la journée en paix',
    body: '« Certes, avec la difficulté il y a une facilité. »',
    defaultTime: ReminderTime(hour: 21, minute: 45),
  );

  const ReminderSlot({
    required this.notificationId,
    required this.label,
    required this.title,
    required this.body,
    required this.defaultTime,
  });

  final int notificationId;
  final String label;
  final String title;
  final String body;
  final ReminderTime defaultTime;

  String get enabledKey => 'reminder_${name}_enabled';
  String get hourKey => 'reminder_${name}_hour';
  String get minuteKey => 'reminder_${name}_minute';
}

class ReminderTime {
  const ReminderTime({required this.hour, required this.minute});

  final int hour;
  final int minute;
}

class ReminderSetting {
  const ReminderSetting({required this.enabled, required this.time});

  final bool enabled;
  final ReminderTime time;
}

class ReminderService {
  ReminderService._();

  static final ReminderService instance = ReminderService._();

  static const _channel = AndroidNotificationChannel(
    'hikma_daily_reminders',
    'Rappels Hikma quotidiens',
    description: 'Rappels spirituels programmés à Fajr, Midi et Isha.',
    importance: Importance.high,
  );

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  SharedPreferencesAsync? _preferences;

  bool _initialized = false;

  SharedPreferencesAsync get _preferenceStore =>
      _preferences ??= SharedPreferencesAsync();

  bool get isNativeMobile =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS);

  Future<void> initialize() async {
    if (_initialized || !isNativeMobile) return;

    tz_data.initializeTimeZones();
    try {
      final currentTimezone = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(currentTimezone.identifier));
    } on Object {
      tz.setLocalLocation(tz.UTC);
    }

    const androidSettings = AndroidInitializationSettings('ic_stat_hikma');
    const iosSettings = IOSInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _notifications.initialize(
      settings: const InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      ),
    );

    await _notifications
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(_channel);

    _initialized = true;
  }

  Future<Map<ReminderSlot, ReminderSetting>> loadSettings() async {
    final settings = <ReminderSlot, ReminderSetting>{};

    for (final slot in ReminderSlot.values) {
      try {
        settings[slot] = ReminderSetting(
          enabled:
              await _preferenceStore.getBool(slot.enabledKey) ??
              _defaultEnabled(slot),
          time: ReminderTime(
            hour:
                await _preferenceStore.getInt(slot.hourKey) ??
                slot.defaultTime.hour,
            minute:
                await _preferenceStore.getInt(slot.minuteKey) ??
                slot.defaultTime.minute,
          ),
        );
      } on Object {
        settings[slot] = ReminderSetting(
          enabled: _defaultEnabled(slot),
          time: slot.defaultTime,
        );
      }
    }

    return settings;
  }

  Future<bool> updateReminder({
    required ReminderSlot slot,
    required bool enabled,
    required ReminderTime time,
  }) async {
    await _saveSetting(slot: slot, enabled: enabled, time: time);
    if (!isNativeMobile) return true;

    await initialize();
    if (!enabled) {
      await _notifications.cancel(id: slot.notificationId);
      return true;
    }

    final permissionGranted = await _requestPermissions();
    if (!permissionGranted) {
      await _saveSetting(slot: slot, enabled: false, time: time);
      await _notifications.cancel(id: slot.notificationId);
      return false;
    }

    await _schedule(slot: slot, time: time);
    return true;
  }

  Future<void> restoreScheduledReminders() async {
    if (!isNativeMobile) return;

    await initialize();
    final settings = await loadSettings();
    for (final entry in settings.entries) {
      if (entry.value.enabled) {
        await _schedule(slot: entry.key, time: entry.value.time);
      } else {
        await _notifications.cancel(id: entry.key.notificationId);
      }
    }
  }

  Future<void> _saveSetting({
    required ReminderSlot slot,
    required bool enabled,
    required ReminderTime time,
  }) async {
    await _preferenceStore.setBool(slot.enabledKey, enabled);
    await _preferenceStore.setInt(slot.hourKey, time.hour);
    await _preferenceStore.setInt(slot.minuteKey, time.minute);
  }

  /// Exposee pour l'accueil, qui demande l'autorisation avant de
  /// programmer les rappels quotidiens.
  Future<bool> requestPermissions() => _requestPermissions();

  Future<bool> _requestPermissions() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return await _notifications
              .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin
              >()
              ?.requestNotificationsPermission() ??
          true;
    }

    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return await _notifications
              .resolvePlatformSpecificImplementation<
                IOSFlutterLocalNotificationsPlugin
              >()
              ?.requestPermissions(alert: true, badge: true, sound: true) ??
          false;
    }

    return false;
  }

  Future<void> _schedule({
    required ReminderSlot slot,
    required ReminderTime time,
  }) async {
    await _notifications.cancel(id: slot.notificationId);

    await _notifications.zonedSchedule(
      id: slot.notificationId,
      title: slot.title,
      body: slot.body,
      scheduledDate: _nextOccurrence(time),
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'hikma_daily_reminders',
          'Rappels Hikma quotidiens',
          channelDescription:
              'Rappels spirituels programmés à Fajr, Midi et Isha.',
          icon: 'ic_stat_hikma',
          importance: Importance.high,
          priority: Priority.high,
          category: AndroidNotificationCategory.reminder,
          visibility: NotificationVisibility.public,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
          threadIdentifier: 'hikma_daily_reminders',
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: 'hikma:${slot.name}',
    );
  }

  tz.TZDateTime _nextOccurrence(ReminderTime time) {
    final now = tz.TZDateTime.now(tz.local);
    var scheduled = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      time.hour,
      time.minute,
    );
    if (!scheduled.isAfter(now)) {
      scheduled = scheduled.add(const Duration(days: 1));
    }
    return scheduled;
  }

  bool _defaultEnabled(ReminderSlot slot) => false;
}
