import 'dart:ui' as ui;

import 'package:cross_file/cross_file.dart' as cross_file;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart' hide XFile;
import 'package:share_plus/share_plus.dart';

import '../models/hikma_clip.dart';
import '../models/hikma_feed.dart';
import '../models/server_background.dart';
import '../services/favorites_service.dart';
import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';
import '../widgets/glass_surface.dart';
import '../widgets/server_background_sheet.dart';

enum _BackgroundAction { server, phone, automatic }

class ClipRequest {
  const ClipRequest({
    required this.id,
    this.kind,
    this.tag,
    this.clipId,
    this.label = 'Tous les rappels',
  });

  final int id;
  final String? kind;
  final String? tag;
  final String? clipId;
  final String label;
}

class ClipScreen extends StatefulWidget {
  const ClipScreen({
    required this.onOpenSearch,
    required this.onOpenSettings,
    required this.onCreate,
    required this.request,
    required this.refreshToken,
    super.key,
  });

  final VoidCallback onOpenSearch;
  final VoidCallback onOpenSettings;
  final VoidCallback onCreate;
  final ClipRequest request;
  final int refreshToken;

  @override
  State<ClipScreen> createState() => _ClipScreenState();
}

class _ClipScreenState extends State<ClipScreen> {
  List<HikmaClip> _allClips = fallbackHikmaClips;
  List<HikmaClip> _clips = fallbackHikmaClips;
  late HikmaFeed _feed;
  String _filterLabel = 'Tous les rappels';
  bool _favorite = false;
  bool _sharing = false;
  Uint8List? _customBackground;
  String? _serverBackgroundUrl;
  final ImagePicker _imagePicker = ImagePicker();
  final GlobalKey _shareBoundaryKey = GlobalKey(
    debugLabel: 'hikmaclips-share-card',
  );

  @override
  void initState() {
    super.initState();
    _feed = _newFeed(_clips.length);
    _filterLabel = widget.request.label;
    _syncFavorite();
    _loadCatalog();
  }

  @override
  void didUpdateWidget(covariant ClipScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.request.id != widget.request.id) {
      _applyRequest(widget.request);
    } else if (oldWidget.refreshToken != widget.refreshToken) {
      _syncFavorite();
    }
  }

  @override
  Widget build(BuildContext context) {
    final clip = _currentClip;
    final backgroundAsset = hikmaBackgrounds[_feed.current.backgroundIndex];
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onVerticalDragEnd: (details) {
        if (details.primaryVelocity == null ||
            details.primaryVelocity!.abs() < 180) {
          return;
        }
        _nextClip(details.primaryVelocity! < 0 ? 1 : -1);
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: IgnorePointer(
              child: ExcludeSemantics(
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 9 / 16,
                    child: RepaintBoundary(
                      key: _shareBoundaryKey,
                      child: _ShareCard(
                        key: const ValueKey('share-card-boundary'),
                        clip: clip,
                        backgroundAsset: backgroundAsset,
                        customBackground: _customBackground,
                        serverBackgroundUrl: _serverBackgroundUrl,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 650),
            switchInCurve: Curves.easeOutCubic,
            layoutBuilder: (currentChild, previousChildren) => Stack(
              fit: StackFit.expand,
              children: [...previousChildren, ?currentChild],
            ),
            child: KeyedSubtree(
              key: ValueKey<Object>(
                _serverBackgroundUrl ??
                    _customBackground ??
                    '${clip.id}:$backgroundAsset',
              ),
              child: _serverBackgroundUrl != null
                  ? Image.network(
                      _serverBackgroundUrl!,
                      fit: BoxFit.cover,
                      alignment: Alignment.center,
                      filterQuality: FilterQuality.high,
                      loadingBuilder: (context, child, progress) =>
                          progress == null
                          ? child
                          : Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.asset(
                                  backgroundAsset,
                                  fit: BoxFit.cover,
                                  alignment: Alignment.center,
                                ),
                                const Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                      errorBuilder: (_, _, _) => Image.asset(
                        backgroundAsset,
                        fit: BoxFit.cover,
                        alignment: Alignment.center,
                      ),
                    )
                  : _customBackground == null
                  ? Image.asset(
                      backgroundAsset,
                      fit: BoxFit.cover,
                      alignment: Alignment.center,
                    )
                  : Image.memory(
                      _customBackground!,
                      fit: BoxFit.cover,
                      alignment: Alignment.center,
                      gaplessPlayback: true,
                    ),
            ),
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0, .22, .56, 1],
                colors: [
                  Color(0x7A07150F),
                  Color(0x1507150F),
                  Color(0x2607150F),
                  Color(0xB807150F),
                ],
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 112),
              child: Column(
                children: [
                  _TopBar(
                    onSettings: widget.onOpenSettings,
                    onCreate: widget.onCreate,
                    catalogCount: _allClips.length,
                  ),
                  const SizedBox(height: 14),
                  InkWell(
                    onTap: widget.onOpenSearch,
                    borderRadius: BorderRadius.circular(22),
                    child: GlassSurface(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 17,
                        vertical: 14,
                      ),
                      borderRadius: 22,
                      opacity: .17,
                      child: Row(
                        children: [
                          const Icon(Icons.search_rounded, color: Colors.white),
                          const SizedBox(width: 11),
                          Expanded(
                            child: Text(
                              'Filtre : $_filterLabel',
                              style: TextStyle(
                                color: Color(0xDFFFFFFF),
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.tune_rounded,
                            color: Color(0xBFFFFFFF),
                            size: 19,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: SingleChildScrollView(
                        reverse: true,
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 400),
                                child: Column(
                                  key: ValueKey(clip.id),
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 11,
                                        vertical: 7,
                                      ),
                                      decoration: BoxDecoration(
                                        color: HikmaColors.gold.withValues(
                                          alpha: .94,
                                        ),
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                      child: Text(
                                        clip.tag,
                                        style: const TextStyle(
                                          color: HikmaColors.ink,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 1.1,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 17),
                                    if (clip.arabic.isNotEmpty) ...[
                                      Text(
                                        clip.arabic,
                                        textDirection: TextDirection.rtl,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 19,
                                          height: 1.55,
                                          fontWeight: FontWeight.w500,
                                          shadows: [
                                            Shadow(
                                              color: Color(0x99000000),
                                              blurRadius: 16,
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 9),
                                    ],
                                    Text(
                                      '“${clip.quote}”',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: _quoteFontSize(clip.quote),
                                        height: 1.12,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -.45,
                                        shadows: const [
                                          Shadow(
                                            color: Color(0xB0000000),
                                            blurRadius: 18,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Container(
                                          width: 27,
                                          height: 2,
                                          color: HikmaColors.gold,
                                        ),
                                        const SizedBox(width: 9),
                                        Flexible(
                                          child: Text(
                                            clip.source,
                                            style: const TextStyle(
                                              color: Color(0xE6FFFFFF),
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 1.45,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _ActionButton(
                                  key: const ValueKey('background-action'),
                                  icon: Icons.photo_library_outlined,
                                  label: 'Choisir un fond',
                                  color:
                                      _customBackground == null &&
                                          _serverBackgroundUrl == null
                                      ? Colors.white
                                      : HikmaColors.gold,
                                  indicatorColor:
                                      _customBackground == null &&
                                          _serverBackgroundUrl == null
                                      ? HikmaColors.gold
                                      : HikmaColors.emeraldBright,
                                  onTap: _pickBackground,
                                ),
                                const SizedBox(height: 10),
                                _ActionButton(
                                  key: const ValueKey('favorite-action'),
                                  icon: _favorite
                                      ? Icons.favorite_rounded
                                      : Icons.favorite_border_rounded,
                                  label: 'Favori',
                                  color: _favorite
                                      ? HikmaColors.rose
                                      : Colors.white,
                                  onTap: _toggleFavorite,
                                ),
                                const SizedBox(height: 10),
                                _ActionButton(
                                  icon: _sharing
                                      ? Icons.hourglass_top_rounded
                                      : Icons.ios_share_rounded,
                                  label: _sharing
                                      ? 'Préparation du partage'
                                      : 'Partager l’image',
                                  filled: true,
                                  onTap: _sharing ? () {} : _shareReminder,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.keyboard_arrow_up_rounded,
                        color: Colors.white,
                        size: 17,
                      ),
                      SizedBox(width: 3),
                      Text(
                        'GLISSEZ POUR UN NOUVEAU CLIP',
                        style: TextStyle(
                          color: Color(0xDFFFFFFF),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _nextClip(int delta) {
    HapticsService.selection();
    setState(() {
      if (delta > 0) {
        _feed.next();
      } else {
        _feed.previous();
      }
      _favorite = false;
    });
    _syncFavorite();
  }

  Future<void> _loadCatalog() async {
    final clips = await loadHikmaClips();
    if (!mounted) return;
    _allClips = clips;
    _applyRequest(widget.request);
  }

  void _applyRequest(ClipRequest request) {
    var filtered = _allClips;
    if (request.kind != null) {
      filtered = filtered.where((clip) => clip.kind == request.kind).toList();
    }
    if (request.tag != null) {
      filtered = filtered.where((clip) => clip.tag == request.tag).toList();
    }
    if (filtered.isEmpty) filtered = _allClips;

    final initialIndex = request.clipId == null
        ? null
        : filtered.indexWhere((clip) => clip.id == request.clipId);
    setState(() {
      _clips = filtered;
      _filterLabel = request.label;
      _feed = _newFeed(
        filtered.length,
        initialClipIndex: initialIndex != null && initialIndex >= 0
            ? initialIndex
            : null,
      );
      _favorite = false;
    });
    _syncFavorite();
  }

  HikmaFeed _newFeed(int clipCount, {int? initialClipIndex}) {
    return HikmaFeed(
      clipCount: clipCount,
      backgroundCount: hikmaBackgrounds.length,
      initialClipIndex: initialClipIndex,
    );
  }

  HikmaClip get _currentClip => _clips[_feed.current.clipIndex];

  double _quoteFontSize(String quote) {
    if (quote.length > 230) return 17;
    if (quote.length > 160) return 19;
    if (quote.length > 100) return 21;
    return 24;
  }

  Future<void> _pickBackground() async {
    HapticsService.selection();
    final action = await showModalBottomSheet<_BackgroundAction>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.cloud_outlined),
                title: const Text('Images HikmaClips du serveur'),
                subtitle: const Text('50 fonds HD hébergés sur Cloudinary'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.pop(context, _BackgroundAction.server),
              ),
              ListTile(
                leading: const Icon(Icons.phone_android_rounded),
                title: const Text('Galerie du téléphone'),
                subtitle: const Text('Choisir une image personnelle'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.pop(context, _BackgroundAction.phone),
              ),
              if (_customBackground != null || _serverBackgroundUrl != null)
                ListTile(
                  leading: const Icon(Icons.auto_awesome_rounded),
                  title: const Text('Fonds automatiques HikmaClips'),
                  subtitle: const Text('Reprendre le défilement des fonds'),
                  onTap: () =>
                      Navigator.pop(context, _BackgroundAction.automatic),
                ),
            ],
          ),
        ),
      ),
    );
    if (!mounted || action == null) return;

    switch (action) {
      case _BackgroundAction.server:
        await _pickServerBackground();
      case _BackgroundAction.phone:
        await _pickPhoneBackground();
      case _BackgroundAction.automatic:
        setState(() {
          _customBackground = null;
          _serverBackgroundUrl = null;
        });
        _showMessage('Les fonds automatiques HikmaClips sont rétablis.');
    }
  }

  Future<void> _pickServerBackground() async {
    final background = await showModalBottomSheet<ServerBackground>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) =>
          ServerBackgroundSheet(currentUrl: _serverBackgroundUrl),
    );
    if (!mounted || background == null) return;
    setState(() {
      _customBackground = null;
      _serverBackgroundUrl = background.imageUrl;
    });
    _showMessage('Le fond du serveur est appliqué au clip.');
  }

  Future<void> _pickPhoneBackground() async {
    try {
      final image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 2160,
        maxHeight: 3840,
        imageQuality: 92,
        requestFullMetadata: false,
      );
      if (image == null) return;

      final bytes = await image.readAsBytes();
      if (!mounted) return;
      setState(() {
        _serverBackgroundUrl = null;
        _customBackground = bytes;
      });
      _showMessage('Votre image est maintenant le fond du clip.');
    } on Object {
      if (mounted) {
        _showMessage('Impossible d’ouvrir cette image.');
      }
    }
  }

  Future<void> _toggleFavorite() async {
    HapticsService.light();
    final clip = _currentClip;
    try {
      final favorite = await FavoritesService.instance.toggle(clip.id);
      if (!mounted || clip.id != _currentClip.id) return;
      setState(() => _favorite = favorite);
      _showMessage(
        favorite
            ? 'Rappel ajouté à vos favoris.'
            : 'Rappel retiré des favoris.',
      );
    } on Object {
      if (mounted) _showMessage('Le favori n’a pas pu être enregistré.');
    }
  }

  Future<void> _syncFavorite() async {
    final clipId = _currentClip.id;
    final favorites = await FavoritesService.instance.loadFavorites();
    if (!mounted || clipId != _currentClip.id) return;
    setState(() => _favorite = favorites.contains(clipId));
  }

  Future<void> _shareReminder() async {
    if (_sharing) return;
    HapticsService.medium();
    final clip = _currentClip;
    final renderBox = context.findRenderObject() as RenderBox?;
    final shareOrigin = renderBox == null
        ? null
        : renderBox.localToGlobal(Offset.zero) & renderBox.size;
    setState(() => _sharing = true);

    try {
      await WidgetsBinding.instance.endOfFrame;
      final boundary =
          _shareBoundaryKey.currentContext?.findRenderObject()
              as RenderRepaintBoundary?;
      if (boundary == null) {
        throw StateError('Le visuel de partage est indisponible.');
      }

      final image = await boundary.toImage(pixelRatio: 3);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      image.dispose();
      if (byteData == null) {
        throw StateError('Le visuel de partage n’a pas pu être exporté.');
      }

      final bytes = byteData.buffer.asUint8List();
      await SharePlus.instance.share(
        ShareParams(
          title: 'Partager le clip HikmaClips',
          subject: 'Un rappel à partager',
          text:
              '« ${clip.quote} »\n'
              '${clip.source}\n\n'
              'Partagé avec HikmaClips',
          files: [
            cross_file.XFile.fromData(
              bytes,
              mimeType: 'image/png',
              name: 'hikmaclips-${clip.id}.png',
            ),
          ],
          fileNameOverrides: ['hikmaclips-${clip.id}.png'],
          sharePositionOrigin: shareOrigin,
        ),
      );
    } on Object {
      if (mounted) {
        _showMessage(
          'Impossible de créer l’image. Réessayez dans quelques secondes.',
        );
      }
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  void _showMessage(String message) {
    HapticsService.selection();
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: HikmaColors.emeraldDeep,
          margin: const EdgeInsets.fromLTRB(18, 0, 18, 98),
        ),
      );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.onSettings,
    required this.onCreate,
    required this.catalogCount,
  });

  final VoidCallback onSettings;
  final VoidCallback onCreate;
  final int catalogCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _TopPill(
          icon: Icons.tune_rounded,
          label: 'RÉGLAGES',
          onTap: onSettings,
        ),
        const Spacer(),
        InkWell(
          onTap: onCreate,
          customBorder: const CircleBorder(),
          child: const GlassSurface(
            borderRadius: 99,
            padding: EdgeInsets.all(12),
            opacity: .14,
            child: Icon(
              Icons.auto_awesome_rounded,
              size: 20,
              color: HikmaColors.gold,
            ),
          ),
        ),
        const Spacer(),
        _TopPill(
          icon: Icons.offline_bolt_outlined,
          label: 'HORS LIGNE',
          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$catalogCount rappels disponibles hors ligne.'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: HikmaColors.emeraldDeep,
            ),
          ),
        ),
      ],
    );
  }
}

class _TopPill extends StatelessWidget {
  const _TopPill({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(99),
      child: GlassSurface(
        borderRadius: 99,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        opacity: .14,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: Colors.white),
            const SizedBox(width: 7),
            Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontSize: 9.5,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color = Colors.white,
    this.filled = false,
    this.indicatorColor,
    super.key,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color color;
  final bool filled;
  final Color? indicatorColor;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: Tooltip(
        message: label,
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: filled ? Colors.white : const Color(0x3DFFFFFF),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0x66FFFFFF)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x24000000),
                      blurRadius: 14,
                      offset: Offset(0, 7),
                    ),
                  ],
                ),
                child: Icon(
                  icon,
                  size: 23,
                  color: filled ? HikmaColors.emerald : color,
                ),
              ),
              if (indicatorColor case final indicatorColor?)
                Positioned(
                  top: 1,
                  right: 1,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: indicatorColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
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

class _ShareCard extends StatelessWidget {
  const _ShareCard({
    required this.clip,
    required this.backgroundAsset,
    required this.customBackground,
    required this.serverBackgroundUrl,
    super.key,
  });

  final HikmaClip clip;
  final String backgroundAsset;
  final Uint8List? customBackground;
  final String? serverBackgroundUrl;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        _buildBackground(),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              stops: [0, .38, .68, 1],
              colors: [
                Color(0x7207150F),
                Color(0x1007150F),
                Color(0x5207150F),
                Color(0xD907150F),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(26, 28, 26, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .17),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: .24),
                      ),
                    ),
                    child: const Icon(
                      Icons.auto_awesome_rounded,
                      color: HikmaColors.gold,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'HIKMACLIPS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.1,
                      shadows: [
                        Shadow(color: Color(0x99000000), blurRadius: 12),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 30),
                  child: FractionallySizedBox(
                    alignment: Alignment.topLeft,
                    heightFactor: .70,
                    child: Align(
                      alignment: Alignment.topLeft,
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.topLeft,
                        child: SizedBox(
                          key: const ValueKey('share-safe-content'),
                          width: 230,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 11,
                                  vertical: 7,
                                ),
                                decoration: BoxDecoration(
                                  color: HikmaColors.gold,
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Text(
                                  clip.tag,
                                  style: const TextStyle(
                                    color: HikmaColors.ink,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 15),
                              if (clip.arabic.isNotEmpty) ...[
                                Text(
                                  clip.arabic,
                                  textDirection: TextDirection.rtl,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    height: 1.55,
                                    fontWeight: FontWeight.w500,
                                    shadows: [
                                      Shadow(
                                        color: Color(0xB0000000),
                                        blurRadius: 14,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 9),
                              ],
                              Text(
                                '“${clip.quote}”',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: _shareQuoteFontSize(clip.quote),
                                  height: 1.12,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -.35,
                                  shadows: const [
                                    Shadow(
                                      color: Color(0xC0000000),
                                      blurRadius: 16,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 15),
                              Row(
                                children: [
                                  Container(
                                    width: 27,
                                    height: 2,
                                    color: HikmaColors.gold,
                                  ),
                                  const SizedBox(width: 9),
                                  Expanded(
                                    child: Text(
                                      clip.source,
                                      style: const TextStyle(
                                        color: Color(0xE6FFFFFF),
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.25,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBackground() {
    if (serverBackgroundUrl != null) {
      return Image.network(
        serverBackgroundUrl!,
        fit: BoxFit.cover,
        alignment: Alignment.center,
        filterQuality: FilterQuality.high,
        errorBuilder: (_, _, _) => Image.asset(
          backgroundAsset,
          fit: BoxFit.cover,
          alignment: Alignment.center,
        ),
      );
    }
    if (customBackground != null) {
      return Image.memory(
        customBackground!,
        fit: BoxFit.cover,
        alignment: Alignment.center,
        gaplessPlayback: true,
      );
    }
    return Image.asset(
      backgroundAsset,
      fit: BoxFit.cover,
      alignment: Alignment.center,
    );
  }

  double _shareQuoteFontSize(String quote) {
    if (quote.length > 230) return 16;
    if (quote.length > 160) return 18;
    if (quote.length > 100) return 20;
    return 23;
  }
}
