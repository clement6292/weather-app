import React from 'react';
import { motion } from 'framer-motion';
import WeatherIcons from './WeatherIcons';
import AlertIcons from './AlertIcons';

const CompactWeatherCard = ({ favorite, unit, theme, onRemove, onClick }) => {
  const { weather, error, lastUpdate, name } = favorite;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl p-4 border-2 border-dashed ${
          theme === 'dark' 
            ? 'border-red-600 bg-red-900/20 text-red-300' 
            : 'border-red-300 bg-red-50 text-red-700'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          <button
            onClick={() => onRemove(favorite.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs">{error}</p>
      </motion.div>
    );
  }

  if (!weather) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl p-4 animate-pulse ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`h-4 w-20 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
          <div className={`h-4 w-4 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        </div>
        <div className={`h-8 w-16 rounded mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        <div className={`h-3 w-24 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
      </motion.div>
    );
  }

  const temp = Math.round(unit === 'metric' ? weather.main.temp : (weather.main.temp * 9/5) + 32);
  const criticalAlerts = weather.alerts?.filter(alert => alert.severity === 'critical').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`rounded-xl p-4 cursor-pointer transition-all duration-200 relative ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
          : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Badge d'alertes critiques */}
      {criticalAlerts > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {criticalAlerts}
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm truncate ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {name}
          </h3>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {weather.sys?.country}
          </p>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(favorite.id);
          }}
          className={`p-1 rounded hover:bg-opacity-20 ${
            theme === 'dark' ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <WeatherIcons icon={weather.weather[0]?.icon} size={32} />
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {temp}°{unit === 'metric' ? 'C' : 'F'}
            </div>
          </div>
        </div>
      </div>

      <div className={`text-xs capitalize mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {weather.weather[0]?.description}
      </div>

      {/* Alertes */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="flex items-center space-x-1 mb-2">
          <AlertIcons type={weather.alerts[0].icon} className="w-3 h-3 text-orange-500" />
          <span className={`text-xs ${
            theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
          }`}>
            {weather.alerts.length} alerte{weather.alerts.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Infos supplémentaires */}
      <div className={`text-xs space-y-1 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div className="flex justify-between">
          <span>Ressenti</span>
          <span>{Math.round(weather.main.feels_like)}°</span>
        </div>
        <div className="flex justify-between">
          <span>Humidité</span>
          <span>{weather.main.humidity}%</span>
        </div>
      </div>

      {/* Dernière mise à jour */}
      {lastUpdate && (
        <div className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Mis à jour {new Date(lastUpdate).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CompactWeatherCard;