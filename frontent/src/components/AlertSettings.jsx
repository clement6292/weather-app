import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import SuccessModal from './SuccessModal';

const AlertSettings = ({ theme, onClose }) => {
  const [customAlerts, setCustomAlerts] = useState({
    rainTomorrow: false,
    tempBelow: { enabled: false, value: 0 },
    tempAbove: { enabled: false, value: 30 },
    windAbove: { enabled: false, value: 50 }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Charger les alertes sauvegardées au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customAlerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomAlerts(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Erreur chargement alertes:', e);
    }
  }, []);

  const handleSave = () => {
    console.log('Sauvegarde des alertes personnalisées:', customAlerts);
    localStorage.setItem('customAlerts', JSON.stringify(customAlerts));
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-xl p-6 max-w-md w-full mx-4 ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Alertes personnalisées</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={customAlerts.rainTomorrow}
              onChange={(e) => setCustomAlerts(prev => ({...prev, rainTomorrow: e.target.checked}))}
              className="mr-3"
            />
            Prévenir si pluie demain
          </label>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={customAlerts.tempBelow.enabled}
              onChange={(e) => setCustomAlerts(prev => ({
                ...prev, 
                tempBelow: {...prev.tempBelow, enabled: e.target.checked}
              }))}
              className="mr-2"
            />
            <span>Température sous</span>
            <input
              type="number"
              value={customAlerts.tempBelow.value}
              onChange={(e) => setCustomAlerts(prev => ({
                ...prev,
                tempBelow: {...prev.tempBelow, value: parseInt(e.target.value)}
              }))}
              className={`w-16 px-2 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            />
            <span>°C</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={customAlerts.tempAbove.enabled}
              onChange={(e) => setCustomAlerts(prev => ({
                ...prev,
                tempAbove: {...prev.tempAbove, enabled: e.target.checked}
              }))}
              className="mr-2"
            />
            <span>Température au-dessus</span>
            <input
              type="number"
              value={customAlerts.tempAbove.value}
              onChange={(e) => setCustomAlerts(prev => ({
                ...prev,
                tempAbove: {...prev.tempAbove, value: parseInt(e.target.value)}
              }))}
              className={`w-16 px-2 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            />
            <span>°C</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
      
      <SuccessModal 
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        theme={theme}
      />
    </div>
  );
};

export default AlertSettings;