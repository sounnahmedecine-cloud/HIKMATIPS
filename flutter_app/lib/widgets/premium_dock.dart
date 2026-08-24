import 'package:flutter/material.dart';

import '../services/haptics_service.dart';

class PremiumDock extends StatelessWidget {
  const PremiumDock({required this.index, required this.onChanged, super.key});

  final int index;
  final ValueChanged<int> onChanged;

  static const _items = <({String label, IconData icon})>[
    (label: 'Clips', icon: Icons.auto_awesome_rounded),
    (label: 'Recherche', icon: Icons.search_rounded),
    (label: 'Biblio', icon: Icons.menu_book_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      top: false,
      child: Container(
        height: 68,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface.withValues(alpha: .96),
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
          children: List.generate(
            _items.length,
            (i) => _DockItem(
              item: _items[i],
              active: index == i,
              onTap: () => _select(i),
            ),
          ),
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
