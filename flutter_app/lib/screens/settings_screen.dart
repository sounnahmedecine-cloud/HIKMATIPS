import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/hikma_clip.dart';
import '../services/app_preferences_service.dart';
import '../services/haptics_service.dart';
import '../services/reminder_service.dart';
import '../theme/hikma_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _fajr = false;
  bool _midi = false;
  bool _isha = false;
  bool _haptics = true;
  int _appearance = 0;
  ReminderTime _fajrTime = ReminderSlot.fajr.defaultTime;
  ReminderTime _midiTime = ReminderSlot.midi.defaultTime;
  ReminderTime _ishaTime = ReminderSlot.isha.defaultTime;

  @override
  void initState() {
    super.initState();
    _syncPreferences();
    AppPreferencesController.instance.addListener(_syncPreferences);
    _loadReminders();
  }

  @override
  void dispose() {
    AppPreferencesController.instance.removeListener(_syncPreferences);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          MediaQuery.paddingOf(context).top + 24,
          20,
          120,
        ),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Réglages',
                  style: Theme.of(context).textTheme.displaySmall,
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.verified_user_outlined,
                  color: HikmaColors.emerald,
                  size: 25,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Une expérience qui s’adapte à votre rythme.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 22),
          const _LocalFirstCard(),
          const SizedBox(height: 28),
          const _SectionTitle(
            overline: 'RAPPELS QUOTIDIENS',
            title: 'Votre rendez-vous avec la Hikma',
          ),
          const SizedBox(height: 13),
          _SettingsCard(
            children: [
              _ReminderTile(
                icon: CupertinoIcons.sunrise_fill,
                color: const Color(0xFFEEA952),
                title: 'Fajr',
                subtitle:
                    'Un rappel au lever du jour · ${_formatTime(_fajrTime)}',
                value: _fajr,
                onChanged: (value) =>
                    _updateReminder(ReminderSlot.fajr, enabled: value),
                onTimeTap: () => _chooseTime(ReminderSlot.fajr),
              ),
              const _Divider(),
              _ReminderTile(
                icon: CupertinoIcons.sun_max_fill,
                color: const Color(0xFFF0B52D),
                title: 'Midi',
                subtitle: 'Une pause inspirante · ${_formatTime(_midiTime)}',
                value: _midi,
                onChanged: (value) =>
                    _updateReminder(ReminderSlot.midi, enabled: value),
                onTimeTap: () => _chooseTime(ReminderSlot.midi),
              ),
              const _Divider(),
              _ReminderTile(
                icon: CupertinoIcons.moon_stars_fill,
                color: const Color(0xFF536E9F),
                title: 'Isha',
                subtitle:
                    'Terminer la journée en paix · ${_formatTime(_ishaTime)}',
                value: _isha,
                onChanged: (value) =>
                    _updateReminder(ReminderSlot.isha, enabled: value),
                onTimeTap: () => _chooseTime(ReminderSlot.isha),
              ),
            ],
          ),
          const SizedBox(height: 28),
          const _SectionTitle(
            overline: 'APPARENCE',
            title: 'Ambiance de l’application',
          ),
          const SizedBox(height: 13),
          _SettingsCard(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: CupertinoSlidingSegmentedControl<int>(
                  groupValue: _appearance,
                  thumbColor: Colors.white,
                  backgroundColor: const Color(0xFFEDEFEA),
                  children: const {
                    0: _AppearanceLabel(
                      icon: CupertinoIcons.circle_lefthalf_fill,
                      text: 'Système',
                    ),
                    1: _AppearanceLabel(
                      icon: CupertinoIcons.sun_max,
                      text: 'Clair',
                    ),
                    2: _AppearanceLabel(
                      icon: CupertinoIcons.moon,
                      text: 'Sombre',
                    ),
                  },
                  onValueChanged: (value) {
                    if (value == null) return;
                    HapticsService.selection();
                    AppPreferencesController.instance.setThemeIndex(value);
                  },
                ),
              ),
              const _Divider(),
              _SimpleSwitchTile(
                icon: Icons.vibration_rounded,
                title: 'Retour haptique',
                subtitle: 'Une vibration douce à chaque action',
                value: _haptics,
                onChanged: AppPreferencesController.instance.setHapticsEnabled,
              ),
            ],
          ),
          const SizedBox(height: 28),
          const _SectionTitle(overline: 'À PROPOS', title: 'HikmaClips'),
          const SizedBox(height: 13),
          _SettingsCard(
            children: [
              _LinkTile(
                icon: Icons.shield_outlined,
                title: 'Sources & authenticité',
                onTap: _showSources,
              ),
              const _Divider(),
              _LinkTile(
                icon: Icons.lock_outline_rounded,
                title: 'Confidentialité',
                onTap: _showPrivacy,
              ),
              const _Divider(),
              _LinkTile(
                icon: Icons.help_outline_rounded,
                title: 'Aide et contact',
                trailing: 'Version 1.3.3',
                onTap: _showHelp,
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _syncPreferences() {
    if (!mounted) return;
    final preferences = AppPreferencesController.instance;
    setState(() {
      _appearance = preferences.themeIndex;
      _haptics = preferences.hapticsEnabled;
    });
  }

  Future<void> _loadReminders() async {
    final settings = await ReminderService.instance.loadSettings();
    if (!mounted) return;

    setState(() {
      _fajr = settings[ReminderSlot.fajr]?.enabled ?? _fajr;
      _midi = settings[ReminderSlot.midi]?.enabled ?? _midi;
      _isha = settings[ReminderSlot.isha]?.enabled ?? _isha;
      _fajrTime = settings[ReminderSlot.fajr]?.time ?? _fajrTime;
      _midiTime = settings[ReminderSlot.midi]?.time ?? _midiTime;
      _ishaTime = settings[ReminderSlot.isha]?.time ?? _ishaTime;
    });
  }

  Future<void> _updateReminder(
    ReminderSlot slot, {
    required bool enabled,
  }) async {
    final previousValue = _enabledFor(slot);
    _setEnabled(slot, enabled);
    final time = _timeFor(slot);
    bool permissionGranted;
    try {
      permissionGranted = await ReminderService.instance.updateReminder(
        slot: slot,
        enabled: enabled,
        time: time,
      );
    } on Object {
      if (mounted) {
        _setEnabled(slot, previousValue);
        _showReminderMessage('Le rappel n’a pas pu être programmé.');
      }
      return;
    }
    if (!mounted) return;

    if (!permissionGranted) {
      _setEnabled(slot, false);
      _showReminderMessage(
        'Autorisez les notifications pour activer ce rappel.',
      );
      return;
    }

    _showReminderMessage(
      enabled
          ? 'Rappel ${slot.label} activé à ${_formatTime(time)}.'
          : 'Rappel ${slot.label} désactivé.',
    );
  }

  Future<void> _chooseTime(ReminderSlot slot) async {
    HapticsService.selection();
    final current = _timeFor(slot);
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: current.hour, minute: current.minute),
      helpText: 'HEURE DU RAPPEL ${slot.label.toUpperCase()}',
      cancelText: 'ANNULER',
      confirmText: 'ENREGISTRER',
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          timePickerTheme: TimePickerThemeData(
            backgroundColor: HikmaColors.ivory,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
          ),
        ),
        child: child!,
      ),
    );
    if (picked == null || !mounted) return;

    final newTime = ReminderTime(hour: picked.hour, minute: picked.minute);
    _setTime(slot, newTime);
    bool permissionGranted;
    try {
      permissionGranted = await ReminderService.instance.updateReminder(
        slot: slot,
        enabled: _enabledFor(slot),
        time: newTime,
      );
    } on Object {
      if (mounted) {
        _setTime(slot, current);
        _showReminderMessage('L’heure n’a pas pu être enregistrée.');
      }
      return;
    }
    if (!mounted) return;

    if (!permissionGranted) {
      _setEnabled(slot, false);
      _showReminderMessage(
        'Heure enregistrée. Autorisez les notifications pour activer le rappel.',
      );
      return;
    }

    _showReminderMessage('${slot.label} programmé à ${_formatTime(newTime)}.');
  }

  bool _enabledFor(ReminderSlot slot) => switch (slot) {
    ReminderSlot.fajr => _fajr,
    ReminderSlot.midi => _midi,
    ReminderSlot.isha => _isha,
  };

  ReminderTime _timeFor(ReminderSlot slot) => switch (slot) {
    ReminderSlot.fajr => _fajrTime,
    ReminderSlot.midi => _midiTime,
    ReminderSlot.isha => _ishaTime,
  };

  void _setEnabled(ReminderSlot slot, bool enabled) {
    if (!mounted) return;
    setState(() {
      switch (slot) {
        case ReminderSlot.fajr:
          _fajr = enabled;
        case ReminderSlot.midi:
          _midi = enabled;
        case ReminderSlot.isha:
          _isha = enabled;
      }
    });
  }

  void _setTime(ReminderSlot slot, ReminderTime time) {
    setState(() {
      switch (slot) {
        case ReminderSlot.fajr:
          _fajrTime = time;
        case ReminderSlot.midi:
          _midiTime = time;
        case ReminderSlot.isha:
          _ishaTime = time;
      }
    });
  }

  String _formatTime(ReminderTime time) =>
      '${time.hour.toString().padLeft(2, '0')}:'
      '${time.minute.toString().padLeft(2, '0')}';

  void _showReminderMessage(String message) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: HikmaColors.emeraldDeep,
          margin: const EdgeInsets.fromLTRB(18, 0, 18, 98),
        ),
      );
  }

  Future<void> _showSources() async {
    final clips = await loadHikmaClips();
    if (!mounted) return;
    final hadiths = clips.where((clip) => clip.kind == 'hadith').length;
    final verses = clips.where((clip) => clip.kind == 'coran').length;
    final ramadan = clips.where((clip) => clip.kind == 'ramadan').length;
    final invocations = clips.where((clip) => clip.kind == 'invocation').length;
    await _showInfoSheet(
      icon: Icons.shield_outlined,
      title: 'Sources & authenticité',
      children: [
        Text(
          '$hadiths hadiths, $verses versets, $ramadan rappels Ramadan '
          'et $invocations invocations sont intégrés hors ligne.',
        ),
        const SizedBox(height: 12),
        const Text(
          'Chaque rappel affiche sa source. La recherche ne fabrique aucune '
          'référence : elle interroge uniquement ce catalogue local. Pour une '
          'étude religieuse approfondie, consultez toujours le recueil cité '
          'et un enseignant qualifié.',
        ),
      ],
    );
  }

  Future<void> _showPrivacy() {
    return _showInfoSheet(
      icon: Icons.lock_outline_rounded,
      title: 'Confidentialité',
      children: const [
        Text(
          'Cette version Flutter fonctionne sans compte et sans suivi '
          'publicitaire. Les favoris, les horaires, le thème et l’historique '
          'de recherche restent enregistrés localement sur l’appareil.',
        ),
        SizedBox(height: 12),
        Text(
          'Une image choisie depuis la galerie sert uniquement de fond dans '
          'l’application. Elle n’est pas envoyée à un serveur par HikmaClips. '
          'Le partage ne se produit qu’après une action explicite de votre part.',
        ),
      ],
    );
  }

  Future<void> _showHelp() {
    const email = 'contact@hikmaclips.com';
    return _showInfoSheet(
      icon: Icons.help_outline_rounded,
      title: 'Aide et contact',
      children: [
        const Text(
          'Pour signaler une référence, un problème d’affichage ou une '
          'difficulté avec les notifications :',
        ),
        const SizedBox(height: 14),
        SelectableText(
          email,
          style: const TextStyle(
            color: HikmaColors.emerald,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 14),
        FilledButton.icon(
          onPressed: () async {
            await Clipboard.setData(const ClipboardData(text: email));
            if (mounted) {
              _showReminderMessage('Adresse e-mail copiée.');
            }
          },
          icon: const Icon(Icons.copy_rounded),
          label: const Text('Copier l’adresse'),
        ),
      ],
    );
  }

  Future<void> _showInfoSheet({
    required IconData icon,
    required String title,
    required List<Widget> children,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      builder: (context) => Padding(
        padding: const EdgeInsets.fromLTRB(22, 6, 22, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: HikmaColors.emerald.withValues(alpha: .12),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Icon(icon, color: HikmaColors.emerald),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            DefaultTextStyle.merge(
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                height: 1.5,
                fontSize: 13,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: children,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LocalFirstCard extends StatelessWidget {
  const _LocalFirstCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            HikmaColors.emeraldDeep,
            Color(0xFF12633E),
            HikmaColors.emerald,
          ],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: const [
          BoxShadow(
            color: Color(0x3D0B4C32),
            blurRadius: 28,
            offset: Offset(0, 13),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: HikmaColors.gold.withValues(alpha: .18),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: HikmaColors.gold.withValues(alpha: .4)),
            ),
            child: const Icon(
              Icons.offline_bolt_rounded,
              color: HikmaColors.gold,
              size: 28,
            ),
          ),
          const SizedBox(width: 15),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'HikmaClips hors ligne',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Rappels, recherche et Coran accessibles sans compte.',
                  style: TextStyle(
                    color: Color(0xCFFFFFFF),
                    fontSize: 11,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.verified_rounded, color: Colors.white),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.overline, required this.title});

  final String overline;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          overline,
          style: const TextStyle(
            color: HikmaColors.emerald,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          title,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurface,
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: -.2,
          ),
        ),
      ],
    );
  }
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0E10251B),
            blurRadius: 22,
            offset: Offset(0, 9),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children),
    );
  }
}

class _ReminderTile extends StatelessWidget {
  const _ReminderTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.onTimeTap,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final VoidCallback onTimeTap;

  @override
  Widget build(BuildContext context) {
    return _SwitchTileBase(
      leading: _SettingsIcon(icon: icon, color: color),
      title: title,
      subtitle: subtitle,
      value: value,
      onChanged: onChanged,
      onBodyTap: onTimeTap,
    );
  }
}

class _SimpleSwitchTile extends StatelessWidget {
  const _SimpleSwitchTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return _SwitchTileBase(
      leading: _SettingsIcon(icon: icon, color: HikmaColors.emerald),
      title: title,
      subtitle: subtitle,
      value: value,
      onChanged: onChanged,
    );
  }
}

class _SwitchTileBase extends StatelessWidget {
  const _SwitchTileBase({
    required this.leading,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    this.onBodyTap,
  });

  final Widget leading;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final VoidCallback? onBodyTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 5, 12, 5),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: onBodyTap,
              borderRadius: BorderRadius.circular(18),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 8),
                child: Row(
                  children: [
                    leading,
                    const SizedBox(width: 13),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            subtitle,
                            style: TextStyle(
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                              fontSize: 10.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (onBodyTap != null)
                      const Icon(
                        Icons.schedule_rounded,
                        color: Color(0xFF9CA39E),
                        size: 18,
                      ),
                  ],
                ),
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: (newValue) {
              HapticsService.light();
              onChanged(newValue);
            },
          ),
        ],
      ),
    );
  }
}

class _SettingsIcon extends StatelessWidget {
  const _SettingsIcon({required this.icon, required this.color});

  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: color.withValues(alpha: .11),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: color, size: 21),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      indent: 70,
      color: Theme.of(context).colorScheme.outlineVariant,
    );
  }
}

class _AppearanceLabel extends StatelessWidget {
  const _AppearanceLabel({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 14),
          const SizedBox(width: 5),
          Text(
            text,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _LinkTile extends StatelessWidget {
  const _LinkTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        child: Row(
          children: [
            Icon(icon, color: HikmaColors.emerald, size: 21),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            if (trailing != null)
              Text(
                trailing!,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 10,
                ),
              ),
            const SizedBox(width: 4),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFF9CA39E),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
