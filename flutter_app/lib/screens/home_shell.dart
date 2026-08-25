import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
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
  int _refreshToken = 0;
  int _requestId = 0;
  ClipRequest _clipRequest = const ClipRequest(id: 0);

  @override
  Widget build(BuildContext context) {
    final pages = [
      ClipScreen(
        onOpenSearch: _openSearch,
        onOpenLibrary: _openLibrary,
        // SettingsScreen renvoie un ColoredBox sans Scaffold : pousse-le
        // dans un Scaffold, sinon il herite de contraintes non bornees.
        onOpenSettings: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const Scaffold(body: SettingsScreen()),
          ),
        ),
        request: _clipRequest,
        refreshToken: _refreshToken,
      ),
    ];

    // Plus de barre de navigation : l'accueil est le seul ecran de base,
    // Recherche et Bibliotheque s'ouvrent depuis son en-tete.
    return Scaffold(resizeToAvoidBottomInset: false, body: pages.first);
  }

  Future<void> _openSearch() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          body: SearchScreen(
            onOpenClip: (clip) {
              Navigator.pop(context);
              _openClip(clip);
            },
          ),
        ),
      ),
    );
    if (mounted) setState(() => _refreshToken += 1);
  }

  Future<void> _openLibrary() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          body: LibraryScreen(
            onOpenClip: (clip) {
              Navigator.pop(context);
              _openClip(clip);
            },
            onOpenSearch: () {
              Navigator.pop(context);
              _openSearch();
            },
            onOpenCollection: (kind) {
              Navigator.pop(context);
              _openCollection(kind);
            },
            refreshToken: _refreshToken,
          ),
        ),
      ),
    );
    if (mounted) setState(() => _refreshToken += 1);
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
      _refreshToken += 1;
    });
  }
}
