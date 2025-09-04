import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import WeatherIndicators from './WeatherIndicators';
import WeatherIcons from './WeatherIcons';
import SunIcons from './SunIcons';

// Composant pour l'affichage des prévisions horaires
const HourlyForecast = ({ forecast, unit }) => {
  if (!forecast || !forecast.hourly) return null;

  // Préparer les données pour les 24 prochaines heures
  const hourlyData = useMemo(() => {
    return forecast.hourly.slice(0, 24).map(hour => ({
      time: new Date(hour.dt * 1000).getHours() + 'h',
      temp: Math.round(unit === 'metric' ? hour.temp : (hour.temp * 9/5) + 32),
      pop: Math.round(hour.pop * 100), // Probabilité de précipitation
    }));
  }, [forecast.hourly, unit]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Prévisions horaires</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              yAxisId="temp"
              orientation="left"
              tick={{ fill: '#3b82f6' }}
              axisLine={{ stroke: '#3b82f6' }}
              tickLine={{ stroke: '#3b82f6' }}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}°${unit === 'metric' ? 'C' : 'F'}`}
            />
            <YAxis 
              yAxisId="pop"
              orientation="right"
              tick={{ fill: '#8b5cf6' }}
              axisLine={{ stroke: '#8b5cf6' }}
              tickLine={{ stroke: '#8b5cf6' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value, name) => 
                name === 'Température' 
                  ? [`${value}°${unit === 'metric' ? 'C' : 'F'}`, 'Température']
                  : [`${value}%`, 'Précipitations']
              }
              labelFormatter={(label) => `Heure: ${label}`}
            />
            <Area 
              yAxisId="temp"
              type="monotone" 
              dataKey="temp" 
              name="Température"
              stroke="#3b82f6"
              fillOpacity={1} 
              fill="url(#tempGradient)"
            />
            <Line 
              yAxisId="pop"
              type="monotone" 
              dataKey="pop" 
              name="Précipitations"
              stroke="#8b5cf6"
              dot={false}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const WeatherCard = ({ weather, unit, onRefresh, forecast }) => {
  // Animation de chargement
  if (!weather || !weather.main) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <p>Chargement des données météo...</p>
      </motion.div>
    );
  }

  // Formatage de la date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur de fond en fonction de la température
  const getTempColor = (temp) => {
    if (temp >= 30) return 'from-red-500 to-orange-400';
    if (temp >= 25) return 'from-orange-400 to-amber-400';
    if (temp >= 20) return 'from-amber-400 to-yellow-400';
    if (temp >= 15) return 'from-yellow-400 to-lime-400';
    if (temp >= 10) return 'from-lime-400 to-emerald-400';
    if (temp >= 5) return 'from-emerald-400 to-cyan-400';
    if (temp >= 0) return 'from-cyan-400 to-blue-400';
    return 'from-blue-400 to-indigo-400';
  };

  const { main, weather: [weatherInfo], wind, clouds, sys, name, dt } = weather;
  const tempColor = getTempColor(main.temp);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${name}-${dt}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* En-tête avec ville et date */}
        <div className={`bg-gradient-to-r ${tempColor} p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {name}, {sys?.country}
              </h2>
              <p className="opacity-90">{formatDate(dt)}</p>
              <p className="text-lg mt-2 capitalize flex items-center">
                <span className="mr-2">
                  <WeatherIcons icon={weatherInfo.icon} size={24} />
                </span>
                {weatherInfo.description}
              </p>
            </div>
            <motion.button 
              onClick={onRefresh}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
              aria-label="Rafraîchir"
            >
              <SunIcons type="refresh" size={20} className="text-white" />
            </motion.button>
          </div>

          {/* Température principale */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-6xl font-bold">
              {Math.round(main.temp)}°
              <span className="text-2xl opacity-90">{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="text-right">
              <p className="text-lg">
                <span className="opacity-90">Ressenti:</span> {Math.round(main.feels_like)}°
              </p>
              <p className="text-lg">
                <span className="opacity-90">Min:</span> {Math.round(main.temp_min)}° / 
                <span className="opacity-90"> Max:</span> {Math.round(main.temp_max)}°
              </p>
            </div>
          </div>
        </div>

        {/* Indicateurs météo */}
        <WeatherIndicators weather={weather} unit={unit} />

        {/* Graphique des prévisions horaires */}
        <div className="p-4">
          <HourlyForecast forecast={forecast} unit={unit} />
        </div>

        {/* Lever et coucher du soleil */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-around items-center">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center text-blue-500">
                <SunIcons type="sunrise" size={32} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Lever</p>
              <p className="font-medium">
                {new Date(sys.sunrise * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center text-orange-500">
                <SunIcons type="sunset" size={32} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Coucher</p>
              <p className="font-medium">
                {new Date(sys.sunset * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center text-yellow-500">
                <SunIcons type="duration" size={32} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Durée du jour</p>
              <p className="font-medium">
                {Math.floor((sys.sunset - sys.sunrise) / 3600)}h 
                {Math.floor(((sys.sunset - sys.sunrise) % 3600) / 60).toString().padStart(2, '0')}min
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeatherCard;
