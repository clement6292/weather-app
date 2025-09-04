import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WeatherIcons from './WeatherIcons';

const Forecast = ({ forecast, unit }) => {
  // Si les données sont les données de test
  if (forecast && forecast.test) {
    return (
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Mode Test Activé</h2>
        <p className="text-yellow-700">
          Données de test reçues pour la ville: <strong>{forecast.ville}</strong>
        </p>
      </div>
    );
  }

  if (!forecast || !forecast.forecasts || forecast.forecasts.length === 0) {
    return null;
  }

  // Formater la température selon l'unité
  const formatTemp = (temp) => {
    if (temp === undefined) return 'N/A';
    return unit === 'metric' 
      ? `${Math.round(temp)}°C` 
      : `${Math.round((temp * 9/5) + 32)}°F`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE d MMMM', { locale: fr });
    } catch (e) {
      console.error('Erreur de formatage de la date:', e);
      return 'Date inconnue';
    }
  };

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    return forecast.forecasts.map(day => ({
      name: formatDate(day.date).split(' ')[0],
      temp: unit === 'metric' ? Math.round(day.temp) : Math.round((day.temp * 9/5) + 32),
      temp_min: unit === 'metric' ? Math.round(day.temp_min) : Math.round((day.temp_min * 9/5) + 32),
      temp_max: unit === 'metric' ? Math.round(day.temp_max) : Math.round((day.temp_max * 9/5) + 32),
      humidity: day.humidity,
      icon: day.icon,
    }));
  }, [forecast.forecasts, unit]);

  // Couleur de fond en fonction de la température
  const getTempColor = (temp) => {
    if (temp >= 30) return 'from-red-500 to-orange-400';
    if (temp >= 20) return 'from-yellow-400 to-amber-400';
    if (temp >= 10) return 'from-green-400 to-lime-400';
    if (temp >= 0) return 'from-blue-400 to-cyan-400';
    return 'from-blue-600 to-indigo-400';
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Prévisions sur 5 jours pour {forecast.city?.name || 'cette ville'}
      </h2>
      
      {/* Graphique de tendance */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-6 sm:mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-3 sm:mb-4">Tendance des températures</h3>
        <div className="h-48 sm:h-64 md:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ 
                top: 10, 
                right: 5, 
                left: -10, 
                bottom: 0 
              }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tick={{ 
                  fill: '#4b5563',
                  fontSize: '0.75rem',
                  fontFamily: 'sans-serif'
                }}
                tickMargin={8}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tick={{ 
                  fill: '#4b5563',
                  fontSize: '0.75rem',
                  fontFamily: 'sans-serif'
                }}
                tickMargin={5}
                width={40}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `${value}°${unit === 'metric' ? 'C' : 'F'}`}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              <Tooltip 
                formatter={(value) => [`${value}°${unit === 'metric' ? 'C' : 'F'}`, 'Température']}
                labelFormatter={(label) => `Jour: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxWidth: '200px',
                  textAlign: 'center'
                }}
                itemStyle={{
                  padding: '2px 0',
                  fontSize: '0.875rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '4px',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                name="Température"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#tempGradient)"
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: '#ffffff',
                  fill: '#3b82f6',
                  style: { filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cartes de prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {forecast.forecasts.map((day, index) => {
          const avgTemp = Math.round((day.temp_max + day.temp_min) / 2);
          const gradientClass = getTempColor(avgTemp);
          
          return (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-md p-4 text-white transition-transform duration-300 hover:scale-105`}
            >
              <div className="flex flex-col h-full">
                <div className="text-lg font-medium mb-2">
                  {index === 0 ? 'Demain' : formatDate(day.date).split(' ')[0]}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center my-2">
                  <div className="w-16 h-16 mb-2">
                    <WeatherIcons icon={day.icon} size={64} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold">
                    {formatTemp(day.temp)}
                  </div>
                  <div className="text-sm opacity-90 capitalize">
                    {day.description || 'N/A'}
                  </div>
                </div>
                <div className="mt-4 text-sm bg-white/20 rounded-lg p-2">
                  <div className="flex justify-between items-center py-1">
                    <span>Max:</span>
                    <span className="font-medium">{formatTemp(day.temp_max)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Min:</span>
                    <span className="font-medium">{formatTemp(day.temp_min)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Humidité:</span>
                    <span className="font-medium">{day.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;