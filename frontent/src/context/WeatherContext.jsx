// src/context/WeatherContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [recentSearches, setRecentSearches] = useState([]);

  const getWeather = async (city) => {
    console.log('Recherche de la ville:', city);
    
    if (!city || typeof city !== 'string') {
      const errorMsg = 'Veuillez entrer un nom de ville valide';
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Appel API vers le backend...');
      const response = await axios.get(
        `http://localhost:5000/api/weather/${encodeURIComponent(city)}`,
        { 
          headers: {
            // 'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Réponse du backend:', response);
      
      if (!response.data) {
        throw new Error('Aucune donnée reçue du serveur');
      }
      
      console.log('Données météo reçues:', response.data);
      setWeather(response.data);
      addToRecentSearches(city);
      localStorage.setItem('lastCity', city);
      return response.data;
      
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Erreur lors de la récupération des données météo';
      
      console.error('Message d\'erreur à afficher:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentSearches = (city) => {
    if (!city) return;
    
    setRecentSearches(prev => {
      const updated = [city, ...prev.filter(c => c !== city)].slice(0, 5);
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des recherches récentes:', e);
      }
      return updated;
    });
  };

  useEffect(() => {
    // Charger les recherches récentes
    const loadData = async () => {
      try {
        const savedSearches = localStorage.getItem('recentSearches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
        
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
          await getWeather(lastCity);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données locales:', e);
      }
    };

    loadData();
  }, []); // Le tableau de dépendances vide signifie que ce code ne s'exécute qu'une seule fois au montage

  return (
    <WeatherContext.Provider 
      value={{ 
        weather, 
        loading, 
        error, 
        unit, 
        setUnit,
        recentSearches,
        getWeather 
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};