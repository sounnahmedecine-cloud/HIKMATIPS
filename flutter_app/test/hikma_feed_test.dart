import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:hikmaclips/models/hikma_clip.dart';
import 'package:hikmaclips/models/hikma_feed.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('loads the complete local catalog without duplicate ids', () async {
    final clips = await loadHikmaClips();

    expect(clips.length, greaterThanOrEqualTo(140));
    expect(clips.map((clip) => clip.id).toSet(), hasLength(clips.length));
    expect(hikmaBackgrounds.length, greaterThanOrEqualTo(20));
    expect(clips.map((clip) => clip.kind).toSet(), {
      'hadith',
      'coran',
      'ramadan',
      'invocation',
    });
  });

  test('uses every clip and background before reshuffling', () {
    final feed = HikmaFeed(
      clipCount: 80,
      backgroundCount: 25,
      random: Random(42),
    );
    final clips = <int>[feed.current.clipIndex];
    final backgrounds = <int>[feed.current.backgroundIndex];

    for (var index = 1; index < 80; index += 1) {
      final entry = feed.next();
      clips.add(entry.clipIndex);
      if (index < 25) backgrounds.add(entry.backgroundIndex);
    }

    expect(clips.toSet(), hasLength(80));
    expect(backgrounds.toSet(), hasLength(25));
  });

  test('never repeats the immediately previous content or image', () {
    final feed = HikmaFeed(
      clipCount: 80,
      backgroundCount: 25,
      random: Random(7),
    );
    var previous = feed.current;

    for (var index = 0; index < 300; index += 1) {
      final current = feed.next();
      expect(current.clipIndex, isNot(previous.clipIndex));
      expect(current.backgroundIndex, isNot(previous.backgroundIndex));
      previous = current;
    }
  });
}
