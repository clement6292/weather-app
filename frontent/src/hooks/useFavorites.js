import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { weatherCache } from '../utils/cache';
import { weatherRateLimiter } from '../utils/rateLimiter';

const MAX_FAVORITES = 6;
const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes (réduit la fréquence)

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const syncInProgress = useRef(false);
  const syncTimeoutRef = useRef(null);

  // Charger les favoris depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteCities');
      if (saved) {
        const loadedFavorites = JSON.parse(saved);
        // Nettoyer les noms de villes au chargement
        const cleanedFavorites = loadedFavorites.map(fav => ({
          ...fav,
          name: fav.name.trim()
        })).filter(fav => fav.name.length > 0);
        
        setFavorites(cleanedFavorites);
        
        // Sauvegarder les données nettoyées
        if (JSON.stringify(cleanedFavorites) !== JSON.stringify(loadedFavorites)) {
          localStorage.setItem('favoriteCities', JSON.stringify(cleanedFavorites));
        }
      }
    } catch (e) {
      console.error('Erreur chargement favoris:', e);
    }
  }, []);

  // Sauvegarder les favoris
  const saveFavorites = useCallback((newFavorites) => {
    try {
      localStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.error('Erreur sauvegarde favoris:', e);
    }
  }, []);

  // Ajouter une ville aux favoris
  const addFavorite = useCallback((cityName) => {
    if (!cityName || typeof cityName !== 'string') return false;
    
    const normalizedName = cityName.trim();
    
    // Vérifier les doublons
    if (favorites.some(fav => fav.name.toLowerCase() === normalizedName.toLowerCase())) {
      setError('Cette ville est déjà dans vos favoris');
      return false;
    }
    
    // Vérifier la limite
    if (favorites.length >= MAX_FAVORITES) {
      setError(`Maximum ${MAX_FAVORITES} villes autorisées`);
      return false;
    }

    const newFavorite = {
      id: `${normalizedName.toLowerCase()}_${Date.now()}`,
      name: normalizedName,
      addedAt: Date.now(),
      lastUpdate: null,
      weather: null,
      error: null
    };

    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
    setError(null);
    return true;
  }, [favorites, saveFavorites]);

  // Supprimer une ville des favoris
  const removeFavorite = useCallback((cityId) => {
    const newFavorites = favorites.filter(fav => fav.id !== cityId);
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Synchroniser toutes les villes favorites
  const syncFavorites = useCallback(async () => {
    if (favorites.length === 0 || syncInProgress.current) return;

    // Vérifier le rate limiting
    if (!weatherRateLimiter.canMakeRequest()) {
      setError(`Limite de requêtes atteinte. ${weatherRateLimiter.getRemainingRequests()} requêtes restantes.`);
      return;
    }

    // Vérifier le cache pour chaque ville
    const citiesToUpdate = favorites.filter(fav => {
      const cacheKey = `weather_${fav.name.toLowerCase()}`;
      return !weatherCache.get(cacheKey);
    });

    if (citiesToUpdate.length === 0) {
      console.log('Toutes les données sont en cache');
      return;
    }

    syncInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Récupérer les alertes personnalisées
      let customAlerts = null;
      try {
        const saved = localStorage.getItem('customAlerts');
        customAlerts = saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error('Erreur alertes personnalisées:', e);
      }

      // Construire l'URL - seulement les villes non mises en cache
      const cityNames = citiesToUpdate
        .map(fav => fav.name.trim())
        .filter(name => name.length > 0)
        .join(',');
      
      console.log('Villes à synchroniser:', cityNames);
      
      let url = `http://localhost:5000/api/weather/multiple?cities=${encodeURIComponent(cityNames)}`;
      
      if (customAlerts) {
        url += `&customAlerts=${encodeURIComponent(JSON.stringify(customAlerts))}`;
      }
      
      console.log('URL finale:', url);

      const response = await axios.get(url, { timeout: 15000 });
      const { success, errors, data } = response.data;

      // Mettre en cache les nouvelles données
      Object.entries(data).forEach(([cityKey, weatherData]) => {
        weatherCache.set(`weather_${cityKey}`, weatherData);
      });

      // Mettre à jour les favoris avec les nouvelles données
      const updatedFavorites = favorites.map(favorite => {
        const cityKey = favorite.name.toLowerCase();
        const cachedData = weatherCache.get(`weather_${cityKey}`);
        
        if (cachedData) {
          return {
            ...favorite,
            weather: cachedData,
            lastUpdate: Date.now(),
            error: null
          };
        } else if (success.includes(favorite.name) && data[cityKey]) {
          return {
            ...favorite,
            weather: data[cityKey],
            lastUpdate: Date.now(),
            error: null
          };
        } else {
          const errorInfo = errors.find(err => err.city === favorite.name);
          return {
            ...favorite,
            error: errorInfo?.error || 'Erreur inconnue',
            lastUpdate: Date.now()
          };
        }
      });

      saveFavorites(updatedFavorites);
      
    } catch (error) {
      console.error('Erreur synchronisation favoris:', error);
      setError('Erreur de synchronisation des données météo');
    } finally {
      setLoading(false);
      syncInProgress.current = false;
    }
  }, [favorites, saveFavorites]);

  // Auto-synchronisation avec debounce
  useEffect(() => {
    if (favorites.length > 0) {
      // Annuler le timeout précédent
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Délai pour éviter les appels multiples (plus long)
      syncTimeoutRef.current = setTimeout(() => {
        if (!syncInProgress.current) {
          syncFavorites();
        }
      }, 2000); // 2 secondes de délai
      
      const interval = setInterval(() => {
        if (!syncInProgress.current) {
          syncFavorites();
        }
      }, SYNC_INTERVAL);
      
      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        clearInterval(interval);
      };
    }
  }, [favorites.length]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    syncFavorites,
    maxFavorites: MAX_FAVORITES,
    canAddMore: favorites.length < MAX_FAVORITES
  };
};