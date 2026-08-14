import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:pdfrx/pdfrx.dart';

import '../models/hikma_book.dart';

class PdfBookScreen extends StatelessWidget {
  const PdfBookScreen({required this.book, super.key});

  final HikmaBook book;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1B211E),
      body: Stack(
        children: [
          // Lecteur PDF
          PdfViewer.asset(
            book.assetPath,
            params: PdfViewerParams(
              margin: 16,
              backgroundColor: const Color(0xFF1B211E),
              // Configuration pour un défilement horizontal (Style Livre)
              layoutPages: (pages, params) {
                final height = pages.fold(0.0, (double prev, page) => math.max(prev, page.height)) + params.margin * 2;
                final pageLayouts = <Rect>[];
                double x = params.margin;
                
                for (var page in pages) {
                  pageLayouts.add(
                    Rect.fromLTWH(
                      x,
                      (height - page.height) / 2, // Centrage vertical
                      page.width,
                      page.height,
                    ),
                  );
                  x += page.width + params.margin;
                }
                
                return PdfPageLayout(
                  pageLayouts: pageLayouts,
                  documentSize: Size(x, height),
                );
              },
            ),
          ),
          
          // Bouton Retour Flottant
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ),
          
          // Titre du livre (Discret en haut au centre)
          Positioned(
            top: MediaQuery.of(context).padding.top + 20,
            left: 80,
            right: 80,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                book.title,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
