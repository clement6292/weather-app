// Service de notifications push
export class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Ce navigateur ne supporte pas les notifications');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du SW:', error);
        throw error;
      }
    }
    throw new Error('Service Worker non supporté');
  }

  static async showNotification(alert) {
    if (Notification.permission !== 'granted') {
      return false;
    }

    const options = {
      body: alert.message,
      icon: '/vite.svg',
      tag: `weather-${alert.type}`,
      requireInteraction: alert.severity === 'critical'
    };

    new Notification(alert.title, options);
    return true;
  }

  static shouldNotify(alert) {
    // Notifier seulement pour les alertes critiques et warnings
    return ['critical', 'warning'].includes(alert.severity);
  }
}