import 'package:flutter/material.dart';

import '../services/haptics_service.dart';
import '../services/premium_service.dart';
import '../theme/hikma_theme.dart';

/// Écran d'abonnement. Les prix affichés proviennent de Google Play dès que
/// les produits sont publiés ; sinon on montre les tarifs de référence et
/// l'achat reste indisponible plutôt que d'échouer sans explication.
class PremiumScreen extends StatefulWidget {
  const PremiumScreen({required this.onClose, super.key});

  final VoidCallback onClose;

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  static const _fallbackAnnual = '129,99 MAD';
  static const _fallbackMonthly = '21,99 MAD';

  bool _annualSelected = true;
  bool _freeTrial = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    PremiumService.instance.addListener(_onPremiumChanged);
    PremiumService.instance.initialize();
  }

  @override
  void dispose() {
    PremiumService.instance.removeListener(_onPremiumChanged);
    super.dispose();
  }

  void _onPremiumChanged() {
    if (!mounted) return;
    setState(() {});
    if (PremiumService.instance.isPremium) widget.onClose();
  }

  Future<void> _subscribe() async {
    final service = PremiumService.instance;
    final product = _annualSelected ? service.annual : service.monthly;

    if (product == null) {
      _showMessage(
        'Les abonnements ne sont pas encore disponibles sur votre compte.',
      );
      return;
    }

    setState(() => _busy = true);
    HapticsService.selection();
    final started = await service.buy(product);
    if (!mounted) return;
    setState(() => _busy = false);

    if (!started) {
      _showMessage('L’achat n’a pas pu démarrer. Réessayez plus tard.');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final service = PremiumService.instance;
    final annualPrice = service.annual?.price ?? _fallbackAnnual;
    final monthlyPrice = service.monthly?.price ?? _fallbackMonthly;
    final selectedPrice = _annualSelected
        ? '$annualPrice par an'
        : '$monthlyPrice par mois';

    return Scaffold(
      backgroundColor: HikmaColors.emeraldDeep,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: IconButton(
                  tooltip: 'Fermer',
                  onPressed: widget.onClose,
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: .14),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.close_rounded),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 26),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(
                      child: Text(
                        'HikmaClips Premium',
                        style: TextStyle(
                          color: HikmaColors.gold,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.6,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Toutes les Hikma',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        height: 1.15,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -.8,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const _Advantage(
                      icon: Icons.menu_book_rounded,
                      title: 'Bibliothèque complète',
                      subtitle:
                          'Débloquez toutes les Hikma pour cultiver votre '
                          'foi en Allah.',
                    ),
                    const SizedBox(height: 12),
                    const _Advantage(
                      icon: Icons.palette_outlined,
                      title: 'Thèmes exclusifs',
                      subtitle:
                          'Découvrez des arrière-plans inspirants, en accord '
                          'avec vous.',
                    ),
                    const SizedBox(height: 12),
                    const _Advantage(
                      icon: Icons.volunteer_activism_outlined,
                      title: 'Soutenez le projet',
                      subtitle:
                          'Vous soutenez les futurs développements. Qu’Allah '
                          'vous récompense pour votre confiance.',
                    ),
                    const SizedBox(height: 24),
                    _PlanCard(
                      selected: _annualSelected,
                      title: 'Annuel',
                      price: '$annualPrice par an',
                      detail: _annualPerMonth(annualPrice),
                      badge: 'RÉDUCTION 51 %',
                      onTap: () {
                        HapticsService.selection();
                        setState(() => _annualSelected = true);
                      },
                    ),
                    const SizedBox(height: 12),
                    _PlanCard(
                      selected: !_annualSelected,
                      title: 'Mensuel',
                      price: '$monthlyPrice par mois',
                      onTap: () {
                        HapticsService.selection();
                        setState(() => _annualSelected = false);
                      },
                    ),
                    const SizedBox(height: 16),
                    _TrialToggle(
                      value: _freeTrial,
                      onChanged: (value) {
                        HapticsService.selection();
                        setState(() => _freeTrial = value);
                      },
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(26, 0, 26, 24),
              child: Column(
                children: [
                  SizedBox(
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _busy ? null : _subscribe,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: HikmaColors.gold,
                        foregroundColor: HikmaColors.ink,
                        disabledBackgroundColor: HikmaColors.gold.withValues(
                          alpha: .6,
                        ),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                        ),
                      ),
                      child: _busy
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.4,
                                color: HikmaColors.ink,
                              ),
                            )
                          : Text(
                              _freeTrial ? 'Essayer gratuitement' : 'S’abonner',
                              style: const TextStyle(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Mention exigee par Google Play : duree de l'essai, prix
                  // preleve ensuite et possibilite d'annuler.
                  Text(
                    _freeTrial
                        ? '7 jours gratuits, puis $selectedPrice. '
                              'Annulable a tout moment.'
                        : 'Renouvellement automatique. '
                              'Annulable a tout moment.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: .62),
                      fontSize: 11.5,
                      height: 1.4,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  TextButton(
                    onPressed: () => PremiumService.instance.restore(),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.white.withValues(alpha: .7),
                    ),
                    child: const Text(
                      'Restaurer un achat',
                      style: TextStyle(fontSize: 12.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Décompose le tarif annuel en équivalent mensuel, quand le prix est
  /// exploitable. Sinon on garde la valeur de référence.
  String _annualPerMonth(String annualPrice) {
    final match = RegExp(r'([\d]+[.,]?[\d]*)').firstMatch(annualPrice);
    if (match == null) return '10,83 MAD par mois';
    final value = double.tryParse(match.group(1)!.replaceAll(',', '.'));
    if (value == null) return '10,83 MAD par mois';
    final monthly = (value / 12).toStringAsFixed(2).replaceAll('.', ',');
    return '$monthly MAD par mois';
  }
}

class _Advantage extends StatelessWidget {
  const _Advantage({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: .12),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, size: 20, color: HikmaColors.gold),
        ),
        const SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: .78),
                  fontSize: 13,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.selected,
    required this.title,
    required this.price,
    required this.onTap,
    this.detail,
    this.badge,
  });

  final bool selected;
  final String title;
  final String price;
  final String? detail;
  final String? badge;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected
          ? Colors.white.withValues(alpha: .16)
          : Colors.white.withValues(alpha: .07),
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: selected
                  ? HikmaColors.gold
                  : Colors.white.withValues(alpha: .16),
              width: selected ? 1.8 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                selected
                    ? Icons.radio_button_checked_rounded
                    : Icons.radio_button_unchecked_rounded,
                color: selected
                    ? HikmaColors.gold
                    : Colors.white.withValues(alpha: .5),
                size: 22,
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (badge != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: HikmaColors.rose,
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Text(
                              badge!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: .5,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      price,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: .82),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (detail != null)
                      Text(
                        detail!,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: .6),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrialToggle extends StatelessWidget {
  const _TrialToggle({required this.value, required this.onChanged});

  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => onChanged(!value),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          child: Row(
            children: [
              Icon(
                value
                    ? Icons.check_box_rounded
                    : Icons.check_box_outline_blank_rounded,
                color: value
                    ? HikmaColors.gold
                    : Colors.white.withValues(alpha: .6),
                size: 22,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Essayez gratuitement',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: .9),
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
