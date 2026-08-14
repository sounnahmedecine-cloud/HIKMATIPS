import 'package:flutter/material.dart';

import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

class PremiumDock extends StatelessWidget {
  const PremiumDock({
    required this.index,
    required this.onChanged,
    required this.onGenerate,
    super.key,
  });

  final int index;
  final ValueChanged<int> onChanged;
  final VoidCallback onGenerate;

  static const _items = <({String label, IconData icon})>[
    (label: 'Clips', icon: Icons.auto_awesome_rounded),
    (label: 'Recherche', icon: Icons.search_rounded),
    (label: 'Biblio', icon: Icons.menu_book_rounded),
    (label: 'Coran', icon: Icons.headset_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      top: false,
      child: SizedBox(
        height: 82,
        child: Stack(
          alignment: Alignment.bottomCenter,
          clipBehavior: Clip.none,
          children: [
            Container(
              height: 68,
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.surface.withValues(alpha: .96),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: Theme.of(context).colorScheme.outlineVariant,
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x2410251B),
                    blurRadius: 30,
                    offset: Offset(0, 12),
                  ),
                ],
              ),
              child: Row(
                children: [
                  ...List.generate(
                    2,
                    (i) => _DockItem(
                      item: _items[i],
                      active: index == i,
                      onTap: () => _select(i),
                    ),
                  ),
                  const SizedBox(width: 68),
                  ...List.generate(2, (i) {
                    final actual = i + 2;
                    return _DockItem(
                      item: _items[actual],
                      active: index == actual,
                      onTap: () => _select(actual),
                    );
                  }),
                ],
              ),
            ),
            Positioned(
              top: 0,
              child: Semantics(
                button: true,
                label: 'Créer un nouveau rappel',
                child: GestureDetector(
                  onTap: () {
                    HapticsService.medium();
                    onGenerate();
                  },
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          HikmaColors.emeraldDeep,
                          HikmaColors.emeraldBright,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(21),
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x6640C878),
                          blurRadius: 24,
                          offset: Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.bolt_rounded,
                      color: Colors.white,
                      size: 32,
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

  void _select(int newIndex) {
    HapticsService.selection();
    onChanged(newIndex);
  }
}

class _DockItem extends StatelessWidget {
  const _DockItem({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final ({String label, IconData icon}) item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.onSurfaceVariant;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.only(top: 9, bottom: 7),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, size: 21, color: color),
              const SizedBox(height: 3),
              Text(
                item.label,
                maxLines: 1,
                style: TextStyle(
                  color: color,
                  fontSize: 9.5,
                  fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
