"use client"

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Moon, Sun, Shield, FileText, Info, ExternalLink, User, LogOut, Bell, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function ParametresPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Erreur de déconnexion:', e);
    }
  };

  return (
    <div className="min-h-full pb-32 max-w-2xl mx-auto p-4">
      <div className="mb-8 pt-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-purple-50 mb-2">Paramètres</h1>
        <p className="text-slate-500 dark:text-slate-400">Gérez vos préférences et votre routine spirituelle.</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center text-xl font-bold text-purple-500">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{user.displayName || 'Utilisateur'}</h2>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 text-destructive border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connectez-vous pour synchroniser vos favoris et vos rappels.
                </p>
                <Button className="w-full bg-purple-500 hover:bg-purple-500" onClick={() => window.location.href = '/'}>
                  S'identifier
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customization Section */}
        <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              Personnalisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Thème Visuel</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full h-12 rounded-xl border-purple-100 dark:border-purple-700 bg-white/50 dark:bg-slate-900/50">
                  <SelectValue placeholder="Choisir un thème" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-purple-100 dark:border-purple-700">
                  <SelectItem value="light">Classique (Clair)</SelectItem>
                  <SelectItem value="dark">Sombre (Nuit)</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                  <SelectItem value="maroc">Marocain (Vert/Or Zellige)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications & Rappels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels Quotidiens</Label>
                <p className="text-xs text-muted-foreground">Recevez une Hikma chaque jour.</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Moments Clés</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Fajr', 'Midi', 'Isha'].map((time) => (
                  <Button key={time} variant="outline" size="sm" className="rounded-full h-10 border-purple-100 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-800/20">
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Légal & Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-purple-50 dark:divide-purple-800/30">
              <button className="w-full h-14 px-6 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-800/10 transition-colors">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Politique de confidentialité
                </span>
                <ExternalLink className="h-4 w-4 opacity-30" />
              </button>
              <button className="w-full h-14 px-6 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-800/10 transition-colors">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Info className="h-4 w-4" /> À propos de HikmaClips
                </span>
                <span className="text-xs opacity-40">v1.2.0</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
