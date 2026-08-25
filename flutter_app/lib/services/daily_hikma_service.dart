import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/timezone.dart' as tz;

/// Paroles positives tirées du Coran et de la Sunna, servies à tour de rôle
/// dans les notifications quotidiennes.
const dailyHikmaMessages = <({String title, String body})>[
  (
    title: 'Votre Hikma du jour',
    body:
        '« C’est dans l’évocation d’Allah que les cœurs se tranquillisent. » '
        '— Ar-Ra’d 13:28',
  ),
  (
    title: 'Un instant de sérénité',
    body:
        '« Certes, avec la difficulté il y a une facilité. » '
        '— Ash-Sharh 94:6',
  ),
  (
    title: 'Une parole pour vous',
    body:
        '« Et recherchez l’aide dans la patience et la prière. » '
        '— Al-Baqara 2:45',
  ),
  (
    title: 'Gardez confiance',
    body:
        '« Allah n’impose à aucune âme une charge supérieure à sa capacité. » '
        '— Al-Baqara 2:286',
  ),
  (
    title: 'Rappel du jour',
    body:
        '« Quiconque place sa confiance en Allah, Il lui suffit. » '
        '— At-Talaq 65:3',
  ),
  (
    title: 'Une pensée apaisante',
    body:
        '« Ne désespérez pas de la miséricorde d’Allah. » '
        '— Az-Zumar 39:53',
  ),
  (
    title: 'Force et patience',
    body: '« Endure d’une belle patience. » — Al-Ma’arij 70:5',
  ),
  (
    title: 'Votre valeur',
    body:
        '« Les actions ne valent que par les intentions. » '
        '— Sahih al-Bukhari',
  ),
  (
    title: 'Un cœur léger',
    body:
        '« Le vrai croyant est celui dont les gens sont en sécurité. » '
        '— Sahih al-Bukhari',
  ),
  (
    title: 'Douceur du jour',
    body:
        '« Allah est Doux et Il aime la douceur en toute chose. » '
        '— Sahih Muslim',
  ),
  (
    title: 'Souriez',
    body:
        '« Sourire au visage de ton frère est une aumône. » '
        '— Sunan At-Tirmidhi',
  ),
  (
    title: 'Gratitude',
    body:
        '« Si vous êtes reconnaissants, Je vous donnerai davantage. » '
        '— Ibrahim 14:7',
  ),
];

/// Rappels quotidiens répartis entre deux heures, à la fréquence choisie.
/// Remplace les trois créneaux fixes par un réglage continu.
class DailyHikmaService {
  DailyHikmaService._();

  static final DailyHikmaService instance = DailyHikmaService._();

  static const _enabledKey = 'daily_hikma_enabled';
  static const _countKey = 'daily_hikma_count';
  static const _startHourKey = 'daily_hikma_start_hour';
  static const _endHourKey = 'daily_hikma_end_hour';

  /// Plage d'identifiants réservée, distincte des anciens rappels.
  static const _baseNotificationId = 2200;

  static const defaultCount = 5;
  static const defaultStartHour = 8;
  static const defaultEndHour = 20;
  static const minCount = 1;
  static const maxCount = 12;

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  SharedPreferencesAsync? _preferences;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  bool get isNativeMobile =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS);

  Future<({bool enabled, int count, int startHour, int endHour})>
  loadSettings() async {
    try {
      return (
        enabled: await _store.getBool(_enabledKey) ?? false,
        count: await _store.getInt(_countKey) ?? defaultCount,
        startHour: await _store.getInt(_startHourKey) ?? defaultStartHour,
        endHour: await _store.getInt(_endHourKey) ?? defaultEndHour,
      );
    } on Object {
      return (
        enabled: false,
        count: defaultCount,
        startHour: defaultStartHour,
        endHour: defaultEndHour,
      );
    }
  }

  /// Répartit `count` rappels à intervalle régulier entre `startHour` et
  /// `endHour`. Un seul rappel se place au milieu de la plage.
  List<({int hour, int minute})> plannedTimes({
    required int count,
    required int startHour,
    required int endHour,
  }) {
    final safeCount = count.clamp(minCount, maxCount);
    final start = startHour.clamp(0, 23);
    final end = endHour.clamp(start, 23);
    final spanMinutes = (end - start) * 60;

    if (safeCount == 1 || spanMinutes == 0) {
      final middle = start * 60 + spanMinutes ~/ 2;
      return [(hour: middle ~/ 60, minute: middle % 60)];
    }

    final step = spanMinutes / (safeCount - 1);
    return List.generate(safeCount, (index) {
      final minutes = (start * 60 + step * index).round();
      return (hour: minutes ~/ 60, minute: minutes % 60);
    });
  }

  Future<void> save({
    required bool enabled,
    required int count,
    required int startHour,
    required int endHour,
  }) async {
    await _store.setBool(_enabledKey, enabled);
    await _store.setInt(_countKey, count);
    await _store.setInt(_startHourKey, startHour);
    await _store.setInt(_endHourKey, endHour);
    await reschedule();
  }

  /// Annule puis reprogramme l'ensemble : la fréquence ayant pu baisser,
  /// il faut effacer les anciens identifiants avant d'en poser de nouveaux.
  Future<void> reschedule() async {
    if (!isNativeMobile) return;

    for (var index = 0; index < maxCount; index++) {
      await _notifications.cancel(id: _baseNotificationId + index);
    }

    final settings = await loadSettings();
    if (!settings.enabled) return;

    final times = plannedTimes(
      count: settings.count,
      startHour: settings.startHour,
      endHour: settings.endHour,
    );

    for (var index = 0; index < times.length; index++) {
      final message = dailyHikmaMessages[index % dailyHikmaMessages.length];
      await _schedule(
        id: _baseNotificationId + index,
        title: message.title,
        body: message.body,
        hour: times[index].hour,
        minute: times[index].minute,
      );
    }
  }

  Future<void> _schedule({
    required int id,
    required String title,
    required String body,
    required int hour,
    required int minute,
  }) async {
    await _notifications.zonedSchedule(
      id: id,
      title: title,
      body: body,
      scheduledDate: _nextOccurrence(hour, minute),
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'hikma_daily_reminders',
          'Rappels Hikma quotidiens',
          channelDescription: 'Paroles positives du Coran et de la Sunna.',
          icon: 'ic_stat_hikma',
          importance: Importance.high,
          priority: Priority.high,
          category: AndroidNotificationCategory.reminder,
          visibility: NotificationVisibility.public,
          styleInformation: BigTextStyleInformation(''),
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
      payload: 'hikma:daily:$id',
    );
  }

  tz.TZDateTime _nextOccurrence(int hour, int minute) {
    final now = tz.TZDateTime.now(tz.local);
    var scheduled = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );
    if (!scheduled.isAfter(now)) {
      scheduled = scheduled.add(const Duration(days: 1));
    }
    return scheduled;
  }
}
