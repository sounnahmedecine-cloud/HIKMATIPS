import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hikmaclips/models/hikma_book.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('all library books and covers are real bundled assets', () async {
    expect(hikmaBooks, hasLength(9));

    for (final book in hikmaBooks) {
      final pdf = await rootBundle.load(book.assetPath);
      final header = utf8.decode(pdf.buffer.asUint8List(pdf.offsetInBytes, 4));
      expect(header, '%PDF', reason: book.title);

      final cover = await rootBundle.load(book.coverAsset);
      expect(cover.lengthInBytes, greaterThan(1000), reason: book.title);
    }
  });
}
