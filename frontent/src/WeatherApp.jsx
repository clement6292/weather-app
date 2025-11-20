// src/WeatherApp.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from './context/WeatherContext';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';

// Composant Skeleton pour le chargement
const WeatherCardSkeleton = ({ theme }) => (
  <div className={`rounded-xl shadow-md p-6 animate-pulse ${
    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
  }`}>
    <div className={`h-6 rounded w-3/4 mb-4 ${
      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}></div>
    <div className={`h-8 rounded w-1/2 mb-6 ${
      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}></div>
    <div className={`h-4 rounded w-5/6 mb-2 ${
      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}></div>
    <div className={`h-4 rounded w-2/3 ${
      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}></div>
  </div>
);

const ForecastSkeleton = ({ theme }) => (
  <div className="mt-8">
    <div className={`h-6 rounded w-1/3 mb-4 ${
      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
    }`}></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`rounded-xl shadow-md p-4 animate-pulse ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        }`}>
          <div className={`h-5 rounded w-3/4 mb-3 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
          <div className={`h-12 rounded-full w-12 mx-auto my-4 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
          <div className={`h-4 rounded w-full mb-2 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
          <div className={`h-4 rounded w-5/6 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
        </div>
      ))}
    </div>
  </div>
);

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const {
    weather,
    forecast,
    loading,
    error,
    getWeather,
    getCurrentLocation,
    recentSearches,
    unit,
    setUnit,
    theme,
    toggleTheme
  } = useWeather();

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

  const handleGeolocation = async () => {
    try {
      await getCurrentLocation();
      setCity(''); // Clear search input
    } catch (error) {
      // Error is already handled in context
      console.error('Erreur géolocalisation:', error);
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const isLoading = loading?.weather || loading?.forecast;
  const isLoadingWeather = loading?.weather ?? false;
  const isLoadingForecast = loading?.forecast ?? false;
  const currentUnit = unit === 'metric' ? 'Celsius' : 'Fahrenheit';

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
          : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900'
      }`}
      role="main"
      aria-label="Application météo"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-center text-blue-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          tabIndex="0"
        >
          Application Météo
        </motion.h1>

        <motion.div
          className={`rounded-2xl shadow-xl p-6 mb-8 overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Météo en temps réel
              </span>
            </h2>
            <div className="mt-2 md:mt-0 flex gap-3">
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isLoading
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-green-800 text-green-200 hover:bg-green-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                }`}
                aria-label="Utiliser ma position actuelle pour la météo"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Ma position</span>
                <span className="sm:hidden">GPS</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
                aria-label={`Changer de thème. Actuellement en mode ${theme === 'dark' ? 'sombre' : 'clair'}`}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
              </button>
              <button
                type="button"
                onClick={toggleUnit}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'metric'
                    ? theme === 'dark'
                      ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : theme === 'dark'
                      ? 'bg-amber-800 text-amber-200 hover:bg-amber-700'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
                aria-label={`Changer d'unité de température. Actuellement en degrés ${currentUnit}`}
                aria-pressed={unit === 'metric'}
                disabled={isLoading}
              >
                <span className="text-lg font-semibold">°{unit === 'metric' ? 'C' : 'F'}</span>
                <span className="ml-2 text-sm hidden sm:inline">{unit === 'metric' ? 'Celsius' : 'Fahrenheit'}</span>
              </button>
            </div>
          </div>
          
          <form
            onSubmit={handleSubmit}
            className="w-full"
            role="search"
            aria-label="Recherche de ville"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="city-search"
                  type="search"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Rechercher une ville..."
                  className={`block w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600'
                      : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400'
                  }`}
                  aria-required="true"
                  aria-busy={isLoading}
                  disabled={isLoading}
                  aria-describedby="search-help"
                  autoComplete="off"
                />
                {city && (
                  <button
                    type="button"
                    onClick={() => setCity('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Effacer la recherche"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !city.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading || !city.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                aria-label={isLoading ? 'Chargement en cours' : `Rechercher la météo pour ${city || 'cette ville'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Recherche en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Rechercher</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <motion.div
              className={`mt-6 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-100'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className={`text-sm font-medium mb-3 flex items-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <svg className={`h-4 w-4 mr-2 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recherches récentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className={`px-4 py-2 text-sm border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-1.5 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`Voir la météo pour ${search}`}
                  >
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              className={`border-l-4 p-4 mb-6 rounded ${
                theme === 'dark'
                  ? 'bg-red-900 border-red-600 text-red-200'
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-medium">Erreur :</p>
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoadingWeather ? (
            <motion.div
              key="weather-loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              aria-busy="true"
              aria-live="polite"
              aria-label="Chargement des données météo en cours"
            >
              <WeatherCardSkeleton theme={theme} />
            </motion.div>
          ) : weather ? (
            <motion.section
              key="weather-loaded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Météo actuelle pour ${weather.name}`}
            >
              <WeatherCard weather={weather} unit={unit} theme={theme} />
            </motion.section>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoadingForecast ? (
            <motion.div
              key="forecast-loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              aria-busy="true"
              aria-live="polite"
              aria-label="Chargement des prévisions en cours"
            >
              <ForecastSkeleton theme={theme} />
            </motion.div>
          ) : forecast ? (
            <motion.section
              key="forecast-loaded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              aria-live="polite"
              aria-atomic="true"
              aria-label="Prévisions météorologiques"
            >
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`} tabIndex="0">Prévisions sur 5 jours</h2>
              <Forecast forecast={forecast} unit={unit} theme={theme} />
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeatherApp;