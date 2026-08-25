import 'dart:math' show Random;
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
import '../models/solid_background.dart';
import '../services/app_preferences_service.dart';
import '../services/favorites_service.dart';
import '../services/haptics_service.dart';
import '../services/premium_gate.dart';
import '../theme/hikma_theme.dart';
import '../widgets/swipe_hint_overlay.dart';
import '../widgets/glass_surface.dart';
import '../widgets/heart_burst.dart';
import '../widgets/server_background_sheet.dart';
import 'premium_screen.dart';
import 'sleep_screen.dart';

enum _BackgroundAction { solid, server, random, phone, automatic }

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
    required this.onOpenLibrary,
    required this.onOpenSettings,
    required this.request,
    required this.refreshToken,
    super.key,
  });

  final VoidCallback onOpenSearch;
  final VoidCallback onOpenLibrary;
  final VoidCallback onOpenSettings;
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
  SolidBackground? _solidBackground;
  final Random _random = Random();
  final ImagePicker _imagePicker = ImagePicker();
  final GlobalKey _shareBoundaryKey = GlobalKey(
    debugLabel: 'hikmaclips-share-card',
  );

  // Cibles du guidage du premier démarrage.
  final GlobalKey _swipeHintKey = GlobalKey(debugLabel: 'coach-swipe');
  final GlobalKey _backgroundKey = GlobalKey(debugLabel: 'coach-background');
  final GlobalKey _favoriteKey = GlobalKey(debugLabel: 'coach-favorite');
  bool _showCoachMarks = false;
  int _heartBurst = 0;

  @override
  void initState() {
    super.initState();
    _feed = _newFeed(_clips.length);
    _filterLabel = widget.request.label;
    _syncFavorite();
    _loadCatalog();
    _maybeShowCoachMarks();
  }

  /// Le guidage attend la fin de la première frame : les cibles doivent
  /// être montées pour que leur position soit mesurable.
  void _maybeShowCoachMarks() {
    if (AppPreferencesController.instance.coachMarksSeen) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _showCoachMarks = true);
    });
  }

  Future<void> _finishCoachMarks() async {
    setState(() => _showCoachMarks = false);
    // Persiste avant de notifier : notifyListeners reconstruit l'app et
    // recrée cet écran, qui relirait sinon un drapeau encore à faux.
    await AppPreferencesController.instance.markCoachMarksSeen();
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
                        solidBackground: _solidBackground,
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
                _solidBackground?.id ??
                    _serverBackgroundUrl ??
                    _customBackground ??
                    '${clip.id}:$backgroundAsset',
              ),
              child: _solidBackground != null
                  ? DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: _solidBackground!.gradient,
                      ),
                    )
                  : _serverBackgroundUrl != null
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
          // Double tap sur le fond du clip : ajoute aux favoris. Placé
          // sous les boutons pour ne pas retarder leurs taps simples.
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onDoubleTap: _favoriteFromDoubleTap,
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
                    onLibrary: widget.onOpenLibrary,
                    onPickBackground: _pickBackground,
                    backgroundKey: _backgroundKey,
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
                      alignment: Alignment.center,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
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
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Actions centrees sous la citation : partage et favori
                  // seulement, le reste vit dans l'en-tete.
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _RoundAction(
                        icon: _sharing
                            ? Icons.hourglass_top_rounded
                            : Icons.ios_share_rounded,
                        tooltip: _sharing
                            ? 'Préparation du partage'
                            : 'Partager l’image',
                        onTap: _sharing ? () {} : _shareReminder,
                      ),
                      const SizedBox(width: 18),
                      KeyedSubtree(
                        key: _favoriteKey,
                        child: _RoundAction(
                          key: const ValueKey('favorite-action'),
                          icon: _favorite
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          tooltip: 'Favori',
                          color: _favorite ? HikmaColors.rose : null,
                          onTap: _toggleFavorite,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    key: _swipeHintKey,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
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
          if (_heartBurst > 0)
            Positioned.fill(
              child: HeartBurst(
                key: ValueKey(_heartBurst),
                onCompleted: () {
                  if (mounted) setState(() => _heartBurst = 0);
                },
              ),
            ),
          // Premium discret en bas a droite, au-dessus du dock flottant.
          Positioned(
            right: 16,
            bottom: 104,
            child: SafeArea(
              child: Material(
                color: Colors.white.withValues(alpha: .94),
                borderRadius: BorderRadius.circular(99),
                child: InkWell(
                  borderRadius: BorderRadius.circular(99),
                  onTap: () {
                    HapticsService.selection();
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PremiumScreen(
                          onClose: () => Navigator.pop(context),
                        ),
                      ),
                    );
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.workspace_premium_rounded,
                          size: 16,
                          color: HikmaColors.amber,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Premium',
                          style: TextStyle(
                            color: HikmaColors.ink,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (_showCoachMarks)
            Positioned.fill(
              child: SwipeHintOverlay(onDismiss: _finishCoachMarks),
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
    // Sans abonnement, Ramadan et Invocations sortent du flux.
    _allClips = PremiumGate.filter(clips);
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
        child: SingleChildScrollView(
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
                leading: const Icon(Icons.shuffle_rounded),
                title: const Text('Fond aléatoire'),
                subtitle: const Text('Une image HD tirée au hasard'),
                onTap: () => Navigator.pop(context, _BackgroundAction.random),
              ),
              ListTile(
                leading: const Icon(Icons.gradient_rounded),
                title: const Text('Couleurs unies'),
                subtitle: const Text('8 fonds sobres, toujours gratuits'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.pop(context, _BackgroundAction.solid),
              ),
              ListTile(
                leading: const Icon(Icons.phone_android_rounded),
                title: const Text('Galerie du téléphone'),
                subtitle: const Text('Choisir une image personnelle'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.pop(context, _BackgroundAction.phone),
              ),
              if (_customBackground != null ||
                  _serverBackgroundUrl != null ||
                  _solidBackground != null)
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
      case _BackgroundAction.solid:
        await _pickSolidBackground();
      case _BackgroundAction.server:
        await _pickServerBackground();
      case _BackgroundAction.random:
        await _pickRandomServerBackground();
      case _BackgroundAction.phone:
        await _pickPhoneBackground();
      case _BackgroundAction.automatic:
        setState(() {
          _customBackground = null;
          _serverBackgroundUrl = null;
          _solidBackground = null;
        });
        _showMessage('Les fonds automatiques HikmaClips sont rétablis.');
    }
  }

  /// Feuille des fonds unis : gratuits, dessines en code, donc toujours
  /// disponibles meme sans reseau ni abonnement.
  Future<void> _pickSolidBackground() async {
    final picked = await showModalBottomSheet<SolidBackground>(
      context: context,
      useSafeArea: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Couleurs unies',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 3),
              Text(
                'Sobres et lisibles, incluses dans la version gratuite',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 18),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: solidBackgrounds.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  childAspectRatio: .72,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  final background = solidBackgrounds[index];
                  final selected = background.id == _solidBackground?.id;
                  return InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () => Navigator.pop(context, background),
                    child: Column(
                      children: [
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              gradient: background.gradient,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: selected
                                    ? HikmaColors.emeraldBright
                                    : Colors.transparent,
                                width: 2.4,
                              ),
                            ),
                            child: selected
                                ? const Icon(
                                    Icons.check_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  )
                                : null,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          background.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
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

    if (!mounted || picked == null) return;
    setState(() {
      _customBackground = null;
      _serverBackgroundUrl = null;
      _solidBackground = picked;
    });
    _showMessage('Fond ${picked.label} appliqué.');
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

  /// Applique un fond du serveur tiré au hasard, sans ouvrir la galerie.
  /// Évite de retomber sur celui déjà affiché.
  Future<void> _pickRandomServerBackground() async {
    try {
      final backgrounds = await loadServerBackgrounds();
      if (!mounted || backgrounds.isEmpty) return;

      final candidates = backgrounds
          .where((background) => background.imageUrl != _serverBackgroundUrl)
          .toList();
      final pool = candidates.isEmpty ? backgrounds : candidates;
      final picked = pool[_random.nextInt(pool.length)];

      setState(() {
        _customBackground = null;
        _serverBackgroundUrl = picked.imageUrl;
      });
      _showMessage('Fond aléatoire appliqué : ${picked.category}.');
    } catch (_) {
      if (!mounted) return;
      _showMessage('La galerie du serveur est indisponible pour le moment.');
    }
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

  /// Double tap : ajoute aux favoris et lance le cœur. Un rappel deja
  /// favori le reste — on ne le retire pas par megarde.
  Future<void> _favoriteFromDoubleTap() async {
    final clip = _currentClip;
    setState(() => _heartBurst++);
    HapticsService.light();

    if (_favorite) return;
    try {
      await FavoritesService.instance.toggle(clip.id);
      if (!mounted || clip.id != _currentClip.id) return;
      setState(() => _favorite = true);
    } on Object {
      if (mounted) _showMessage('Le favori n’a pas pu être enregistré.');
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
    required this.onLibrary,
    required this.onPickBackground,
    required this.backgroundKey,
    required this.catalogCount,
  });

  final VoidCallback onSettings;
  final VoidCallback onLibrary;
  final VoidCallback onPickBackground;
  final Key backgroundKey;
  final int catalogCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _TopPill(icon: Icons.settings, label: 'RÉGLAGES', onTap: onSettings),
        const SizedBox(width: 8),
        _TopPill(
          icon: Icons.bookmark_border_rounded,
          label: 'BIBLIO',
          onTap: onLibrary,
        ),
        const Spacer(),
        KeyedSubtree(
          key: backgroundKey,
          child: _RoundAction(
            key: const ValueKey('background-action'),
            icon: Icons.palette_outlined,
            tooltip: 'Choisir un fond',
            onTap: onPickBackground,
          ),
        ),
        const SizedBox(width: 10),
        _TopPill(
          icon: Icons.bedtime_outlined,
          label: 'VEILLE',
          locked: PremiumGate.sleepModeLocked,
          onTap: () {
            HapticsService.selection();
            // Le mode veille est reserve : on presente l'offre plutot que
            // d'ouvrir un ecran vide.
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PremiumGate.sleepModeLocked
                    ? PremiumScreen(onClose: () => Navigator.pop(context))
                    : const SleepScreen(),
              ),
            );
          },
        ),
      ],
    );
  }
}

/// Bouton rond translucide, aligne sous la citation.
class _RoundAction extends StatelessWidget {
  const _RoundAction({
    required this.icon,
    required this.tooltip,
    required this.onTap,
    this.color,
    super.key,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Semantics(
        button: true,
        label: tooltip,
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: GlassSurface(
            borderRadius: 99,
            padding: const EdgeInsets.all(14),
            opacity: .16,
            child: Icon(icon, size: 22, color: color ?? Colors.white),
          ),
        ),
      ),
    );
  }
}

class _TopPill extends StatelessWidget {
  const _TopPill({
    required this.icon,
    required this.label,
    required this.onTap,
    this.locked = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool locked;

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
            if (locked) ...[
              const SizedBox(width: 5),
              const Icon(Icons.lock_rounded, size: 11, color: HikmaColors.gold),
            ],
          ],
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
    required this.solidBackground,
    super.key,
  });

  final HikmaClip clip;
  final String backgroundAsset;
  final Uint8List? customBackground;
  final String? serverBackgroundUrl;
  final SolidBackground? solidBackground;

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
    final solid = solidBackground;
    if (solid != null) {
      return DecoratedBox(decoration: BoxDecoration(gradient: solid.gradient));
    }
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
