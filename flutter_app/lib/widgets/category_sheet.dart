import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

class CategorySheet extends StatelessWidget {
  const CategorySheet({required this.onSelected, super.key});

  final ValueChanged<String> onSelected;

  static const _categories =
      <({String title, String subtitle, IconData icon, Color color})>[
        (
          title: 'Hadith',
          subtitle: 'Paroles authentiques',
          icon: Icons.auto_stories_rounded,
          color: HikmaColors.emerald,
        ),
        (
          title: 'Coran',
          subtitle: 'Versets du Livre',
          icon: Icons.book_rounded,
          color: HikmaColors.emeraldDeep,
        ),
        (
          title: 'Ramadan',
          subtitle: 'Rappels du mois béni',
          icon: CupertinoIcons.moon_stars_fill,
          color: HikmaColors.amber,
        ),
        (
          title: 'Thématique',
          subtitle: 'Sujets du quotidien',
          icon: Icons.grid_view_rounded,
          color: HikmaColors.emerald,
        ),
        (
          title: 'Recherche',
          subtitle: 'Retrouver un hadith',
          icon: Icons.search_rounded,
          color: HikmaColors.amber,
        ),
        (
          title: 'Citadelle',
          subtitle: 'Douas & invocations',
          icon: Icons.auto_awesome_rounded,
          color: HikmaColors.emeraldBright,
        ),
      ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * .78,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Align(
                child: Container(
                  width: 42,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD3D4CF),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Créer un rappel',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Choisissez une source pour votre prochain clip.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 1.14,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final category = _categories[index];
                    return InkWell(
                      onTap: () {
                        HapticsService.selection();
                        Navigator.pop(context);
                        onSelected(category.title);
                      },
                      borderRadius: BorderRadius.circular(22),
                      child: Ink(
                        padding: const EdgeInsets.all(17),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(
                            color: Theme.of(context).colorScheme.outlineVariant,
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x0D10251B),
                              blurRadius: 18,
                              offset: Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: category.color.withValues(alpha: .1),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                category.icon,
                                color: category.color,
                                size: 24,
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  category.title,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurface,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  category.subtitle,
                                  maxLines: 2,
                                  style: TextStyle(
                                    fontSize: 11,
                                    height: 1.25,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ThemeSheet extends StatelessWidget {
  const ThemeSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * .72,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Align(
                child: Container(
                  width: 42,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 18),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Choisir un thème',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Chaque collection ci-dessous provient du catalogue local.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: FutureBuilder<List<HikmaClip>>(
                  future: loadHikmaClips(),
                  builder: (context, snapshot) {
                    if (!snapshot.hasData) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    final counts = <String, int>{};
                    for (final clip in snapshot.data!) {
                      counts.update(
                        clip.tag,
                        (count) => count + 1,
                        ifAbsent: () => 1,
                      );
                    }
                    final themes = counts.entries.toList()
                      ..sort((a, b) {
                        final byCount = b.value.compareTo(a.value);
                        return byCount != 0 ? byCount : a.key.compareTo(b.key);
                      });

                    return ListView.separated(
                      itemCount: themes.length,
                      separatorBuilder: (_, _) => Divider(
                        color: Theme.of(context).colorScheme.outlineVariant,
                      ),
                      itemBuilder: (context, index) {
                        final theme = themes[index];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 4,
                          ),
                          leading: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: HikmaColors.emerald.withValues(alpha: .11),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(
                              Icons.auto_awesome_rounded,
                              color: HikmaColors.emerald,
                              size: 21,
                            ),
                          ),
                          title: Text(
                            theme.key,
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                          subtitle: Text(
                            '${theme.value} rappel${theme.value > 1 ? 's' : ''}',
                          ),
                          trailing: const Icon(Icons.chevron_right_rounded),
                          onTap: () {
                            HapticsService.selection();
                            Navigator.pop(context, theme.key);
                          },
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
