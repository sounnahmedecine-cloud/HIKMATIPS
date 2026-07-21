'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Bell, ExternalLink, FileText, Flame, Heart, Info, LogOut, Moon, Palette, Shield, Sparkles, Sun, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import {
  DEFAULT_REMINDER_PREFERENCES,
  NotificationService,
  REMINDER_DEFINITIONS,
  type ReminderKey,
  type ReminderPreferences,
} from '@/lib/notifications';
import { getUserStats, type UserStats } from '@/lib/utils';
import { HikmaAppDock } from '@/components/HikmaAppDock';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const themeOptions = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Nuit', icon: Moon },
  { value: 'maroc', label: 'Zellige', icon: Sparkles },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [reminders, setReminders] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFERENCES);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [stats, setStats] = useState<UserStats>({ streak: 0, lastVisit: '', totalVisits: 0, favoritesCount: 0 });
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    setReminders(NotificationService.getPreferences());
    void NotificationService.isEnabled().then(setNotifications).catch(() => setNotifications(false));
    setStats(getUserStats());
  }, []);

  const handleNotificationToggle = async (checked: boolean) => {
    setIsSavingNotifications(true);
    try {
      if (checked) {
        const next = REMINDER_DEFINITIONS.some(({ key }) => reminders[key].enabled)
          ? reminders
          : DEFAULT_REMINDER_PREFERENCES;
        setReminders(next);
        const enabled = await NotificationService.scheduleDailyReminders(next);
        setNotifications(enabled);
        toast({
          title: enabled ? 'Rappels activés' : 'Notifications refusées',
          description: enabled
            ? 'Vos Hikma du Fajr, de midi et d’Isha sont programmées.'
            : 'Autorisez les notifications dans les réglages du téléphone.',
          variant: enabled ? 'default' : 'destructive',
        });
      } else {
        await NotificationService.cancelDailyReminders();
        setNotifications(false);
        toast({ title: 'Rappels en pause', description: 'Vos horaires sont conservés.' });
      }
    } catch {
      setNotifications(false);
      toast({
        variant: 'destructive',
        title: 'Programmation impossible',
        description: 'Vérifiez les autorisations de notification de l’application.',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const updateReminder = async (key: ReminderKey, patch: Partial<ReminderPreferences[ReminderKey]>) => {
    const next: ReminderPreferences = {
      ...reminders,
      [key]: { ...reminders[key], ...patch },
    };
    setReminders(next);
    NotificationService.savePreferences(next);

    if (!notifications) return;

    setIsSavingNotifications(true);
    try {
      const hasActiveReminder = REMINDER_DEFINITIONS.some(({ key: reminderKey }) => next[reminderKey].enabled);
      if (hasActiveReminder) {
        const enabled = await NotificationService.scheduleDailyReminders(next);
        setNotifications(enabled);
      } else {
        await NotificationService.cancelDailyReminders();
        setNotifications(false);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Horaire non enregistré',
        description: 'Réessayez ou vérifiez les autorisations du téléphone.',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  if (!mounted) return null;

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Invité HikmaClips';
  const userEmail = user?.email || 'Connectez-vous pour synchroniser vos favoris';
  const initial = user?.email?.[0]?.toUpperCase() || 'H';

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#FBFAF7] text-[#14201A] [font-family:var(--font-hikma-ui)]">
      <header className="relative h-[200px] overflow-hidden bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] px-5 pt-[max(2.5rem,env(safe-area-inset-top))] text-white">
        <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-white/10 blur-[55px]" />
        <div className="relative mx-auto max-w-2xl">
          <h1 className="text-[26px] font-bold tracking-[-0.6px] [font-family:var(--font-display)]">Réglages</h1>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-3 backdrop-blur-xl">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-lg font-extrabold text-[#15703A] [font-family:var(--font-display)]">{initial}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold">{isUserLoading ? 'Chargement…' : userName}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/80">{userEmail}</p>
            </div>
            {user ? (
              <button onClick={() => auth && signOut(auth)} aria-label="Se déconnecter" className="grid h-8 w-8 place-items-center rounded-full bg-black/10 text-white/80">
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => router.push('/generateur')} className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-[#15703A]">S’identifier</button>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-[18px] min-h-[calc(100vh-182px)] max-w-2xl rounded-t-[30px] bg-[#FBFAF7] px-4 pb-32 pt-6">
        <section className="mb-3 rounded-[20px] border border-[#ECE8DF] bg-white p-4 shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)]">
          <h2 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9AA39B]">
            <Palette className="h-4 w-4 text-[#2E9E44]" /> Personnalisation
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const selected = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex items-center justify-center gap-1.5 rounded-[11px] py-2.5 text-[11px] font-semibold transition-all ${selected ? 'bg-[linear-gradient(160deg,#15703A_0%,#2E9E44_55%,#F5960F_132%)] text-white shadow-md' : 'bg-[#F5F1E8] text-[#9AA39B]'}`}
                >
                  <Icon className="h-3.5 w-3.5" /> {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-3 overflow-hidden rounded-[20px] border border-[#DDEBDF] bg-white shadow-[0_10px_26px_-12px_rgba(16,61,36,0.22)]">
          <div className="relative overflow-hidden bg-[linear-gradient(145deg,#15703A_0%,#2E9E44_72%,#F5960F_150%)] px-4 py-4 text-white">
            <div className="absolute -right-8 -top-14 h-32 w-32 rounded-full bg-white/15 blur-[2px]" />
            <div className="relative flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/20 bg-white/15 backdrop-blur-md">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-bold">Hikma au bon moment</h2>
                <p className="mt-0.5 text-[10px] font-medium text-white/75">
                  {notifications
                    ? `${REMINDER_DEFINITIONS.filter(({ key }) => reminders[key].enabled).length} rappels programmés chaque jour`
                    : 'Activez vos rappels spirituels quotidiens'}
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
                disabled={isSavingNotifications}
                aria-label="Activer tous les rappels quotidiens"
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-black/20 [&>span]:data-[state=checked]:bg-[#2E9E44]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#F0ECE3] px-4">
            {REMINDER_DEFINITIONS.map((definition) => {
              const preference = reminders[definition.key];
              const MomentIcon = definition.key === 'fajr' ? Sparkles : definition.key === 'midi' ? Sun : Moon;
              const iconClass = definition.key === 'fajr'
                ? 'bg-[#FFF4DE] text-[#F5960F]'
                : definition.key === 'midi'
                  ? 'bg-[#FFF8D9] text-[#D79B00]'
                  : 'bg-[#E8F0EC] text-[#15703A]';

              return (
                <div key={definition.key} className="flex items-center gap-3 py-3.5">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[13px] ${iconClass}`}>
                    <MomentIcon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-[#26302B]">{definition.label}</p>
                      <input
                        type="time"
                        value={preference.time}
                        onChange={(event) => void updateReminder(definition.key, { time: event.target.value })}
                        disabled={isSavingNotifications || !preference.enabled}
                        aria-label={`Horaire du rappel ${definition.label}`}
                        className="h-7 rounded-lg border border-[#E5E1D8] bg-[#F8F6F0] px-2 text-[10px] font-bold text-[#15703A] outline-none focus:border-[#2E9E44] disabled:opacity-45"
                      />
                    </div>
                    <p className="mt-1 truncate text-[9px] font-medium text-[#9AA39B]">{definition.moment}</p>
                  </div>
                  <Switch
                    checked={preference.enabled}
                    onCheckedChange={(enabled) => void updateReminder(definition.key, { enabled })}
                    disabled={isSavingNotifications}
                    aria-label={`Activer le rappel ${definition.label}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#F0ECE3] bg-[#FBFAF7] px-4 py-3">
            <p className="text-[9px] font-medium leading-relaxed text-[#8A948D]">
              {NotificationService.isNative()
                ? 'Les rappels sont envoyés même lorsque l’application est fermée. Ajustez Fajr et Isha selon votre ville et la saison.'
                : 'Les horaires sont enregistrés et seront appliqués dans l’application mobile. Ajustez Fajr et Isha selon votre ville et la saison.'}
            </p>
          </div>
        </section>

        <section className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-[18px] border border-[#ECE8DF] bg-white p-3 text-center shadow-[0_8px_22px_-12px_rgba(16,61,36,0.18)]">
            <p className="flex items-center justify-center gap-1 text-xl font-extrabold text-[#2E9E44] [font-family:var(--font-display)]"><Flame className="h-4 w-4" /> {stats.streak}</p>
            <p className="mt-1 text-[9px] font-semibold text-[#9AA39B]">Jours</p>
          </div>
          <div className="rounded-[18px] border border-[#ECE8DF] bg-white p-3 text-center shadow-[0_8px_22px_-12px_rgba(16,61,36,0.18)]">
            <p className="text-xl font-extrabold text-[#15703A] [font-family:var(--font-display)]">{stats.totalVisits}</p>
            <p className="mt-1 text-[9px] font-semibold text-[#9AA39B]">Visites</p>
          </div>
          <div className="rounded-[18px] border border-[#ECE8DF] bg-white p-3 text-center shadow-[0_8px_22px_-12px_rgba(16,61,36,0.18)]">
            <p className="flex items-center justify-center gap-1 text-xl font-extrabold text-[#F5960F] [font-family:var(--font-display)]"><Heart className="h-4 w-4" fill="currentColor" /> {stats.favoritesCount}</p>
            <p className="mt-1 text-[9px] font-semibold text-[#9AA39B]">Favoris</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[20px] border border-[#ECE8DF] bg-white shadow-[0_8px_22px_-10px_rgba(16,61,36,0.18)]">
          <h2 className="flex items-center gap-2 px-4 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9AA39B]"><Shield className="h-4 w-4 text-[#2E9E44]" /> Informations</h2>
          <button onClick={() => router.push('/privacy-policy')} className="flex w-full items-center justify-between border-b border-[#F0ECE3] px-4 py-3.5 text-left text-xs font-semibold hover:bg-[#F8F6F0]">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#7A857D]" /> Confidentialité</span><ExternalLink className="h-3.5 w-3.5 text-[#C4CBC5]" />
          </button>
          <button onClick={() => router.push('/updates')} className="flex w-full items-center justify-between px-4 py-3.5 text-left text-xs font-semibold hover:bg-[#F8F6F0]">
            <span className="flex items-center gap-2"><Info className="h-4 w-4 text-[#7A857D]" /> À propos de HikmaClips</span><span className="text-[10px] text-[#B7BEB8]">v1.3.0</span>
          </button>
        </section>
      </main>

      <HikmaAppDock active="settings" />
    </div>
  );
}
