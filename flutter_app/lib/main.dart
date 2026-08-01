import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app.dart';
import 'services/app_preferences_service.dart';
import 'services/reminder_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  await AppPreferencesController.instance.initialize();
  try {
    await ReminderService.instance.initialize();
    await ReminderService.instance.restoreScheduledReminders();
  } on Object {
    // A notification failure must never prevent the application from opening.
  }
  runApp(const HikmaClipsApp());
}
