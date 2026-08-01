import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
import '../services/haptics_service.dart';
import '../services/search_history_service.dart';
import '../theme/hikma_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({required this.onOpenClip, super.key});

  final ValueChanged<HikmaClip> onOpenClip;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  List<HikmaClip> _hadiths = const [];
  List<HikmaClip> _results = const [];
  List<String> _history = const [];
  String _query = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final suggestions = _hadiths.take(9).toList();
    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: CustomScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        slivers: [
          SliverToBoxAdapter(
            child: _Header(controller: _controller, onSearch: _search),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 124),
            sliver: SliverList.list(
              children: [
                if (suggestions.isNotEmpty) ...[
                  Text(
                    'SUGGESTIONS',
                    style: TextStyle(
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurfaceVariant.withValues(alpha: .8),
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.7,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 9,
                    children: suggestions
                        .map(
                          (clip) => ActionChip(
                            side: BorderSide.none,
                            backgroundColor: Theme.of(
                              context,
                            ).colorScheme.surfaceContainerHighest,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(99),
                            ),
                            label: Text(
                              _shorten(clip.quote),
                              style: TextStyle(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurfaceVariant,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            onPressed: () => _search(clip.quote),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 22),
                ],
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 320),
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : _query.isEmpty
                      ? _CatalogCard(count: _hadiths.length)
                      : _results.isEmpty
                      ? _NoResult(query: _query)
                      : _ResultsList(
                          key: ValueKey(_query),
                          results: _results,
                          onOpenClip: widget.onOpenClip,
                        ),
                ),
                if (_history.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _RecentSearches(
                    history: _history,
                    onSelected: _search,
                    onClear: _clearHistory,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _load() async {
    final results = await Future.wait<Object>([
      loadHikmaClips(),
      SearchHistoryService.instance.load(),
    ]);
    if (!mounted) return;
    final catalog = results[0] as List<HikmaClip>;
    setState(() {
      _hadiths = catalog.where((clip) => clip.kind == 'hadith').toList();
      _history = results[1] as List<String>;
      _loading = false;
    });
  }

  Future<void> _search(String value) async {
    final query = value.trim();
    if (query.isEmpty) {
      setState(() {
        _query = '';
        _results = const [];
      });
      return;
    }

    HapticsService.selection();
    _controller.text = query;
    _controller.selection = TextSelection.collapsed(offset: query.length);
    final normalizedQuery = _normalize(query);
    final tokens = normalizedQuery
        .split(RegExp(r'\s+'))
        .where((token) => token.length > 1)
        .toList();
    final scored = <({HikmaClip clip, int score})>[];

    for (final clip in _hadiths) {
      final haystack = _normalize('${clip.quote} ${clip.source} ${clip.tag}');
      var score = haystack.contains(normalizedQuery) ? 100 : 0;
      score += tokens.where(haystack.contains).length * 12;
      if (tokens.isNotEmpty && score >= tokens.length * 12) {
        scored.add((clip: clip, score: score));
      }
    }
    scored.sort((a, b) => b.score.compareTo(a.score));

    setState(() {
      _query = query;
      _results = scored.take(12).map((item) => item.clip).toList();
    });
    FocusManager.instance.primaryFocus?.unfocus();
    final history = await SearchHistoryService.instance.add(query);
    if (mounted) setState(() => _history = history);
  }

  Future<void> _clearHistory() async {
    await SearchHistoryService.instance.clear();
    if (mounted) setState(() => _history = const []);
  }

  static String _shorten(String value) =>
      value.length > 34 ? '${value.substring(0, 32)}…' : value;

  static String _normalize(String value) {
    const accents = 'àâäáãåçéèêëíìîïñóòôöõúùûüÿœ';
    const plain = 'aaaaaaceeeeiiiinooooouuuuyoe';
    var result = value.toLowerCase().replaceAll('’', "'");
    for (var index = 0; index < accents.length; index += 1) {
      result = result.replaceAll(accents[index], plain[index]);
    }
    return result.replaceAll(RegExp(r"[^a-z0-9']+"), ' ').trim();
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.controller, required this.onSearch});

  final TextEditingController controller;
  final ValueChanged<String> onSearch;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        MediaQuery.paddingOf(context).top + 18,
        20,
        24,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            HikmaColors.emeraldDeep,
            HikmaColors.emeraldBright,
            Color(0xFFC4CE59),
          ],
          stops: [0, .67, 1.15],
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(34)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: .13),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: .15),
                  ),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  color: Colors.white,
                  size: 21,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: .13),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.offline_bolt_outlined,
                      color: Colors.white,
                      size: 15,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'RECHERCHE LOCALE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        letterSpacing: .8,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'Recherche Hadith',
            style: TextStyle(
              color: Colors.white,
              fontSize: 31,
              height: 1,
              fontWeight: FontWeight.w800,
              letterSpacing: -.8,
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Retrouvez une parole dans la base locale référencée.',
            style: TextStyle(
              color: Color(0xDFFFFFFF),
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: controller,
            textInputAction: TextInputAction.search,
            onSubmitted: onSearch,
            decoration: InputDecoration(
              hintText: 'Tapez quelques mots du hadith…',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: IconButton(
                tooltip: 'Rechercher',
                onPressed: () => onSearch(controller.text),
                icon: const Icon(Icons.arrow_forward_rounded),
              ),
              fillColor: Colors.white.withValues(alpha: .96),
            ),
          ),
        ],
      ),
    );
  }
}

class _CatalogCard extends StatelessWidget {
  const _CatalogCard({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFE4F8EF),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFCCEDDC)),
      ),
      child: Row(
        children: [
          const _SoftIcon(icon: Icons.verified_user_outlined),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$count hadiths référencés hors ligne',
                  style: const TextStyle(
                    color: HikmaColors.emeraldDeep,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                const Text(
                  'La recherche compare réellement vos mots au texte, à la source et au thème.',
                  style: TextStyle(
                    color: Color(0xFF4B9670),
                    fontSize: 10.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultsList extends StatelessWidget {
  const _ResultsList({
    required this.results,
    required this.onOpenClip,
    super.key,
  });

  final List<HikmaClip> results;
  final ValueChanged<HikmaClip> onOpenClip;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${results.length} correspondance${results.length > 1 ? 's' : ''}',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        ...results.map(
          (clip) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _SearchResult(
              clip: clip,
              onOpenClip: () => onOpenClip(clip),
            ),
          ),
        ),
      ],
    );
  }
}

class _SearchResult extends StatelessWidget {
  const _SearchResult({required this.clip, required this.onOpenClip});

  final HikmaClip clip;
  final VoidCallback onOpenClip;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.check_circle_rounded,
                color: HikmaColors.emerald,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  clip.tag,
                  style: const TextStyle(
                    color: HikmaColors.emerald,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            '« ${clip.quote} »',
            style: TextStyle(
              fontSize: 17,
              height: 1.3,
              fontWeight: FontWeight.w700,
              color: colors.onSurface,
            ),
          ),
          const SizedBox(height: 13),
          Text(
            clip.source,
            style: TextStyle(
              color: colors.onSurfaceVariant,
              fontSize: 11.5,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 17),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: onOpenClip,
              icon: const Icon(Icons.auto_awesome_rounded, size: 18),
              label: const Text('Créer un clip avec ce hadith'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NoResult extends StatelessWidget {
  const _NoResult({required this.query});

  final String query;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.search_off_rounded,
            color: HikmaColors.secondary,
            size: 36,
          ),
          const SizedBox(height: 12),
          Text(
            'Aucun hadith local trouvé pour « $query ».',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 6),
          Text(
            'Essayez moins de mots ou une autre formulation.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _RecentSearches extends StatelessWidget {
  const _RecentSearches({
    required this.history,
    required this.onSelected,
    required this.onClear,
  });

  final List<String> history;
  final ValueChanged<String> onSelected;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.history_rounded, color: HikmaColors.secondary),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Recherches récentes',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              TextButton(onPressed: onClear, child: const Text('Effacer')),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: history
                .map(
                  (query) => ActionChip(
                    label: Text(_SearchScreenState._shorten(query)),
                    onPressed: () => onSelected(query),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _SoftIcon extends StatelessWidget {
  const _SoftIcon({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: const Color(0xFFCCF4E0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(icon, color: HikmaColors.emerald, size: 24),
    );
  }
}
