import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
import '../services/favorites_service.dart';
import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({
    required this.onOpenClip,
    required this.onOpenSearch,
    required this.onOpenCollection,
    required this.refreshToken,
    super.key,
  });

  final ValueChanged<HikmaClip> onOpenClip;
  final VoidCallback onOpenSearch;
  final ValueChanged<String> onOpenCollection;
  final int refreshToken;

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  int _segment = 0;
  Set<String> _favoriteIds = <String>{};
  List<HikmaClip> _clips = fallbackHikmaClips;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
    _loadCatalog();
  }

  @override
  void didUpdateWidget(covariant LibraryScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.refreshToken != widget.refreshToken) _loadFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final favoriteClips = _clips
        .where((clip) => _favoriteIds.contains(clip.id))
        .toList();
    final collections = _collections();

    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _LibraryHeader(
              segment: _segment,
              onSearch: widget.onOpenSearch,
              onSegmentChanged: (value) {
                HapticsService.selection();
                setState(() => _segment = value);
                if (value == 0) _loadFavorites();
              },
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 120),
            sliver: switch (_segment) {
              1 => SliverList.builder(
                itemCount: collections.length,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.only(bottom: 13),
                  child: _CollectionCard(
                    collection: collections[index],
                    onTap: () =>
                        widget.onOpenCollection(collections[index].kind),
                  ),
                ),
              ),
              _ when favoriteClips.isNotEmpty => SliverList.builder(
                itemCount: favoriteClips.length,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _FavoriteClipCard(
                    clip: favoriteClips[index],
                    onOpen: () => widget.onOpenClip(favoriteClips[index]),
                    onRemoved: () => _removeFavorite(favoriteClips[index].id),
                  ),
                ),
              ),
              _ => const SliverToBoxAdapter(child: _EmptyFavorites()),
            },
          ),
        ],
      ),
    );
  }

  List<_CollectionData> _collections() {
    const definitions =
        <
          ({
            String kind,
            String title,
            String subtitle,
            IconData icon,
            Color color,
          })
        >[
          (
            kind: 'hadith',
            title: 'Hadiths',
            subtitle: 'Paroles référencées',
            icon: Icons.auto_stories_rounded,
            color: HikmaColors.emerald,
          ),
          (
            kind: 'coran',
            title: 'Versets du Coran',
            subtitle: 'Rappels coraniques',
            icon: Icons.book_rounded,
            color: Color(0xFF3B75A6),
          ),
          (
            kind: 'ramadan',
            title: 'Ramadan',
            subtitle: 'Jeûne, nuits et comportement',
            icon: CupertinoIcons.moon_stars_fill,
            color: HikmaColors.amber,
          ),
          (
            kind: 'invocation',
            title: 'Invocations',
            subtitle: 'Citadelle et Rabbana',
            icon: Icons.auto_awesome_rounded,
            color: Color(0xFF8B6CB1),
          ),
        ];

    return definitions
        .map(
          (definition) => _CollectionData(
            kind: definition.kind,
            title: definition.title,
            subtitle: definition.subtitle,
            icon: definition.icon,
            color: definition.color,
            count: _clips.where((clip) => clip.kind == definition.kind).length,
          ),
        )
        .toList();
  }

  Future<void> _loadFavorites() async {
    final favorites = await FavoritesService.instance.loadFavorites();
    if (!mounted) return;
    setState(() => _favoriteIds = favorites);
  }

  Future<void> _loadCatalog() async {
    final clips = await loadHikmaClips();
    if (!mounted) return;
    setState(() => _clips = clips);
  }

  Future<void> _removeFavorite(String clipId) async {
    await FavoritesService.instance.toggle(clipId);
    if (!mounted) return;
    setState(() => _favoriteIds.remove(clipId));
  }
}

class _LibraryHeader extends StatelessWidget {
  const _LibraryHeader({
    required this.segment,
    required this.onSearch,
    required this.onSegmentChanged,
  });

  final int segment;
  final VoidCallback onSearch;
  final ValueChanged<int> onSegmentChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        MediaQuery.paddingOf(context).top + 20,
        20,
        22,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            HikmaColors.emeraldDeep,
            HikmaColors.emeraldBright,
            Color(0xFFC7D252),
          ],
          stops: [0, .68, 1.12],
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Bibliothèque',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 31,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -.8,
                  ),
                ),
              ),
              IconButton(
                tooltip: 'Rechercher un hadith',
                onPressed: onSearch,
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: .13),
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.search_rounded),
              ),
            ],
          ),
          const SizedBox(height: 18),
          CupertinoSlidingSegmentedControl<int>(
            groupValue: segment,
            thumbColor: Colors.white,
            backgroundColor: const Color(0x2B072C1B),
            padding: const EdgeInsets.all(4),
            children: {
              0: _SegmentLabel(
                icon: CupertinoIcons.heart,
                label: 'Favoris',
                selected: segment == 0,
              ),
              1: _SegmentLabel(
                icon: CupertinoIcons.folder,
                label: 'Collections',
                selected: segment == 1,
              ),
            },
            onValueChanged: (value) {
              if (value != null) onSegmentChanged(value);
            },
          ),
        ],
      ),
    );
  }
}

class _FavoriteClipCard extends StatelessWidget {
  const _FavoriteClipCard({
    required this.clip,
    required this.onOpen,
    required this.onRemoved,
  });

  final HikmaClip clip;
  final VoidCallback onOpen;
  final VoidCallback onRemoved;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(24),
        child: Ink(
          height: 150,
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(clip.imageAsset),
              fit: BoxFit.cover,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              const DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0x25000000), Color(0xD20A1710)],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(17),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            clip.tag,
                            style: const TextStyle(
                              color: HikmaColors.gold,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 7),
                          Text(
                            '“${clip.quote}”',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              height: 1.15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 7),
                          Text(
                            clip.source,
                            style: const TextStyle(
                              color: Color(0xCFFFFFFF),
                              fontSize: 8.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton.filled(
                      tooltip: 'Retirer des favoris',
                      onPressed: onRemoved,
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: HikmaColors.rose,
                      ),
                      icon: const Icon(Icons.favorite_rounded),
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

class _CollectionData {
  const _CollectionData({
    required this.kind,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.count,
  });

  final String kind;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final int count;
}

class _CollectionCard extends StatelessWidget {
  const _CollectionCard({required this.collection, required this.onTap});

  final _CollectionData collection;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(17),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: collection.color.withValues(alpha: .12),
                  borderRadius: BorderRadius.circular(17),
                ),
                child: Icon(collection.icon, color: collection.color),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      collection.title,
                      style: TextStyle(
                        color: colors.onSurface,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${collection.count} rappels · ${collection.subtitle}',
                      style: TextStyle(
                        color: colors.onSurfaceVariant,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded),
            ],
          ),
        ),
      ),
    );
  }
}

class _SegmentLabel extends StatelessWidget {
  const _SegmentLabel({
    required this.icon,
    required this.label,
    required this.selected,
  });

  final IconData icon;
  final String label;

  /// Le segment actif a un pouce blanc : son contenu passe en émeraude.
  /// Les autres sont sur le dégradé sombre et doivent rester blancs.
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final color = selected ? HikmaColors.emeraldDeep : Colors.white;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 9),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyFavorites extends StatelessWidget {
  const _EmptyFavorites();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 48),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(26),
      ),
      child: Column(
        children: [
          Container(
            width: 62,
            height: 62,
            decoration: BoxDecoration(
              color: HikmaColors.emerald.withValues(alpha: .12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.favorite_border_rounded,
              color: HikmaColors.emerald,
              size: 29,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Vos rappels favoris',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 7),
          Text(
            'Touchez le cœur d’un clip pour le conserver ici.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
