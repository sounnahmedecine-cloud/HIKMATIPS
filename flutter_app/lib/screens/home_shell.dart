import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
import '../theme/hikma_theme.dart';
import '../widgets/category_sheet.dart';
import '../widgets/premium_dock.dart';
import 'clip_screen.dart';
import 'library_screen.dart';
import 'search_screen.dart';
import 'settings_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;
  int _refreshToken = 0;
  int _requestId = 0;
  ClipRequest _clipRequest = const ClipRequest(id: 0);

  @override
  Widget build(BuildContext context) {
    final pages = [
      ClipScreen(
        onOpenSearch: () => _selectTab(1),
        onOpenSettings: () => _selectTab(3),
        onCreate: _showCategorySheet,
        request: _clipRequest,
        refreshToken: _refreshToken,
      ),
      SearchScreen(onOpenClip: _openClip),
      LibraryScreen(
        onOpenClip: _openClip,
        onOpenSearch: () => _selectTab(1),
        onOpenCollection: _openCollection,
        refreshToken: _refreshToken,
      ),
      const SettingsScreen(),
    ];

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Positioned.fill(
            child: IndexedStack(index: _index, children: pages),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: PremiumDock(
              index: _index,
              onChanged: _selectTab,
              onGenerate: _showCategorySheet,
            ),
          ),
        ],
      ),
    );
  }

  void _selectTab(int value) {
    setState(() {
      _index = value;
      _refreshToken += 1;
    });
  }

  void _openClip(HikmaClip clip) {
    _requestFeed(
      clipId: clip.id,
      label: clip.kind == 'hadith' ? 'Hadith sélectionné' : clip.tag,
    );
  }

  void _openCollection(String kind) {
    final label = switch (kind) {
      'hadith' => 'Hadiths',
      'coran' => 'Versets du Coran',
      'ramadan' => 'Ramadan',
      'invocation' => 'Invocations',
      _ => 'Tous les rappels',
    };
    _requestFeed(kind: kind, label: label);
  }

  void _requestFeed({
    String? kind,
    String? tag,
    String? clipId,
    required String label,
  }) {
    setState(() {
      _requestId += 1;
      _clipRequest = ClipRequest(
        id: _requestId,
        kind: kind,
        tag: tag,
        clipId: clipId,
        label: label,
      );
      _index = 0;
      _refreshToken += 1;
    });
  }

  Future<void> _showCategorySheet() async {
    String? selected;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      barrierColor: HikmaColors.ink.withValues(alpha: .42),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) =>
          CategorySheet(onSelected: (category) => selected = category),
    );
    if (!mounted || selected == null) return;

    switch (selected!) {
      case 'Recherche':
        _selectTab(1);
      case 'Thématique':
        await _showThemeSheet();
      case 'Hadith':
        _requestFeed(kind: 'hadith', label: 'Hadiths');
      case 'Coran':
        _requestFeed(kind: 'coran', label: 'Versets du Coran');
      case 'Ramadan':
        _requestFeed(kind: 'ramadan', label: 'Ramadan');
      case 'Citadelle':
        _requestFeed(kind: 'invocation', label: 'Invocations');
    }
  }

  Future<void> _showThemeSheet() async {
    final tag = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => const ThemeSheet(),
    );
    if (!mounted || tag == null) return;
    _requestFeed(tag: tag, label: tag);
  }
}
