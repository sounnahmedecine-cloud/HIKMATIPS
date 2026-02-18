# Script de build et synchro pour Android
Write-Host "🚀 Démarrage du processus de build propre..." -ForegroundColor Cyan

# 1. Nettoyage
Write-Host "🧹 Nettoyage des anciens fichiers..." -ForegroundColor Yellow
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# 2. Build Next.js
Write-Host "🏗️ Construction de l'application Next.js..." -ForegroundColor Yellow
$buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build:cap" -Wait -PassThru
if ($buildProcess.ExitCode -ne 0) {
    Write-Host "❌ Erreur lors du build. Arrêt." -ForegroundColor Red
    exit 1
}

# 3. Synchro Capacitor
Write-Host "🔄 Synchronisation avec Android..." -ForegroundColor Yellow
$syncProcess = Start-Process -FilePath "npx" -ArgumentList "cap", "sync", "android" -Wait -PassThru
if ($syncProcess.ExitCode -ne 0) {
    Write-Host "❌ Erreur lors de la synchro. Arrêt." -ForegroundColor Red
    exit 1
}

# 4. Ouverture Android Studio
Write-Host "📱 Ouverture d'Android Studio..." -ForegroundColor Green
Start-Process -FilePath "npx" -ArgumentList "cap", "open", "android"

Write-Host "✅ Terminé ! Lancez le build depuis Android Studio." -ForegroundColor Cyan
