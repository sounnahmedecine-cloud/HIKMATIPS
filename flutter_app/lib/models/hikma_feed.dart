import 'dart:math';

class HikmaFeedEntry {
  const HikmaFeedEntry({
    required this.clipIndex,
    required this.backgroundIndex,
  });

  final int clipIndex;
  final int backgroundIndex;
}

class HikmaFeed {
  HikmaFeed({
    required this.clipCount,
    required this.backgroundCount,
    Random? random,
    int? initialClipIndex,
  }) : assert(clipCount > 0),
       assert(backgroundCount > 0),
       assert(
         initialClipIndex == null ||
             (initialClipIndex >= 0 && initialClipIndex < clipCount),
       ),
       _random = random ?? Random() {
    if (initialClipIndex == null) {
      _history.add(_createEntry());
    } else {
      _clipDeck
        ..addAll(List<int>.generate(clipCount, (index) => index))
        ..shuffle(_random)
        ..remove(initialClipIndex);
      _history.add(
        HikmaFeedEntry(
          clipIndex: initialClipIndex,
          backgroundIndex: _takeNext(_backgroundDeck, backgroundCount, null),
        ),
      );
    }
  }

  final int clipCount;
  final int backgroundCount;
  final Random _random;
  final List<int> _clipDeck = [];
  final List<int> _backgroundDeck = [];
  final List<HikmaFeedEntry> _history = [];
  int _position = 0;

  HikmaFeedEntry get current => _history[_position];

  HikmaFeedEntry next() {
    if (_position < _history.length - 1) {
      _position += 1;
      return current;
    }
    _history.add(_createEntry());
    _position += 1;
    return current;
  }

  HikmaFeedEntry previous() {
    if (_position > 0) _position -= 1;
    return current;
  }

  HikmaFeedEntry _createEntry() {
    final previous = _history.isEmpty ? null : _history.last;
    return HikmaFeedEntry(
      clipIndex: _takeNext(_clipDeck, clipCount, previous?.clipIndex),
      backgroundIndex: _takeNext(
        _backgroundDeck,
        backgroundCount,
        previous?.backgroundIndex,
      ),
    );
  }

  int _takeNext(List<int> deck, int count, int? previous) {
    if (deck.isEmpty) {
      deck
        ..addAll(List<int>.generate(count, (index) => index))
        ..shuffle(_random);
      if (count > 1 && deck.last == previous) {
        final replacement = deck.indexWhere((index) => index != previous);
        final value = deck[replacement];
        deck[replacement] = deck.last;
        deck[deck.length - 1] = value;
      }
    }
    return deck.removeLast();
  }
}
