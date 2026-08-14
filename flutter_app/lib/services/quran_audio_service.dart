import 'dart:async';

import 'package:audio_session/audio_session.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import '../data/surah_names.dart';

/// État de chargement de la playlist, exposé à l'interface.
enum QuranAudioStatus { loading, ready, error }

class QuranAudioService {
  static final QuranAudioService _instance = QuranAudioService._internal();

  factory QuranAudioService() {
    return _instance;
  }

  QuranAudioService._internal() {
    _ready = _init();
  }

  final AudioPlayer player = AudioPlayer();

  /// Complète lorsque la première playlist est chargée. Toute méthode publique
  /// l'attend : l'interface peut se construire avant la fin de l'init.
  late final Future<void> _ready;

  final _statusController = StreamController<QuranAudioStatus>.broadcast();

  /// Statut de chargement, pour afficher une erreur réseau plutôt qu'un
  /// indicateur de chargement infini.
  Stream<QuranAudioStatus> get statusStream => _statusController.stream;

  QuranAudioStatus _status = QuranAudioStatus.loading;
  QuranAudioStatus get status => _status;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  void _setStatus(QuranAudioStatus value, {String? message}) {
    _status = value;
    _errorMessage = message;
    if (!_statusController.isClosed) {
      _statusController.add(value);
    }
  }

  Future<void> _init() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

    await _loadPlaylistForReciter(currentReciter);
  }

  // Reciters configuration
  final Map<String, String> reciters = {
    'Al-Mu\'aiqly': 'https://server12.mp3quran.net/maher/',
    'Chateri': 'https://server11.mp3quran.net/shatri/',
    'Ali Jaber': 'https://server11.mp3quran.net/a_jaber/',
  };

  String currentReciter = 'Al-Mu\'aiqly';

  /// Sourate en cours (1..114). `currentIndex` est nul tant que la source
  /// audio n'est pas attachée : on retombe alors sur la dernière connue.
  int _lastKnownSurah = 1;

  int get currentSurah {
    final index = player.currentIndex;
    if (index == null) return _lastKnownSurah;
    _lastKnownSurah = index + 1;
    return _lastKnownSurah;
  }

  /// Émet le numéro de sourate à chaque changement de piste, pour que
  /// l'interface suive les enchaînements automatiques.
  Stream<int> get currentSurahStream => player.currentIndexStream.map((index) {
    if (index != null) _lastKnownSurah = index + 1;
    return _lastKnownSurah;
  }).distinct();

  Future<void> _loadPlaylistForReciter(String reciter) async {
    final baseUrl = reciters[reciter]!;
    final List<AudioSource> audioSources = [];

    for (int i = 0; i < 114; i++) {
      final surahNumber = i + 1;
      final formattedSurah = surahNumber.toString().padLeft(3, '0');
      final url = '$baseUrl$formattedSurah.mp3';
      final frenchName = surahData[i]['french']!;

      audioSources.add(
        AudioSource.uri(
          Uri.parse(url),
          tag: MediaItem(
            id: url,
            album: 'Coran',
            title: 'Sourate $surahNumber - $frenchName',
            artist: reciter,
          ),
        ),
      );
    }

    _setStatus(QuranAudioStatus.loading);
    try {
      await player.setAudioSources(
        audioSources,
        initialIndex: _lastKnownSurah - 1,
        initialPosition: Duration.zero,
      );
      _setStatus(QuranAudioStatus.ready);
    } catch (e) {
      _setStatus(
        QuranAudioStatus.error,
        message:
            'Impossible de charger la récitation. Vérifiez votre connexion '
            'internet puis réessayez.',
      );
    }
  }

  /// Recharge la playlist après une erreur réseau.
  Future<void> retry() => _loadPlaylistForReciter(currentReciter);

  Future<void> playSurah(int surahNumber, {String? reciter}) async {
    await _ready;

    if (reciter != null && reciter != currentReciter) {
      currentReciter = reciter;
      _lastKnownSurah = surahNumber;
      await _loadPlaylistForReciter(currentReciter);
      if (_status == QuranAudioStatus.error) return;
    }

    if (_status == QuranAudioStatus.error) return;

    try {
      await player.seek(Duration.zero, index: surahNumber - 1);
      await player.play();
    } catch (e) {
      _setStatus(
        QuranAudioStatus.error,
        message:
            'La lecture a échoué. Vérifiez votre connexion internet puis '
            'réessayez.',
      );
    }
  }

  Future<void> nextSurah() async {
    await _ready;
    if (player.hasNext) {
      await player.seekToNext();
    }
  }

  Future<void> previousSurah() async {
    await _ready;
    if (player.hasPrevious) {
      await player.seekToPrevious();
    }
  }

  Future<void> toggleLoopMode() async {
    final currentLoopMode = player.loopMode;
    if (currentLoopMode == LoopMode.off) {
      await player.setLoopMode(LoopMode.one);
    } else if (currentLoopMode == LoopMode.one) {
      await player.setLoopMode(LoopMode.all);
    } else {
      await player.setLoopMode(LoopMode.off);
    }
  }

  void dispose() {
    _statusController.close();
    player.dispose();
  }
}
