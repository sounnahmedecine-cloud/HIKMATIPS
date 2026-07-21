import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type ReminderKey = 'fajr' | 'midi' | 'isha';

export type ReminderPreferences = Record<ReminderKey, {
    enabled: boolean;
    time: string;
}>;

export const REMINDER_DEFINITIONS: Array<{
    key: ReminderKey;
    id: number;
    label: string;
    moment: string;
    defaultTime: string;
    title: string;
    body: string;
}> = [
    {
        key: 'fajr',
        id: 101,
        label: 'Fajr',
        moment: 'Commencer la journée avec une Hikma',
        defaultTime: '05:30',
        title: 'Votre Hikma du Fajr 🌅',
        body: 'Commencez la journée par un rappel qui éclaire le cœur.',
    },
    {
        key: 'midi',
        id: 102,
        label: 'Midi',
        moment: 'Faire une pause et recentrer son cœur',
        defaultTime: '12:00',
        title: 'Votre pause Hikma ☀️',
        body: 'Prenez une minute pour vous rappeler Allah au milieu de la journée.',
    },
    {
        key: 'isha',
        id: 103,
        label: 'Isha',
        moment: 'Terminer la journée dans la sérénité',
        defaultTime: '20:30',
        title: 'Votre Hikma du soir 🌙',
        body: 'Terminez la journée par une parole qui apaise et rapproche d’Allah.',
    },
];

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
    fajr: { enabled: true, time: '05:30' },
    midi: { enabled: true, time: '12:00' },
    isha: { enabled: true, time: '20:30' },
};

const STORAGE_KEY = 'hikma_daily_reminders_v2';
const ALL_NOTIFICATION_IDS = [{ id: 1 }, ...REMINDER_DEFINITIONS.map(({ id }) => ({ id }))];

const cloneDefaults = (): ReminderPreferences => ({
    fajr: { ...DEFAULT_REMINDER_PREFERENCES.fajr },
    midi: { ...DEFAULT_REMINDER_PREFERENCES.midi },
    isha: { ...DEFAULT_REMINDER_PREFERENCES.isha },
});

const isValidTime = (value: unknown): value is string =>
    typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const NotificationService = {
    isNative() {
        return Capacitor.isNativePlatform();
    },

    getPreferences(): ReminderPreferences {
        const defaults = cloneDefaults();
        if (typeof window === 'undefined') return defaults;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) return defaults;
            const parsed = JSON.parse(stored) as Partial<ReminderPreferences>;

            for (const definition of REMINDER_DEFINITIONS) {
                const value = parsed[definition.key];
                if (!value) continue;
                defaults[definition.key] = {
                    enabled: typeof value.enabled === 'boolean' ? value.enabled : true,
                    time: isValidTime(value.time) ? value.time : definition.defaultTime,
                };
            }
        } catch {
            return defaults;
        }

        return defaults;
    },

    savePreferences(preferences: ReminderPreferences) {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        }
    },

    async requestPermissions() {
        if (!this.isNative()) return true;
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
    },

    async ensureChannel() {
        if (Capacitor.getPlatform() !== 'android') return;
        await LocalNotifications.createChannel({
            id: 'hikma_daily',
            name: 'Rappels quotidiens',
            description: 'Hikma du Fajr, de midi et d’Isha',
            importance: 3,
            visibility: 1,
            vibration: true,
        });
    },

    async scheduleDailyReminders(preferences?: ReminderPreferences) {
        const resolvedPreferences = preferences ?? NotificationService.getPreferences();
        NotificationService.savePreferences(resolvedPreferences);

        // Le navigateur conserve les choix pour la prochaine ouverture dans l’app mobile.
        if (!NotificationService.isNative()) return true;

        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted' && !(await NotificationService.requestPermissions())) return false;

        await NotificationService.cancelDailyReminders();
        await NotificationService.ensureChannel();

        const notifications = REMINDER_DEFINITIONS
            .filter(({ key }) => resolvedPreferences[key].enabled)
            .map((definition) => {
                const [hour, minute] = resolvedPreferences[definition.key].time.split(':').map(Number);
                return {
                    id: definition.id,
                    title: definition.title,
                    body: definition.body,
                    largeBody: definition.body,
                    channelId: 'hikma_daily',
                    sound: 'default',
                    autoCancel: true,
                    schedule: {
                        on: { hour, minute },
                        allowWhileIdle: true,
                        repeats: true,
                    },
                    extra: {
                        path: '/generateur?generate=1',
                        reminder: definition.key,
                    },
                };
            });

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
        }

        return true;
    },

    async cancelDailyReminders() {
        if (!this.isNative()) return;
        await LocalNotifications.cancel({ notifications: ALL_NOTIFICATION_IDS });
    },

    async isEnabled() {
        const preferences = this.getPreferences();
        const hasEnabledPreference = REMINDER_DEFINITIONS.some(({ key }) => preferences[key].enabled);
        if (!this.isNative()) return hasEnabledPreference;

        const pending = await LocalNotifications.getPending();
        return pending.notifications.some((notification) =>
            REMINDER_DEFINITIONS.some(({ id }) => id === notification.id)
        );
    },
};
