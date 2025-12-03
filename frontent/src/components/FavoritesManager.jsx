import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../hooks/useFavorites';
import CompactWeatherCard from './CompactWeatherCard';
import ComparisonView from './ComparisonView';

const FavoritesManager = ({ theme, unit, onCitySelect }) => {
  const { favorites, loading, error, addFavorite, removeFavorite, syncFavorites, canAddMore } = useFavorites();
  const [newCity, setNewCity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'comparison'

  const handleAddCity = (e) => {
    e.preventDefault();
    if (newCity.trim()) {
      const success = addFavorite(newCity.trim());
      if (success) {
        setNewCity('');
        setShowAddForm(false);
      }
    }
  };

  const handleCityClick = (favorite) => {
    if (favorite.weather && onCitySelect) {
      onCitySelect(favorite.name, favorite.weather);
    }
  };

  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Villes Favorites
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {favorites.length}/6 villes • Sync auto toutes les 10min
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={syncFavorites}
            disabled={loading || favorites.length === 0}
            className={`p-2 rounded-lg transition-colors ${
              loading || favorites.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            title="Synchroniser maintenant"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'comparison' : 'grid')}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
            title={`Basculer en vue ${viewMode === 'grid' ? 'comparative' : 'grille'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {viewMode === 'grid' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              )}
            </svg>
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={!canAddMore}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              !canAddMore
                ? theme === 'dark'
                  ? 'cursor-not-allowed bg-gray-600 text-gray-300 opacity-60'
                  : 'cursor-not-allowed bg-gray-200 text-gray-600 opacity-60'
                : theme === 'dark'
                  ? 'bg-green-800 text-green-200 hover:bg-green-700'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={canAddMore ? "Ajouter une ville" : "Limite de 6 villes atteinte"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddCity}
            className="mb-4 p-4 rounded-lg border border-dashed border-gray-300"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Nom de la ville..."
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                autoFocus
              />
              <button
                type="submit"
                disabled={!newCity.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !newCity.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✕
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-lg ${
            theme === 'dark'
              ? 'bg-red-900/50 border border-red-600 text-red-300'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {error}
        </motion.div>
      )}

      {/* Affichage des villes */}
      {favorites.length === 0 ? (
        <div className={`text-center py-8 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">Aucune ville favorite</p>
          <p className="text-xs mt-1">Cliquez sur + pour ajouter une ville</p>
        </div>
      ) : viewMode === 'comparison' ? (
        <ComparisonView 
          favorites={favorites}
          unit={unit}
          theme={theme}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {favorites.map((favorite) => (
              <CompactWeatherCard
                key={favorite.id}
                favorite={favorite}
                unit={unit}
                theme={theme}
                onRemove={removeFavorite}
                onClick={() => handleCityClick(favorite)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FavoritesManager;