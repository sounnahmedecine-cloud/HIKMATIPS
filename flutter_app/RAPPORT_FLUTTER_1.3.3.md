# Rapport de finalisation — HikmaClips Flutter 1.3.3

Date de vérification : 29 juillet 2026

## Résultat

La version Flutter ne présente plus de bouton ou de promesse fonctionnelle fictive dans les écrans principaux. Les fonctions qui n’existent pas réellement — compte, abonnement Premium, paiement, recherche IA distante et synchronisation cloud — ne sont pas annoncées dans l’interface.

L’application fonctionne en priorité hors ligne avec 150 rappels uniques, 25 arrière-plans intégrés et 9 livres PDF. Une galerie en ligne permet également de choisir parmi 50 fonds Cloudinary du serveur HikmaClips.

## Écrans et fonctions vérifiés

| Écran | Fonctions réelles |
| --- | --- |
| Clips / Accueil | Flux anti-répétition, swipe, favoris persistants, export du clip en image PNG verticale et partage vers WhatsApp/TikTok, choix parmi 50 fonds du serveur, choix d’une image personnelle, retour aux fonds automatiques, catégories et thèmes réels |
| Recherche Hadith | Recherche locale accent-insensible dans 50 hadiths, classement des correspondances, historique persistant, ouverture du hadith exact dans le générateur |
| Bibliothèque | Favoris, quatre collections calculées depuis le catalogue, couvertures réelles et lecture de 9 PDF hors ligne |
| Réglages | Thème système/clair/sombre persistant, vibrations activables, heures de rappels persistantes, fiches Sources, Confidentialité et Aide fonctionnelles |
| Notifications | Rappels Fajr, Midi et Isha programmables, demande d’autorisation système, annulation réelle, restauration Android après redémarrage |
| Création | Choix Hadith, Coran, Ramadan, Thématique, Recherche ou Citadelle ; chaque choix ouvre un flux filtré réel |

## Catalogue

- 50 hadiths
- 30 versets du Coran
- 15 rappels Ramadan
- 15 invocations de la Citadelle
- 40 invocations Rabbana
- Total : 150 rappels avec identifiants uniques
- 25 images d’arrière-plan utilisées avant tout nouveau mélange
- 50 fonds HD uniques chargés depuis les quatre espaces Cloudinary déjà utilisés par la version web
- Aucun rappel ni arrière-plan immédiatement répété

## Livres hors ligne

Neuf fichiers PDF réels sont embarqués dans l’application et ouverts avec `pdfrx 2.4.7` :

- 50 questions-réponses sur la Aqida
- Les leçons importantes
- Commentaire des leçons importantes
- Les 40 hadiths de l’imam An-Nawawi
- Kitab At-Tawhid
- Riyad As-Salihin
- La véritable confiance en Allah
- Le repentir
- Les pieux prédécesseurs pendant Ramadan

## Vérifications techniques

- `dart analyze lib test` : aucune anomalie
- Tests Flutter : 8 sur 8 réussis
- Parcours testé : Accueil → Recherche → résultat réel → clip exact → Bibliothèque → Réglages
- Test du catalogue : identifiants uniques et quatre types de contenu présents
- Test anti-répétition : tout le contenu et toutes les images sont parcourus avant remélange
- Test d’interface : le raccourci « Choisir un fond » est présent au-dessus du bouton Favoris
- Test du partage : génération d’une image PNG au format exact 9:16 avec fond, texte et source, puis transmission comme fichier `image/png` au partage Android
- Test de visibilité TikTok : le contenu textuel reste au-dessus des 72 % de hauteur et à gauche des 82 % de largeur, laissant libres la zone de légende inférieure et la colonne d’actions à droite
- Test serveur : 50 URL Cloudinary uniques et quatre espaces vérifiés en HTTPS
- Test sur téléphone ADB : galerie affichée, vignettes chargées et fond sélectionné appliqué au clip
- Test sur téléphone ADB : WhatsApp et TikTok détectés comme destinations compatibles `image/png` ; TikTok s’ouvre depuis l’action de partage
- Test des ressources : les 9 fichiers commencent par une signature PDF valide
- Test des préférences : thème, vibrations, activation et heures des rappels persistent
- AAB release : compilation réussie
- APK release : compilation réussie et signature APK v2 vérifiée

## Identité Android

- Nom de package : `com.hikmatips.app`
- Nom affiché : `HikmaClips`
- Version : `1.3.3`
- Code de version : `133`
- Certificat de la clé d’envoi, SHA-256 : `F2:54:E1:A0:83:98:C6:DE:A8:82:FA:3D:A0:31:88:69:6A:BB:D6:A3:49:0A:76:92:48:9A:84:1C:F8:DC:C3:2E`

L’empreinte de signature d’application fournie par Google Play (`BC:3A:…:53:3F`) est différente de la clé d’envoi locale. C’est normal lorsque la signature d’application Play est activée : l’AAB est envoyé avec la clé d’envoi, puis Google Play signe les APK distribués avec sa clé d’application. Une empreinte seule ne contient jamais la clé privée et ne peut pas servir à signer localement.

## Livrables

- `HikmaClips-Flutter-1.3.3-v133-release.aab`
  - Taille : 121 981 200 octets
  - SHA-256 : `D773EC2066F8B7EA59C0EE9A49D808516B01158ABE8BF23C824A0F7C26723A65`
- `HikmaClips-Flutter-1.3.3-v133-release.apk`
  - Taille : 131 922 051 octets
  - SHA-256 : `770280B617F7D538207F9D6933815F55415DAC5A62426B20DA193FFC89B6AC40`

## Limites assumées et non simulées

- Aucune authentification, aucun profil distant et aucune synchronisation cloud.
- Aucun abonnement ni paiement Premium.
- La recherche est locale et ne prétend plus utiliser une IA distante.
- Les 25 fonds intégrés restent disponibles hors ligne. La galerie Cloudinary de 50 fonds exige une connexion au moment du premier chargement.
- Le partage remet une vraie image au système Android. La sélection du contact WhatsApp et la validation finale d’une publication TikTok restent volontairement sous le contrôle de l’utilisateur.
- Les notifications exigent l’autorisation du téléphone. Elles peuvent fonctionner application fermée, mais pas lorsque le téléphone est éteint ; Android les restaure après redémarrage.
- Une alerte de migration future Kotlin est émise par la dépendance `flutter_timezone`. Elle ne bloque ni la compilation ni le fonctionnement de cette version.
