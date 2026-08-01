import 'package:flutter/material.dart';

import '../models/server_background.dart';
import '../theme/hikma_theme.dart';

class ServerBackgroundSheet extends StatefulWidget {
  const ServerBackgroundSheet({required this.currentUrl, super.key});

  final String? currentUrl;

  @override
  State<ServerBackgroundSheet> createState() => _ServerBackgroundSheetState();
}

class _ServerBackgroundSheetState extends State<ServerBackgroundSheet> {
  String _category = 'Tout';

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * .86,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Align(
                child: Container(
                  width: 42,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 14),
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
                          'Fonds HikmaClips',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Images HD chargées depuis votre serveur',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    tooltip: 'Fermer',
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              FutureBuilder<List<ServerBackground>>(
                future: loadServerBackgrounds(),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return const Expanded(child: _ServerGalleryError());
                  }
                  if (!snapshot.hasData) {
                    return const Expanded(
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }

                  final allBackgrounds = snapshot.data!;
                  final categories = <String>[
                    'Tout',
                    ...{
                      for (final background in allBackgrounds)
                        background.category,
                    },
                  ];
                  final backgrounds = _category == 'Tout'
                      ? allBackgrounds
                      : allBackgrounds
                            .where(
                              (background) => background.category == _category,
                            )
                            .toList();

                  return Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${allBackgrounds.length} images disponibles',
                          key: const ValueKey('server-background-count'),
                          style: const TextStyle(
                            color: HikmaColors.emerald,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          height: 38,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: categories.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(width: 7),
                            itemBuilder: (context, index) {
                              final category = categories[index];
                              return ChoiceChip(
                                label: Text(category),
                                selected: _category == category,
                                onSelected: (_) {
                                  setState(() => _category = category);
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: GridView.builder(
                            key: const ValueKey('server-background-grid'),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  crossAxisSpacing: 10,
                                  mainAxisSpacing: 10,
                                  childAspectRatio: .72,
                                ),
                            itemCount: backgrounds.length,
                            itemBuilder: (context, index) {
                              final background = backgrounds[index];
                              return _ServerBackgroundTile(
                                background: background,
                                selected:
                                    widget.currentUrl == background.imageUrl,
                                onTap: () => Navigator.pop(context, background),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ServerBackgroundTile extends StatelessWidget {
  const _ServerBackgroundTile({
    required this.background,
    required this.selected,
    required this.onTap,
  });

  final ServerBackground background;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: 'Choisir ce fond ${background.category}',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainer,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: selected
                  ? HikmaColors.emeraldBright
                  : Theme.of(context).colorScheme.outlineVariant,
              width: selected ? 3 : 1,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(selected ? 14 : 17),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  background.imageUrl,
                  fit: BoxFit.cover,
                  filterQuality: FilterQuality.medium,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const ColoredBox(
                      color: Color(0xFFE8EEE9),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (_, _, _) => const ColoredBox(
                    color: Color(0xFFE8EEE9),
                    child: Center(
                      child: Icon(
                        Icons.cloud_off_rounded,
                        color: HikmaColors.emerald,
                      ),
                    ),
                  ),
                ),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Color(0x8F07150F)],
                      stops: [.58, 1],
                    ),
                  ),
                ),
                Positioned(
                  left: 10,
                  right: 10,
                  bottom: 9,
                  child: Text(
                    background.category,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                if (selected)
                  const Positioned(
                    top: 9,
                    right: 9,
                    child: CircleAvatar(
                      radius: 14,
                      backgroundColor: HikmaColors.emeraldBright,
                      child: Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ServerGalleryError extends StatelessWidget {
  const _ServerGalleryError();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              size: 42,
              color: HikmaColors.emerald,
            ),
            const SizedBox(height: 12),
            Text(
              'La galerie du serveur est indisponible.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 6),
            Text(
              'Vérifiez votre connexion ou utilisez la galerie du téléphone.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
