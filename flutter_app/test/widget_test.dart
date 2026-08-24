import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hikmaclips/app.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

void main() {
  // Les slides d'accueil écrivent leur état : sans stockage en mémoire,
  // le tap sur « Passer » lève une erreur de plateforme.
  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
  });

  tearDown(() {
    SharedPreferencesAsyncPlatform.instance = null;
  });

  testWidgets('all primary screens and the real search flow work', (
    tester,
  ) async {
    await tester.pumpWidget(const HikmaClipsApp());
    await tester.pump();
    await tester.pump(const Duration(seconds: 2));

    // Au premier lancement les slides d'accueil précèdent l'application.
    expect(find.text('Diffuse la sagesse, en un clip.'), findsOneWidget);
    await tester.tap(find.text('Passer'));
    await tester.pumpAndSettle();

    // Puis le guidage de l'écran Clips, qu'on écarte avant de continuer.
    expect(find.text('Un nouveau rappel à chaque geste'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('coach-skip')));
    await tester.pumpAndSettle();

    expect(find.text('GLISSEZ POUR UN NOUVEAU CLIP'), findsOneWidget);
    expect(find.text('Recherche'), findsOneWidget);
    expect(find.bySemanticsLabel('Partager l’image'), findsOneWidget);

    final shareCard = find.byKey(const ValueKey('share-card-boundary'));
    final shareCardSize = tester.getSize(shareCard);
    expect(shareCardSize.width / shareCardSize.height, closeTo(9 / 16, .01));
    final shareCardRect = tester.getRect(shareCard);
    final safeContentRect = tester.getRect(
      find.byKey(const ValueKey('share-safe-content')),
    );
    expect(
      safeContentRect.bottom,
      lessThanOrEqualTo(shareCardRect.top + shareCardRect.height * .72),
    );
    expect(
      safeContentRect.right,
      lessThanOrEqualTo(shareCardRect.left + shareCardRect.width * .82),
    );
    final shareBoundaryFinder = find
        .ancestor(of: shareCard, matching: find.byType(RepaintBoundary))
        .first;
    final shareBoundary = tester.renderObject<RenderRepaintBoundary>(
      shareBoundaryFinder,
    );
    final sharedImage = await shareBoundary.toImage();
    expect(sharedImage.width, greaterThan(0));
    expect(sharedImage.height, greaterThan(sharedImage.width));
    sharedImage.dispose();

    expect(find.byKey(const ValueKey('background-action')), findsOneWidget);
    expect(find.byTooltip('Choisir un fond'), findsOneWidget);
    expect(
      tester.getCenter(find.byKey(const ValueKey('background-action'))).dy,
      lessThan(
        tester.getCenter(find.byKey(const ValueKey('favorite-action'))).dy,
      ),
    );
    await tester.tap(find.byKey(const ValueKey('background-action')));
    await tester.pumpAndSettle();
    expect(find.text('Images HikmaClips du serveur'), findsOneWidget);
    expect(find.text('Galerie du téléphone'), findsOneWidget);

    await tester.tap(find.text('Images HikmaClips du serveur'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Fonds HikmaClips'), findsOneWidget);
    expect(find.text('50 images disponibles'), findsOneWidget);
    await tester.tap(find.byTooltip('Fermer'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Recherche'));
    await tester.pumpAndSettle();
    expect(find.text('Recherche Hadith'), findsOneWidget);
    expect(find.text('EXEMPLE'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'colère');
    await tester.tap(find.byTooltip('Rechercher'));
    await tester.pump(const Duration(milliseconds: 500));
    await tester.drag(find.byType(CustomScrollView), const Offset(0, -650));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Créer un clip avec ce hadith'), findsWidgets);

    // Le dock inférieur est fixe : on dégage le bouton de résultat avant le tap.
    await tester.drag(find.byType(CustomScrollView), const Offset(0, -180));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Créer un clip avec ce hadith').first);
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('Filtre : Hadith sélectionné'), findsOneWidget);
    expect(find.textContaining('colère'), findsWidgets);

    await tester.tap(find.text('Biblio'));
    await tester.pumpAndSettle();
    expect(find.text('Bibliothèque'), findsOneWidget);
    // Deux segments seulement depuis le retrait des livres PDF.
    expect(find.text('Favoris'), findsOneWidget);
    expect(find.text('Collections'), findsOneWidget);
    expect(find.text('Livres'), findsNothing);

    // Trois onglets seulement : le Coran audio a été retiré. Les Réglages
    // s'ouvrent depuis la pastille RÉGLAGES de l'écran Clips.
    expect(find.text('Coran'), findsNothing);

    await tester.tap(find.text('Clips'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('RÉGLAGES'));
    await tester.pumpAndSettle();
    expect(find.text('Votre rendez-vous avec la Hikma'), findsOneWidget);
    expect(find.byType(Switch), findsWidgets);
  });
}
