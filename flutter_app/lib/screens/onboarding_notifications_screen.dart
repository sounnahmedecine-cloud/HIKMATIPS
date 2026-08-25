import 'package:flutter/material.dart';

import '../services/daily_hikma_service.dart';
import '../services/haptics_service.dart';
import '../services/premium_gate.dart';
import '../services/reminder_service.dart';
import '../theme/hikma_theme.dart';

/// Réglage des rappels quotidiens pendant l'accueil : combien de Hikma par
/// jour, et entre quelles heures.
class OnboardingNotificationsScreen extends StatefulWidget {
  const OnboardingNotificationsScreen({
    required this.onContinue,
    required this.onSkip,
    super.key,
  });

  final VoidCallback onContinue;
  final VoidCallback onSkip;

  @override
  State<OnboardingNotificationsScreen> createState() =>
      _OnboardingNotificationsScreenState();
}

class _OnboardingNotificationsScreenState
    extends State<OnboardingNotificationsScreen> {
  int _count = PremiumGate.isPremium
      ? DailyHikmaService.defaultCount
      : PremiumGate.freeReminderCount;
  int _startHour = DailyHikmaService.defaultStartHour;
  int _endHour = DailyHikmaService.defaultEndHour;
  bool _saving = false;

  void _changeCount(int delta) {
    // Sans abonnement la frequence reste a un rappel par jour : c'est le
    // principal argument du Premium.
    final ceiling = PremiumGate.isPremium
        ? DailyHikmaService.maxCount
        : PremiumGate.freeReminderCount;
    final next = (_count + delta).clamp(DailyHikmaService.minCount, ceiling);
    if (next == _count) {
      if (delta > 0 && !PremiumGate.isPremium) {
        ScaffoldMessenger.of(context)
          ..clearSnackBars()
          ..showSnackBar(
            const SnackBar(
              content: Text(
                'Passez a Premium pour recevoir plusieurs Hikma par jour.',
              ),
            ),
          );
      }
      return;
    }
    HapticsService.selection();
    setState(() => _count = next);
  }

  void _changeStart(int delta) {
    // La plage garde au moins une heure : sinon tous les rappels se
    // superposent à la même minute.
    final next = (_startHour + delta).clamp(0, _endHour - 1);
    if (next == _startHour) return;
    HapticsService.selection();
    setState(() => _startHour = next);
  }

  void _changeEnd(int delta) {
    final next = (_endHour + delta).clamp(_startHour + 1, 23);
    if (next == _endHour) return;
    HapticsService.selection();
    setState(() => _endHour = next);
  }

  Future<void> _activate() async {
    setState(() => _saving = true);
    HapticsService.selection();

    await ReminderService.instance.initialize();
    await ReminderService.instance.requestPermissions();
    await DailyHikmaService.instance.save(
      enabled: true,
      count: _count,
      startHour: _startHour,
      endHour: _endHour,
    );

    if (!mounted) return;
    setState(() => _saving = false);
    widget.onContinue();
  }

  String _formatHour(int hour) => '${hour.toString().padLeft(2, '0')}h00';

  @override
  Widget build(BuildContext context) {
    final times = DailyHikmaService.instance.plannedTimes(
      count: _count,
      startHour: _startHour,
      endHour: _endHour,
    );

    return Scaffold(
      backgroundColor: HikmaColors.emeraldDeep,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: widget.onSkip,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white.withValues(alpha: .85),
                ),
                child: const Text(
                  'Passer',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    Container(
                      width: 96,
                      height: 96,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: .14),
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: .28),
                        ),
                      ),
                      child: const Icon(
                        Icons.notifications_active_rounded,
                        size: 44,
                        color: HikmaColors.gold,
                      ),
                    ),
                    const SizedBox(height: 26),
                    const Text(
                      'Laissez-vous inspirer',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 27,
                        height: 1.15,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -.7,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Recevez chaque jour des paroles positives tirées du '
                      'Coran et de la Sunna.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: .84),
                        fontSize: 14.5,
                        height: 1.6,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 28),
                    _SettingRow(
                      label: 'Fréquence',
                      value: '$_count par jour',
                      onMinus: () => _changeCount(-1),
                      onPlus: () => _changeCount(1),
                    ),
                    const SizedBox(height: 12),
                    _SettingRow(
                      label: 'À partir de',
                      value: _formatHour(_startHour),
                      onMinus: () => _changeStart(-1),
                      onPlus: () => _changeStart(1),
                    ),
                    const SizedBox(height: 12),
                    _SettingRow(
                      label: 'Jusqu’à',
                      value: _formatHour(_endHour),
                      onMinus: () => _changeEnd(-1),
                      onPlus: () => _changeEnd(1),
                    ),
                    const SizedBox(height: 22),
                    // Aperçu concret : l'utilisateur voit à quelles heures
                    // il sera notifié avant d'accepter.
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 7,
                      runSpacing: 7,
                      children: times
                          .map(
                            (time) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 11,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: HikmaColors.gold.withValues(alpha: .18),
                                borderRadius: BorderRadius.circular(99),
                              ),
                              child: Text(
                                '${time.hour.toString().padLeft(2, '0')}:'
                                '${time.minute.toString().padLeft(2, '0')}',
                                style: const TextStyle(
                                  color: HikmaColors.gold,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: _saving ? null : _activate,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: HikmaColors.emeraldDeep,
                    disabledBackgroundColor: Colors.white70,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.4),
                        )
                      : const Text(
                          'Activer les rappels',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({
    required this.label,
    required this.value,
    required this.onMinus,
    required this.onPlus,
  });

  final String label;
  final String value;
  final VoidCallback onMinus;
  final VoidCallback onPlus;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 12, 12, 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: .72),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: .3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          _StepButton(icon: Icons.remove_rounded, onTap: onMinus),
          const SizedBox(width: 8),
          _StepButton(icon: Icons.add_rounded, onTap: onPlus),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: .16),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}
