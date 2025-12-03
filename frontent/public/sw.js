// Service Worker pour les notifications push
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'weather-alert',
      requireInteraction: data.severity === 'critical',
      actions: [
        {
          action: 'view',
          title: 'Voir détails'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});