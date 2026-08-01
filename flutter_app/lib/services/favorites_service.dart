import 'package:shared_preferences/shared_preferences.dart';

class FavoritesService {
  FavoritesService._();

  static final FavoritesService instance = FavoritesService._();

  static const _favoritesKey = 'favorite_clip_ids';
  SharedPreferencesAsync? _preferences;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  Future<Set<String>> loadFavorites() async {
    try {
      return (await _store.getStringList(_favoritesKey) ?? const <String>[])
          .toSet();
    } on Object {
      return <String>{};
    }
  }

  Future<bool> toggle(String clipId) async {
    final favorites = await loadFavorites();
    final isNowFavorite = favorites.add(clipId);
    if (!isNowFavorite) favorites.remove(clipId);
    await _store.setStringList(_favoritesKey, favorites.toList()..sort());
    return isNowFavorite;
  }
}
