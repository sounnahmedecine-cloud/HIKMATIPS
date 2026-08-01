# HikmaClips Flutter

Nouvelle expérience mobile premium de HikmaClips, conçue avec Flutter pour
Android, iOS et le Web.

## Identité

- Material 3 avec transitions, segments et gestes inspirés d’iOS
- palette émeraude, ivoire et or
- interface adaptative centrée sur téléphone pour la version Web
- navigation flottante, retour haptique et animations courtes

## Écrans

- Clips immersifs avec geste vertical
- Agent Hadith et suggestions
- Bibliothèque : favoris, collections et livres
- Réglages : rappels Fajr, Midi et Isha
- Sélecteur de catégories pour créer un rappel
- notifications quotidiennes persistantes, même application fermée
- choix et mémorisation de l’heure de chaque rappel
- reprogrammation automatique après redémarrage Android
- icône et écran de démarrage premium sur Android, iOS et Web
- sélection d’une photo personnelle comme fond de clip
- partage via la feuille système Android, iOS ou Web
- favoris persistants consultables dans la Bibliothèque

## Lancer l’application

```powershell
flutter pub get
flutter run
```

Le package Android et l’identifiant iOS sont `com.hikmatips.app`.

## Builds Android

```powershell
flutter build apk --release
flutter build appbundle --release
```

La configuration de signature locale est stockée dans les fichiers exclus de
Git `android/key.properties` et `android/app/*.jks`.
