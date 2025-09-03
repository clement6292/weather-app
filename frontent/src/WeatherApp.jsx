// src/components/WeatherApp.jsx
import { useState, useEffect } from 'react';
import { useWeather } from './context/WeatherContext';
import WeatherCard from './components/WeatherCard';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const { weather, loading, error, getWeather, recentSearches } = useWeather();


  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      getWeather(city);
    }
  };

  const handleRecentSearch = (recentCity) => {
    setCity(recentCity);
    getWeather(recentCity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Application Météo
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Entrez une ville..."
              className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Rechercher'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Recherches récentes:</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recentCity, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(recentCity)}
                  className="px-3 py-1 bg-white rounded-full text-sm text-blue-600 hover:bg-blue-50 border border-blue-200"
                >
                  {recentCity}
                </button>
              ))}
            </div>
          </div>
        )}

        {weather ? (
          <WeatherCard
            weather={weather}
            unit="metric"
            onRefresh={() => getWeather(city)}
          />
        ) : !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            <p>Entrez le nom d'une ville pour voir la météo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;