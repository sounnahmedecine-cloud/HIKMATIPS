import 'package:flutter/material.dart';
import 'package:pdfrx/pdfrx.dart';

import '../models/hikma_book.dart';
import '../theme/hikma_theme.dart';

class PdfBookScreen extends StatelessWidget {
  const PdfBookScreen({required this.book, super.key});

  final HikmaBook book;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(book.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        backgroundColor: HikmaColors.emeraldDeep,
        foregroundColor: Colors.white,
      ),
      body: PdfViewer.asset(
        book.assetPath,
        params: const PdfViewerParams(
          margin: 8,
          backgroundColor: Color(0xFF1B211E),
        ),
      ),
    );
  }
}
