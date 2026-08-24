import 'package:flutter/material.dart';

import '../models/hikma_clip.dart';
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
        // SettingsScreen renvoie un ColoredBox sans Scaffold : pousse-le
        // dans un Scaffold, sinon il hérite de contraintes non bornées.
        onOpenSettings: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const Scaffold(body: SettingsScreen()),
          ),
        ),
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
            child: PremiumDock(index: _index, onChanged: _selectTab),
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
}
