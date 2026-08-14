import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../services/haptics_service.dart';
import '../services/quran_audio_service.dart';
import '../data/surah_names.dart';
import '../theme/hikma_theme.dart';
import 'quran_reading_screen.dart';

class QuranScreen extends StatefulWidget {
  const QuranScreen({super.key});

  @override
  State<QuranScreen> createState() => _QuranScreenState();
}

class _QuranScreenState extends State<QuranScreen> {
  final QuranAudioService _audioService = QuranAudioService();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Column(
        children: [
          _QuranHeader(
            reciter: _audioService.currentReciter,
            reciters: _audioService.reciters.keys.toList(),
            onReciterChanged: (value) async {
              HapticsService.selection();
              await _audioService.playSurah(
                _audioService.currentSurah,
                reciter: value,
              );
              if (mounted) setState(() {});
            },
          ),
          const SizedBox(height: 18),

          // Bandeau d'erreur réseau : les récitations sont distantes.
          StreamBuilder<QuranAudioStatus>(
            stream: _audioService.statusStream,
            initialData: _audioService.status,
            builder: (context, snapshot) {
              if (snapshot.data != QuranAudioStatus.error) {
                return const SizedBox.shrink();
              }
              final colors = Theme.of(context).colorScheme;
              return Container(
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 4),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colors.errorContainer,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.wifi_off_rounded,
                      color: colors.onErrorContainer,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _audioService.errorMessage ?? 'Connexion indisponible.',
                        style: TextStyle(
                          color: colors.onErrorContainer,
                          fontWeight: FontWeight.w600,
                          height: 1.35,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => _audioService.retry(),
                      style: TextButton.styleFrom(
                        foregroundColor: colors.onErrorContainer,
                      ),
                      child: const Text('Réessayer'),
                    ),
                  ],
                ),
              );
            },
          ),

          // Player Controls
          Container(
            margin: const EdgeInsets.fromLTRB(20, 0, 20, 4),
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 18),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: HikmaColors.emeraldDeep.withValues(alpha: .22),
                  blurRadius: 26,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              children: [
                StreamBuilder<int>(
                  stream: _audioService.currentSurahStream,
                  initialData: _audioService.currentSurah,
                  builder: (context, snapshot) {
                    final surah = snapshot.data ?? _audioService.currentSurah;
                    final entry = surahData[surah - 1];
                    return Column(
                      children: [
                        Text(
                          entry['arabic']!,
                          textDirection: TextDirection.rtl,
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(
                                color: HikmaColors.gold,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Sourate $surah - ${entry['french']}',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onPrimaryContainer,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 16),

                // Progress Bar
                StreamBuilder<Duration>(
                  stream: _audioService.player.positionStream,
                  builder: (context, snapshot) {
                    final position = snapshot.data ?? Duration.zero;
                    final duration =
                        _audioService.player.duration ?? Duration.zero;

                    return Column(
                      children: [
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            activeTrackColor: HikmaColors.gold,
                            inactiveTrackColor: HikmaColors.ivory.withValues(
                              alpha: .24,
                            ),
                            thumbColor: HikmaColors.gold,
                            overlayColor: HikmaColors.gold.withValues(
                              alpha: .16,
                            ),
                            trackHeight: 3,
                          ),
                          child: Slider(
                            value: position.inMilliseconds.toDouble().clamp(
                              0.0,
                              duration.inMilliseconds > 0
                                  ? duration.inMilliseconds.toDouble()
                                  : 1.0,
                            ),
                            min: 0.0,
                            max: duration.inMilliseconds > 0
                                ? duration.inMilliseconds.toDouble()
                                : 1.0,
                            onChanged: (value) {
                              _audioService.player.seek(
                                Duration(milliseconds: value.toInt()),
                              );
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _formatDuration(position),
                                style: const TextStyle(
                                  color: HikmaColors.onEmeraldMuted,
                                  fontWeight: FontWeight.w600,
                                  fontFeatures: [FontFeature.tabularFigures()],
                                ),
                              ),
                              Text(
                                _formatDuration(duration),
                                style: const TextStyle(
                                  color: HikmaColors.onEmeraldMuted,
                                  fontWeight: FontWeight.w600,
                                  fontFeatures: [FontFeature.tabularFigures()],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),

                // Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    StreamBuilder<LoopMode>(
                      stream: _audioService.player.loopModeStream,
                      builder: (context, snapshot) {
                        final loopMode = snapshot.data ?? LoopMode.off;
                        IconData icon;
                        Color color = Theme.of(
                          context,
                        ).colorScheme.onPrimaryContainer;
                        if (loopMode == LoopMode.off) {
                          icon = Icons.repeat_rounded;
                        } else if (loopMode == LoopMode.one) {
                          icon = Icons.repeat_one_on_rounded;
                          color = HikmaColors.gold;
                        } else {
                          icon = Icons.repeat_on_rounded;
                          color = HikmaColors.gold;
                        }
                        return IconButton(
                          iconSize: 28,
                          icon: Icon(icon),
                          color: color,
                          onPressed: _audioService.toggleLoopMode,
                        );
                      },
                    ),
                    IconButton(
                      iconSize: 42,
                      icon: const Icon(Icons.skip_previous_rounded),
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      onPressed: () {
                        _audioService.previousSurah();
                      },
                    ),
                    StreamBuilder<PlayerState>(
                      stream: _audioService.player.playerStateStream,
                      builder: (context, snapshot) {
                        final playerState = snapshot.data;
                        final processingState = playerState?.processingState;
                        final playing = playerState?.playing;
                        if (processingState == ProcessingState.loading ||
                            processingState == ProcessingState.buffering) {
                          return Container(
                            margin: const EdgeInsets.all(8.0),
                            width: 64.0,
                            height: 64.0,
                            child: const CircularProgressIndicator(
                              color: HikmaColors.gold,
                            ),
                          );
                        } else if (playing != true) {
                          return IconButton(
                            iconSize: 64,
                            icon: const Icon(Icons.play_circle_fill_rounded),
                            color: HikmaColors.gold,
                            onPressed: () {
                              if (_audioService.player.duration == null &&
                                  _audioService.player.processingState ==
                                      ProcessingState.idle) {
                                _audioService.playSurah(
                                  _audioService.currentSurah,
                                );
                              } else {
                                _audioService.player.play();
                              }
                            },
                          );
                        } else if (processingState !=
                            ProcessingState.completed) {
                          return IconButton(
                            iconSize: 64,
                            icon: const Icon(Icons.pause_circle_filled_rounded),
                            color: HikmaColors.gold,
                            onPressed: () => _audioService.player.pause(),
                          );
                        } else {
                          return IconButton(
                            iconSize: 64,
                            icon: const Icon(
                              Icons.replay_circle_filled_rounded,
                            ),
                            color: HikmaColors.gold,
                            onPressed: () =>
                                _audioService.player.seek(Duration.zero),
                          );
                        }
                      },
                    ),
                    IconButton(
                      iconSize: 42,
                      icon: const Icon(Icons.skip_next_rounded),
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      onPressed: () {
                        _audioService.nextSurah();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => QuranReadingScreen(
                          surahNumber: _audioService.currentSurah,
                          surahNameAr:
                              surahData[_audioService.currentSurah -
                                  1]['arabic']!,
                          surahNameFr:
                              surahData[_audioService.currentSurah -
                                  1]['french']!,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.menu_book_rounded),
                  label: const Text('Lire la sourate'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HikmaColors.emeraldDeep,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Surah List
          Expanded(
            child: StreamBuilder<int>(
              stream: _audioService.currentSurahStream,
              initialData: _audioService.currentSurah,
              builder: (context, snapshot) {
                final playingSurah =
                    snapshot.data ?? _audioService.currentSurah;
                return ListView.builder(
                  padding: const EdgeInsets.only(top: 18, bottom: 120),
                  itemCount: 114,
                  itemBuilder: (context, index) {
                    final surahNumber = index + 1;
                    final isPlaying = surahNumber == playingSurah;

                    final colors = Theme.of(context).colorScheme;

                    return Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                      child: Material(
                        color: isPlaying
                            ? HikmaColors.emerald.withValues(alpha: .11)
                            : colors.surface,
                        borderRadius: BorderRadius.circular(22),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(22),
                          onTap: () {
                            HapticsService.selection();
                            _audioService.playSurah(surahNumber);
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 12,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 42,
                                  height: 42,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isPlaying
                                        ? HikmaColors.emerald
                                        : HikmaColors.emerald.withValues(
                                            alpha: .12,
                                          ),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Text(
                                    '$surahNumber',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: isPlaying
                                          ? Colors.white
                                          : HikmaColors.emerald,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        surahData[index]['french']!,
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: isPlaying
                                              ? HikmaColors.emerald
                                              : colors.onSurface,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        surahData[index]['arabic']!,
                                        textDirection: TextDirection.rtl,
                                        style: TextStyle(
                                          fontSize: 15,
                                          height: 1.5,
                                          color: colors.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Icon(
                                  isPlaying
                                      ? Icons.graphic_eq_rounded
                                      : Icons.play_arrow_rounded,
                                  color: isPlaying
                                      ? HikmaColors.emerald
                                      : colors.onSurfaceVariant,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return "${duration.inHours > 0 ? '${twoDigits(duration.inHours)}:' : ''}$twoDigitMinutes:$twoDigitSeconds";
  }
}

/// En-tête dégradé aligné sur celui de la Bibliothèque, avec le sélecteur
/// de récitateur intégré.
class _QuranHeader extends StatelessWidget {
  const _QuranHeader({
    required this.reciter,
    required this.reciters,
    required this.onReciterChanged,
  });

  final String reciter;
  final List<String> reciters;
  final ValueChanged<String> onReciterChanged;

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
          const Text(
            'Coran',
            style: TextStyle(
              color: Colors.white,
              fontSize: 31,
              fontWeight: FontWeight.w800,
              letterSpacing: -.8,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '114 sourates récitées',
            style: TextStyle(
              color: Colors.white.withValues(alpha: .82),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .16),
              borderRadius: BorderRadius.circular(20),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: reciter,
                isExpanded: true,
                borderRadius: BorderRadius.circular(20),
                dropdownColor: HikmaColors.emeraldDeep,
                icon: const Icon(
                  Icons.expand_more_rounded,
                  color: Colors.white,
                ),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
                items: reciters
                    .map(
                      (name) => DropdownMenuItem<String>(
                        value: name,
                        child: Row(
                          children: [
                            const Icon(
                              Icons.record_voice_over_rounded,
                              size: 18,
                              color: HikmaColors.gold,
                            ),
                            const SizedBox(width: 10),
                            Text(name),
                          ],
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) onReciterChanged(value);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
