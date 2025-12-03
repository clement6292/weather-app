import React from 'react';
import { useWeather } from '../context/WeatherContext';

const NotificationButton = ({ theme }) => {
  const { notificationsEnabled, enableNotifications } = useWeather();

  const handleEnableNotifications = async () => {
    const success = await enableNotifications();
    if (!success) {
      alert('Impossible d\'activer les notifications. Vérifiez les paramètres de votre navigateur.');
    }
  };

  if (notificationsEnabled) {
    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm ${
        theme === 'dark' 
          ? 'bg-green-800 text-green-200' 
          : 'bg-green-50 text-green-700'
      }`}>
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
        Notifications activées
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        theme === 'dark'
          ? 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700'
          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      }`}
      title="Activer les notifications d'alertes météo"
    >
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Notifications
    </button>
  );
};

export default NotificationButton;