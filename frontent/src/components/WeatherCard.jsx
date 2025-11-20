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
      <h3 className={`text-lg font-semibold mb-3 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      }`}>Prévisions horaires</h3>
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

const WeatherCard = ({ weather, unit, onRefresh, forecast, theme = 'light' }) => {
  // Animation de chargement
  if (!weather || !weather.main) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl shadow-lg p-6 text-center ${
          theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'
        }`}
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

  // Obtenir la couleur de fond en fonction de la température et des conditions météo
  const getWeatherBackground = (temp, weatherMain) => {
    const baseColors = {
      Clear: temp >= 25 ? 'from-yellow-400 via-orange-400 to-red-500' :
              temp >= 15 ? 'from-blue-300 via-cyan-400 to-blue-500' :
              'from-blue-400 via-indigo-500 to-purple-600',
      Clouds: 'from-gray-400 via-gray-500 to-gray-600',
      Rain: 'from-blue-600 via-blue-700 to-indigo-800',
      Snow: 'from-blue-100 via-gray-200 to-blue-200',
      Thunderstorm: 'from-gray-700 via-purple-800 to-black',
      Drizzle: 'from-blue-400 via-blue-500 to-blue-600',
      Mist: 'from-gray-300 via-gray-400 to-gray-500'
    };

    return baseColors[weatherMain] || baseColors.Clear;
  };

  const { main, weather: [weatherInfo], wind, clouds, sys, name, dt } = weather;
  const backgroundGradient = getWeatherBackground(main.temp, weatherInfo.main);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${name}-${dt}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={`rounded-xl shadow-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* En-tête avec ville et date */}
        <div className={`bg-gradient-to-r ${backgroundGradient} p-6 text-white relative overflow-hidden`}>
          {/* Animated weather effects */}
          {weatherInfo.main === 'Rain' && (
            <div className="absolute inset-0 opacity-30">
              <div className="rain-animation">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-4 bg-white rounded-full animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: '0.5s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {weatherInfo.main === 'Snow' && (
            <div className="absolute inset-0 opacity-40">
              <div className="snow-animation">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: '3s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {weatherInfo.main === 'Clear' && main.temp >= 20 && (
            <div className="absolute top-2 right-2 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white rounded-full border-t-transparent"
              />
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {name}, {sys?.country}
              </h2>
              <p className="opacity-90">{formatDate(dt)}</p>
              <p className="text-lg mt-2 capitalize flex items-center">
                <span className="mr-2">
                  <WeatherIcons icon={weatherInfo.icon} size={24} animated={true} />
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
        <WeatherIndicators weather={weather} unit={unit} theme={theme} />

        {/* Graphique des prévisions horaires */}
        <div className="p-4">
          <HourlyForecast forecast={forecast} unit={unit} />
        </div>

        {/* Lever et coucher du soleil */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-100'
        }`}>
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
