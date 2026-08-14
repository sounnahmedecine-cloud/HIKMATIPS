import 'package:flutter/material.dart';

import '../services/haptics_service.dart';
import '../theme/hikma_theme.dart';

/// Slides affichées au tout premier lancement. Les textes reprennent ceux
/// de la version web pour que les deux produits racontent la même chose.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({required this.onComplete, super.key});

  final VoidCallback onComplete;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  /// Chaque slide reprend un fond réel de l'application, dans l'ordre des
  /// moments de la journée : l'utilisateur voit tout de suite ce qu'il
  /// obtiendra dans ses clips.
  static const _slides =
      <({String title, String subtitle, IconData icon, String image})>[
        (
          title: 'Diffuse la sagesse, en un clip.',
          subtitle:
              'Hadiths, versets et invocations transformés en visuels prêts à '
              'publier.',
          icon: Icons.auto_awesome_rounded,
          image: 'assets/images/hero-aube.png',
        ),
        (
          title: 'Une source de rappels sans fin.',
          subtitle:
              'Glissez vers le haut pour découvrir une nouvelle Hikma, pensée '
              'pour le partage.',
          icon: Icons.swipe_up_rounded,
          image: 'assets/images/hero-matin.png',
        ),
        (
          title: 'Gardez les mots qui vous touchent.',
          subtitle:
              'Ajoutez vos rappels aux favoris et organisez-les dans vos '
              'collections.',
          icon: Icons.favorite_rounded,
          image: 'assets/images/hero-maghrib.png',
        ),
        (
          title: 'Installez une routine spirituelle.',
          subtitle:
              'Recevez chaque jour une dose de sagesse au moment qui vous '
              'convient.',
          icon: Icons.notifications_active_rounded,
          image: 'assets/images/hero-soir.png',
        ),
      ];

  final PageController _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool get _isLast => _index == _slides.length - 1;

  void _next() {
    HapticsService.selection();
    if (_isLast) {
      widget.onComplete();
      return;
    }
    _controller.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Le fond suit la slide active, avec un fondu entre les images.
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 420),
            child: Image.asset(
              _slides[_index].image,
              key: ValueKey(_slides[_index].image),
              fit: BoxFit.cover,
              gaplessPlayback: true,
            ),
          ),
          // Voile émeraude : sans lui le texte blanc devient illisible sur
          // les zones claires des photos.
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xD90B4C32),
                  Color(0xB3062517),
                  Color(0xF2041A10),
                ],
                stops: [0, .52, 1],
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: _isLast ? 0 : 1,
                    child: TextButton(
                      onPressed: _isLast ? null : widget.onComplete,
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.white.withValues(alpha: .85),
                      ),
                      child: const Text(
                        'Passer',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: _controller,
                    itemCount: _slides.length,
                    onPageChanged: (value) {
                      HapticsService.selection();
                      setState(() => _index = value);
                    },
                    itemBuilder: (context, index) {
                      final slide = _slides[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 128,
                              height: 128,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: .15),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: .3),
                                ),
                                borderRadius: BorderRadius.circular(32),
                              ),
                              child: Icon(
                                slide.icon,
                                size: 56,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 36),
                            Text(
                              slide.title,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                height: 1.12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -.8,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 300),
                              child: Text(
                                slide.subtitle,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: .85),
                                  fontSize: 14.5,
                                  height: 1.65,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(32, 0, 32, 28),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_slides.length, (index) {
                          final active = index == _index;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 240),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: active ? 28 : 7,
                            height: 7,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(
                                alpha: active ? 1 : .4,
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _next,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: HikmaColors.emeraldDeep,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _isLast ? 'Commencer' : 'Continuer',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.chevron_right_rounded, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ],
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
