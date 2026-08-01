import 'package:shared_preferences/shared_preferences.dart';

class SearchHistoryService {
  SearchHistoryService._();

  static final SearchHistoryService instance = SearchHistoryService._();
  static const _key = 'hadith_search_history';

  SharedPreferencesAsync? _preferences;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  Future<List<String>> load() async {
    try {
      return await _store.getStringList(_key) ?? const <String>[];
    } on Object {
      return const <String>[];
    }
  }

  Future<List<String>> add(String query) async {
    final history = List<String>.of(await load());
    final normalized = query.trim();
    history.removeWhere(
      (item) => item.toLowerCase() == normalized.toLowerCase(),
    );
    history.insert(0, normalized);
    final limited = history.take(8).toList();
    try {
      await _store.setStringList(_key, limited);
    } on Object {
      // The in-memory result remains usable if local persistence is unavailable.
    }
    return limited;
  }

  Future<void> clear() async {
    try {
      await _store.remove(_key);
    } on Object {
      // Clearing an unavailable local store is already the desired outcome.
    }
  }
}
