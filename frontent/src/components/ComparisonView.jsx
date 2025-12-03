import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WeatherIcons from './WeatherIcons';

const ComparisonView = ({ favorites, unit, theme }) => {
  const [sortBy, setSortBy] = useState('temp'); // 'temp', 'name', 'humidity'
  
  // Filtrer les favoris avec données météo
  const validFavorites = favorites.filter(fav => fav.weather && !fav.error);
  
  // Trier les villes
  const sortedFavorites = [...validFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'temp':
        return b.weather.main.temp - a.weather.main.temp; // Plus chaud en premier
      case 'name':
        return a.name.localeCompare(b.name);
      case 'humidity':
        return b.weather.main.humidity - a.weather.main.humidity;
      default:
        return 0;
    }
  });

  if (validFavorites.length === 0) {
    return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Aucune donnée météo disponible pour la comparaison</p>
      </div>
    );
  }

  const getTemp = (weather) => Math.round(unit === 'metric' ? weather.main.temp : (weather.main.temp * 9/5) + 32);
  const getTempColor = (temp) => {
    if (temp >= 30) return 'text-red-500';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-500';
    if (temp >= 0) return 'text-blue-500';
    return 'text-cyan-500';
  };

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          Comparaison des villes
        </h2>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500`}
        >
          <option value="temp">Trier par température</option>
          <option value="name">Trier par nom</option>
          <option value="humidity">Trier par humidité</option>
        </select>
      </div>

      {/* Vue tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Ville
              </th>
              <th className={`text-center py-3 px-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Météo
              </th>
              <th className={`text-center py-3 px-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Température
              </th>
              <th className={`text-center py-3 px-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Ressenti
              </th>
              <th className={`text-center py-3 px-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Humidité
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFavorites.map((favorite, index) => {
              const temp = getTemp(favorite.weather);
              const feelsLike = Math.round(unit === 'metric' ? favorite.weather.main.feels_like : (favorite.weather.main.feels_like * 9/5) + 32);
              
              return (
                <motion.tr
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                >
                  <td className="py-4 px-2">
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {favorite.name}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {favorite.weather.sys?.country}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    <div className="flex flex-col items-center">
                      <WeatherIcons icon={favorite.weather.weather[0]?.icon} size={32} />
                      <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {favorite.weather.weather[0]?.description}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    <div className={`text-2xl font-bold ${getTempColor(temp)}`}>
                      {temp}°{unit === 'metric' ? 'C' : 'F'}
                    </div>
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feelsLike}°
                    </div>
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {favorite.weather.main.humidity}%
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const temps = validFavorites.map(fav => getTemp(fav.weather));
          const maxTemp = Math.max(...temps);
          const minTemp = Math.min(...temps);
          const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
          const maxCity = validFavorites.find(fav => getTemp(fav.weather) === maxTemp)?.name;
          const minCity = validFavorites.find(fav => getTemp(fav.weather) === minTemp)?.name;
          
          return (
            <>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-red-500 text-xl font-bold">{maxTemp}°</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Plus chaud<br/>{maxCity}
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-blue-500 text-xl font-bold">{minTemp}°</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Plus froid<br/>{minCity}
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {avgTemp}°
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Moyenne
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {maxTemp - minTemp}°
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Écart
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default ComparisonView;