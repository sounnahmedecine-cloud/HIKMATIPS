import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../theme/hikma_theme.dart';

class QuranReadingScreen extends StatefulWidget {
  final int surahNumber;
  final String surahNameAr;
  final String surahNameFr;

  const QuranReadingScreen({
    super.key,
    required this.surahNumber,
    required this.surahNameAr,
    required this.surahNameFr,
  });

  @override
  State<QuranReadingScreen> createState() => _QuranReadingScreenState();
}

class _QuranReadingScreenState extends State<QuranReadingScreen> {
  bool _isLoading = true;
  bool _hasError = false;
  List<Map<String, dynamic>> _ayahs = [];

  @override
  void initState() {
    super.initState();
    _fetchSurah();
  }

  Future<void> _fetchSurah() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      final response = await http.get(
        Uri.parse('https://api.alquran.cloud/v1/surah/${widget.surahNumber}/editions/quran-uthmani,fr.hamidullah'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final arEdition = data['data'][0]['ayahs'] as List;
        final frEdition = data['data'][1]['ayahs'] as List;

        List<Map<String, dynamic>> parsedAyahs = [];
        for (int i = 0; i < arEdition.length; i++) {
          parsedAyahs.add({
            'numberInSurah': arEdition[i]['numberInSurah'],
            'ar': arEdition[i]['text'],
            'fr': frEdition[i]['text'],
          });
        }

        setState(() {
          _ayahs = parsedAyahs;
          _isLoading = false;
        });
      } else {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _hasError = true;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.surahNameAr, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text(widget.surahNameFr, style: const TextStyle(fontSize: 14)),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: HikmaColors.gold),
      );
    }

    if (_hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            const Text("Erreur lors du chargement du texte."),
            const Text("Vérifiez votre connexion internet."),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchSurah,
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _ayahs.length,
      itemBuilder: (context, index) {
        final ayah = _ayahs[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            color: Theme.of(
              context,
            ).colorScheme.surfaceContainerHighest.withValues(alpha: .3),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Badge Ayah number
              Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    'Verset ${ayah['numberInSurah']}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              
              // Arabic Text
              Text(
                ayah['ar'],
                textAlign: TextAlign.right,
                textDirection: TextDirection.rtl,
                style: const TextStyle(
                  fontSize: 26,
                  height: 1.8,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Amiri', // Works well if installed, else falls back cleanly
                ),
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              
              // French Text
              Text(
                ayah['fr'],
                style: const TextStyle(
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
