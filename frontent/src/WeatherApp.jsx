// src/WeatherApp.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from './context/WeatherContext';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';

// Composant Skeleton pour le chargement
const WeatherCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

const ForecastSkeleton = () => (
  <div className="mt-8">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto my-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
    recentSearches,
    unit,
    setUnit
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

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const isLoading = loading?.weather || loading?.forecast;
  const isLoadingWeather = loading?.weather ?? false;
  const isLoadingForecast = loading?.forecast ?? false;
  const currentUnit = unit === 'metric' ? 'Celsius' : 'Fahrenheit';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 transition-colors duration-300"
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
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 overflow-hidden"
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
            <div className="mt-2 md:mt-0">
              <button
                type="button"
                onClick={toggleUnit}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'metric' 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
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
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400"
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
              className="mt-6 pt-6 border-t border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recherches récentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-1.5"
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
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
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
              <WeatherCardSkeleton />
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
              <WeatherCard weather={weather} unit={unit} />
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
              <ForecastSkeleton />
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4" tabIndex="0">Prévisions sur 5 jours</h2>
              <Forecast forecast={forecast} unit={unit} />
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeatherApp;