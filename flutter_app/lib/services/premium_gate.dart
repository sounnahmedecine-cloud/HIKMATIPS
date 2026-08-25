import '../models/hikma_clip.dart';
import 'premium_service.dart';

/// Ce que la version gratuite autorise. Regroupe ici plutôt qu'éparpillé
/// dans les écrans : une seule place à relire pour savoir ce qui est
/// réservé.
abstract final class PremiumGate {
  /// Catégories réservées aux abonnés.
  static const lockedKinds = <String>{'ramadan', 'invocation'};

  /// Un seul rappel quotidien sans abonnement : la fréquence libre est
  /// l'argument principal du Premium.
  static const freeReminderCount = 1;

  static bool get isPremium => PremiumService.instance.isPremium;

  static bool isKindLocked(String kind) =>
      !isPremium && lockedKinds.contains(kind);

  /// Le mode veille est réservé : il ne retire rien au flux, il ouvre une
  /// fonction en plus.
  static bool get sleepModeLocked => !isPremium;

  static int maxReminderCount(int requested) =>
      isPremium ? requested : freeReminderCount;

  /// Retire du flux les catégories verrouillées. Sans abonnement, le
  /// catalogue passe de 150 à 95 rappels.
  static List<HikmaClip> filter(List<HikmaClip> clips) {
    if (isPremium) return clips;
    final allowed = clips
        .where((clip) => !lockedKinds.contains(clip.kind))
        .toList();
    // Un catalogue vide bloquerait l'application : on garde tout plutôt
    // que d'afficher un écran sans contenu.
    return allowed.isEmpty ? clips : allowed;
  }

  static int lockedCount(List<HikmaClip> clips) =>
      clips.where((clip) => lockedKinds.contains(clip.kind)).length;
}
