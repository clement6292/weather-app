import React from 'react';
import { motion } from 'framer-motion';
import IndicatorIcons from './IndicatorIcons';

const WeatherIndicators = ({ weather, unit, theme = 'light' }) => {
  if (!weather || !weather.main) return null;

  const { main, visibility, wind, clouds } = weather;
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const visibilityKm = (visibility / 1000).toFixed(1);

  const indicators = [
    {
      id: 'feelsLike',
      label: 'Ressenti',
      value: `${Math.round(main.feels_like)}°`,
      icon: 'feelsLike',
      color: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-500'
    },
    {
      id: 'humidity',
      label: 'Humidité',
      value: `${main.humidity}%`,
      icon: 'humidity',
      color: 'from-cyan-100 to-cyan-200',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'pressure',
      label: 'Pression',
      value: `${main.pressure} hPa`,
      icon: 'pressure',
      color: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'visibility',
      label: 'Visibilité',
      value: `${visibilityKm} km`,
      icon: 'visibility',
      color: 'from-gray-100 to-gray-200',
      iconColor: 'text-gray-600'
    },
    {
      id: 'wind',
      label: 'Vent',
      value: `${wind.speed} ${windUnit}`,
      icon: 'wind',
      color: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      extra: wind.gust && `Rafales: ${wind.gust} ${windUnit}`
    },
    {
      id: 'clouds',
      label: 'Nuages',
      value: `${clouds.all}%`,
      icon: 'clouds',
      color: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-400'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="p-4">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {indicators.map((indicator) => (
          <motion.div
            key={indicator.id}
            variants={item}
            className={`bg-gradient-to-br ${indicator.color} rounded-xl p-4 shadow-sm`}
            whileHover={{ 
              y: -2,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center mb-2">
              <div className={`p-2 rounded-lg bg-white/30 mr-3 ${indicator.iconColor}`}>
                <IndicatorIcons 
                  type={indicator.icon} 
                  size={20}
                  className={indicator.iconColor}
                />
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-700'
              }`}>{indicator.label}</span>
            </div>
            <div className="ml-11">
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>{indicator.value}</p>
              {indicator.extra && (
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>{indicator.extra}</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default WeatherIndicators;
