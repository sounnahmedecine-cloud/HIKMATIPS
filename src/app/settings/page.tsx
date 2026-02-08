'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Moon, Sun, Shield, FileText, Info, ExternalLink, User, LogIn, LogOut, Mail, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase/provider';
import { signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export default function ParametresPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [hdExport, setHdExport] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  };



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    if (!email || !password) {
      setAuthError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (e: unknown) {
      console.error('Erreur d\'authentification:', e);
      const error = e as { code?: string };
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAuthError('Cet email est déjà utilisé');
          break;
        case 'auth/invalid-email':
          setAuthError('Email invalide');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setAuthError('Email ou mot de passe incorrect');
          break;
        case 'auth/weak-password':
          setAuthError('Mot de passe trop faible');
          break;
        default:
          setAuthError('Erreur de connexion. Réessayez.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Erreur de déconnexion:', e);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-24 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center pt-6 pb-2">
          <h1 className="text-2xl font-bold text-hikma-gradient inline-block">Paramètres</h1>
        </div>

        {/* Section Compte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Utilisateur'} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{user.displayName || 'Utilisateur'}</h2>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground text-center">
                  Connectez-vous pour accéder à toutes les fonctionnalités.
                </p>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-sm text-destructive text-center">{authError}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        {isSignUp ? 'Créer un compte' : 'Se connecter'}
                      </>
                    )}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">HikmaClips</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                <Label htmlFor="dark-mode">Mode sombre</Label>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-primary" />
                <Label htmlFor="hd-export">Export HD</Label>
              </div>
              <Switch id="hd-export" checked={hdExport} onCheckedChange={setHdExport} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Légal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/privacy-policy">
              <Button variant="ghost" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Politique de confidentialité
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/terms-of-service">
              <Button variant="ghost" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Conditions d'utilisation
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              À propos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Développeur</span>
              <span className="font-medium">SounnahMedecine</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
