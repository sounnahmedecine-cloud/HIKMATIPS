import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
    async requestPermissions() {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
    },

    async scheduleDailyReminder(hour: number = 9, minute: number = 0) {
        // Cancel existing daily reminders first to avoid duplicates
        await this.cancelDailyReminders();

        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
            const requested = await this.requestPermissions();
            if (!requested) return false;
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "Votre Hikma du jour 🌙",
                    body: "Découvrez votre nouveau rappel spirituel pour bien commencer la journée.",
                    id: 1,
                    schedule: {
                        on: {
                            hour,
                            minute
                        },
                        allowWhileIdle: true,
                        repeats: true
                    },
                    sound: 'default',
                    actionTypeId: '',
                    extra: null
                }
            ]
        });
        return true;
    },

    async cancelDailyReminders() {
        await LocalNotifications.cancel({
            notifications: [{ id: 1 }]
        });
    },

    async isEnabled() {
        const pending = await LocalNotifications.getPending();
        return pending.notifications.some(n => n.id === 1);
    }
};
