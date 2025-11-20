// src/context/WeatherContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Constantes pour le cache et la configuration
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes en millisecondes
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 seconde

// Schéma de validation des données météo
const weatherSchema = {
  name: 'string',
  main: {
    temp: 'number',
    humidity: 'number',
    pressure: 'number',
    temp_min: 'number',
    temp_max: 'number',
  },
  weather: [{
    id: 'number',
    main: 'string',
    description: 'string',
    icon: 'string',
  }],
  wind: {
    speed: 'number',
    deg: 'number',
  },
  dt: 'number',
  timezone: 'number',
};

// Schéma de validation des prévisions
const forecastSchema = {
  city: {
    id: 'number',
    name: 'string',
    coord: {
      lat: 'number',
      lon: 'number'
    },
    country: 'string',
    population: 'number',
    timezone: 'number',
    sunrise: 'number',
    sunset: 'number'
  },
  forecasts: [{
    date: 'string',
    temp: 'number',
    temp_min: 'number',
    temp_max: 'number',
    humidity: 'number',
    description: 'string',
    icon: 'string'
  }]
};

// Fonction utilitaire pour valider les données par rapport à un schéma
const validateData = (data, schema) => {
  if (!data) return false;
  
  // Vérifier que data est un objet
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }
  
  // Vérifier toutes les propriétés requises
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const type = schema[key];
      
      // Vérifier que la propriété existe
      if (!(key in data)) {
        return false;
      }
      
      // Si c'est un objet imbriqué, valider récursivement
      if (typeof type === 'object' && type !== null && !Array.isArray(type)) {
        if (!validateData(data[key], type)) {
          return false;
        }
      } 
      // Si c'est un tableau, vérifier qu'il est non vide et que chaque élément est valide
      else if (Array.isArray(type)) {
        if (!Array.isArray(data[key])) {
          return false;
        }
        
        // Valider chaque élément du tableau selon le schéma fourni
        const itemSchema = type[0];
        for (const item of data[key]) {
          if (!validateData(item, itemSchema)) {
            return false;
          }
        }
      } 
      // Vérification de type simple
      else if (typeof data[key] !== type) {
        return false;
      }
    }
  }
  
  return true;
};

// Fonction pour gérer les requêtes avec réessai
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url,
      ...options,
      timeout: 10000, // 10 secondes de timeout
    });
    return response;
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Attendre avant de réessayer
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return fetchWithRetry(url, options, retries - 1);
  }
};

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState({
    weather: false,
    forecast: false
  });
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [recentSearches, setRecentSearches] = useState([]);
  const [cache, setCache] = useState({});

  // Charger les données mises en cache et les recherches récentes au démarrage
  useEffect(() => {
    try {
      // Charger le cache
      const savedCache = localStorage.getItem('weatherCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        // Nettoyer le cache des entrées expirées
        const now = Date.now();
        const validCache = {};
        
        for (const [key, { data, timestamp }] of Object.entries(parsedCache)) {
          if (now - timestamp < CACHE_EXPIRATION) {
            validCache[key] = { data, timestamp };
          }
        }
        
        setCache(validCache);
        
        // Restaurer les données de la dernière ville si elles sont encore valides
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity && validCache[`weather_${lastCity}`] && validCache[`forecast_${lastCity}`]) {
          setWeather(validCache[`weather_${lastCity}`].data);
          setForecast(validCache[`forecast_${lastCity}`].data);
        }
      }
      
      // Charger les recherches récentes
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }

      // Charger le thème
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      } else {
        // Détecter la préférence système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.error('Erreur lors du chargement du cache ou des recherches récentes:', e);
    }
  }, []);

  // Mettre à jour le localStorage lorsque le cache change
  useEffect(() => {
    try {
      localStorage.setItem('weatherCache', JSON.stringify(cache));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du cache:', e);
    }
  }, [cache]);

  // Fonction pour ajouter des données au cache
  const addToCache = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Fonction pour récupérer des données du cache
  const getFromCache = useCallback((key) => {
    const cached = cache[key];
    if (!cached) return null;
    
    // Vérifier si le cache est expiré
    if (Date.now() - cached.timestamp > CACHE_EXPIRATION) {
      // Nettoyer l'entrée expirée
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      return null;
    }
    
    return cached.data;
  }, [cache]);

  // Fonction pour ajouter une ville aux recherches récentes
  const addToRecentSearches = useCallback((city) => {
    if (!city || typeof city !== 'string') return;

    setRecentSearches(prev => {
      const updated = [
        city,
        ...prev.filter(item => item.toLowerCase() !== city.toLowerCase())
      ].slice(0, 5);

      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des recherches récentes:', e);
      }

      return updated;
    });
  }, []);

  // Fonction pour changer de thème
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', newTheme);
        // Appliquer la classe au document
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      } catch (e) {
        console.error('Erreur lors de la sauvegarde du thème:', e);
      }
      return newTheme;
    });
  }, []);

  // Fonction pour récupérer la météo actuelle
  const getWeather = useCallback(async (city) => {
    if (!city || typeof city !== 'string') {
      const errorMsg = 'Veuillez entrer un nom de ville valide';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    const cacheKey = `weather_${city.toLowerCase()}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      setWeather(cachedData);
      return cachedData;
    }
    
    setLoading(prev => ({ ...prev, weather: true }));
    setError(null);
    
    try {
      const response = await fetchWithRetry(
        `http://localhost:5000/api/weather/${encodeURIComponent(city)}`
        // `https://back-weather.onrender.com/api/weather/${encodeURIComponent(city)}`
      );
      
      if (!response.data) {
        throw new Error('Aucune donnée météo reçue du serveur');
      }
      
      // Valider les données reçues
      if (!validateData(response.data, weatherSchema)) {
        throw new Error('Données météo invalides reçues du serveur');
      }
      
      // Mettre à jour le state et le cache
      setWeather(response.data);
      addToCache(cacheKey, response.data);
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
      
      let errorMessage = 'Erreur lors de la récupération des données météo';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'La requête a expiré. Vérifiez votre connexion internet.';
      } else if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Ville non trouvée';
        } else if (error.response.status === 401) {
          errorMessage = 'Erreur d\'authentification avec le service météo';
        } else if (error.response.status === 429) {
          errorMessage = 'Trop de requêtes, veuillez réessayer plus tard';
        } else if (error.response.status >= 500) {
          errorMessage = 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, weather: false }));
    }
  }, [addToCache, getFromCache]);

  // Fonction pour récupérer les prévisions
  const getForecast = useCallback(async (city) => {
    if (!city || typeof city !== 'string') {
      return null;
    }
    
    const cacheKey = `forecast_${city.toLowerCase()}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      setForecast(cachedData);
      return cachedData;
    }
    
    setLoading(prev => ({ ...prev, forecast: true }));
    
    try {
      const response = await fetchWithRetry(
        `http://localhost:5000/api/forecast/${encodeURIComponent(city)}`
        // `https://back-weather.onrender.com/api/forecast/${encodeURIComponent(city)}`
      );
      
      if (!response.data) {
        throw new Error('Aucune donnée de prévision reçue du serveur');
      }
      
      // Valider les données reçues
      if (!validateData(response.data, forecastSchema)) {
        throw new Error('Données de prévision invalides reçues du serveur');
      }
      
      // Mettre à jour le state et le cache
      setForecast(response.data);
      addToCache(cacheKey, response.data);
      
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des prévisions:', error);
      // Ne pas afficher d'erreur pour les prévisions pour ne pas perturber l'utilisateur
      return null;
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  }, [addToCache, getFromCache]);

  // Fonction de géolocalisation
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'La géolocalisation n\'est pas supportée par ce navigateur';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(prev => ({ ...prev, weather: true, forecast: true }));
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Utiliser l'API de géocodage inverse d'OpenWeather
      const geoResponse = await fetchWithRetry(
        `http://localhost:5000/api/weather/coords?lat=${latitude}&lon=${longitude}`
      );

      if (!geoResponse.data || !geoResponse.data.name) {
        throw new Error('Impossible de déterminer votre ville actuelle');
      }

      const cityName = geoResponse.data.name;

      // Récupérer la météo pour cette ville
      const result = await getWeatherAndForecast(cityName);
      return result;

    } catch (error) {
      console.error('Erreur de géolocalisation:', error);

      let errorMessage = 'Erreur lors de la géolocalisation';

      if (error.code === 1) {
        errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position.';
      } else if (error.code === 2) {
        errorMessage = 'Position indisponible. Vérifiez votre connexion GPS.';
      } else if (error.code === 3) {
        errorMessage = 'Timeout de géolocalisation. Veuillez réessayer.';
      } else if (error.message.includes('géolocalisation n\'est pas supportée')) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, weather: false, forecast: false }));
    }
  }, []);

  // Fonction pour récupérer à la fois la météo et les prévisions
  const getWeatherAndForecast = useCallback(async (city) => {
    if (!city || typeof city !== 'string') {
      const errorMsg = 'Veuillez entrer un nom de ville valide';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setError(null);

    try {
      // Exécuter les deux appels en parallèle
      const [weatherData, forecastData] = await Promise.all([
        getWeather(city),
        getForecast(city)
      ]);

      if (weatherData) {
        addToRecentSearches(city);
        localStorage.setItem('lastCity', city);
      }

      return { weather: weatherData, forecast: forecastData };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error; // Propage l'erreur pour permettre une gestion spécifique dans les composants
    }
  }, [getWeather, getForecast, addToRecentSearches]);

  // Charger la dernière ville recherchée au démarrage
  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
      getWeatherAndForecast(lastCity).catch(console.error);
    }
  }, [getWeatherAndForecast]);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const cleanupExpiredCache = () => {
      setCache(prev => {
        const now = Date.now();
        const updatedCache = {};

        for (const [key, { data, timestamp }] of Object.entries(prev)) {
          if (now - timestamp < CACHE_EXPIRATION) {
            updatedCache[key] = { data, timestamp };
          }
        }

        return updatedCache;
      });
    };

    const interval = setInterval(cleanupExpiredCache, CACHE_EXPIRATION);
    return () => clearInterval(interval);
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        forecast,
        loading,
        error,
        getWeather: getWeatherAndForecast,
        getCurrentLocation,
        recentSearches,
        unit,
        setUnit,
        theme,
        toggleTheme,
        clearError: () => setError(null)
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather doit être utilisé à l\'intérieur d\'un WeatherProvider');
  }
  return context;
};