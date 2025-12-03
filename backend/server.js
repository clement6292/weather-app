import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
import { AlertService } from "./services/alertService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const cache = new NodeCache({ stdTTL: 600 }); // Cache de 10 minutes

// Configuration CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Origine non autorisée par CORS';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware CORS
app.use(cors(corsOptions));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Très permissif pour le développement
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute seulement
  max: 1000, // Beaucoup plus de requêtes
  message: { error: "Limite temporaire atteinte, réessayez dans 30 secondes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip complètement en développement local
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    if (isLocalhost) return true;
    
    // Skip pour cache et radar
    const cacheKey = req.path.includes('/weather/') ? `weather_${req.params.city}` : 
                     req.path.includes('/forecast/') ? `forecast_${req.params.city}` : null;
    return (cacheKey && cache.has(cacheKey)) || req.path.includes('/radar/');
  }
});

// Appliquer le rate limiting seulement en production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
} else {
  console.log('Rate limiting désactivé en mode développement');
}

// Validation des entrées
const validateCity = (city) => {
  if (!city || typeof city !== 'string' || city.trim() === '') {
    console.log('Ville invalide (vide ou pas une chaîne)');
    return false;
  }

  const isValid = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/.test(city);
  if (!isValid) {
    console.log(`Ville invalide (caractères non autorisés): ${city}`);
  }
  return isValid;
};

// Middleware pour gérer les erreurs
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    error: 'Une erreur est survenue sur le serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API fonctionnelle' });
});

// Route météo par coordonnées (géolocalisation)
app.get('/api/weather/coords', async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      error: "Coordonnées requises (lat, lon)"
    });
  }

  console.log('Requête météo coordonnées:', lat, lon);

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum) ||
      latNum < -90 || latNum > 90 ||
      lonNum < -180 || lonNum > 180) {
    return res.status(400).json({
      error: "Coordonnées invalides"
    });
  }

  const cacheKey = `weather_coords_${latNum}_${lonNum}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&units=metric&appid=${process.env.OPENWEATHER_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Aucune donnée reçue de l\'API OpenWeather');
    }

    cache.set(cacheKey, response.data);

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.json(response.data);

  } catch (error) {
    console.error('Erreur API OpenWeather:', error);

    let status = 500;
    let message = 'Erreur lors de la récupération des données météo';

    if (error.response) {
      status = error.response.status;
      if (status === 404) message = 'Ville non trouvée';
      else if (status === 401) message = 'Clé API invalide';
      else if (status === 429) message = 'Limite de requêtes API atteinte';
      else if (status === 400) message = 'Requête invalide';
    } else if (error.request) {
      message = 'Le serveur météo ne répond pas';
      status = 504;
    }

    res.status(status).json({ error: message });
  }
});

// Route pour récupérer plusieurs villes en une fois (DOIT être avant /api/weather/:city)
app.get('/api/weather/multiple', async (req, res) => {
  const { cities, customAlerts } = req.query;
  
  if (!cities) {
    return res.status(400).json({ error: 'Paramètre cities requis' });
  }

  const cityList = cities.split(',').map(city => city.trim()).filter(Boolean);
  
  if (cityList.length === 0 || cityList.length > 8) {
    return res.status(400).json({ error: 'Entre 1 et 8 villes maximum' });
  }

  const results = {
    success: [],
    errors: [],
    data: {},
    timestamp: Date.now()
  };

  let parsedCustomAlerts = null;
  if (customAlerts) {
    try {
      parsedCustomAlerts = JSON.parse(decodeURIComponent(customAlerts));
    } catch (e) {
      console.error('Erreur parsing alertes personnalisées:', e);
    }
  }

  // Traiter chaque ville en parallèle
  await Promise.allSettled(
    cityList.map(async (city) => {
      try {
        if (!validateCity(city)) {
          throw new Error('Nom de ville invalide');
        }

        const cacheKey = `weather_${city.toLowerCase()}`;
        let weatherData = cache.get(cacheKey);

        if (!weatherData) {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_KEY}`,
            { timeout: 8000 }
          );
          
          if (response.data) {
            const alerts = AlertService.detectAlerts(response.data, AlertService.DEFAULT_THRESHOLDS, parsedCustomAlerts);
            weatherData = { ...response.data, alerts };
            cache.set(cacheKey, weatherData);
          }
        }

        if (weatherData) {
          results.success.push(city);
          results.data[city.toLowerCase()] = weatherData;
        }
      } catch (error) {
        console.error(`Erreur pour ${city}:`, error.message);
        results.errors.push({
          city,
          error: error.response?.status === 404 ? 'Ville non trouvée' : 'Erreur de récupération'
        });
      }
    })
  );

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.json(results);
});

// Route météo actuelle par ville
app.get('/api/weather/:city', async (req, res, next) => {
  const city = req.params.city.trim();
  const customAlerts = req.query.customAlerts ? JSON.parse(decodeURIComponent(req.query.customAlerts)) : null;

  if (!validateCity(city)) {
    return res.status(400).json({
      error: "Nom de ville invalide. Utilisez uniquement des lettres, des espaces, des tirets et des apostrophes."
    });
  }

  const cacheKey = `weather_${city}_${customAlerts ? JSON.stringify(customAlerts) : 'default'}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Aucune donnée reçue de l\'API OpenWeather');
    }

    // Ajouter les alertes avec alertes personnalisées
    const alerts = AlertService.detectAlerts(response.data, AlertService.DEFAULT_THRESHOLDS, customAlerts);
    const weatherWithAlerts = {
      ...response.data,
      alerts
    };

    cache.set(cacheKey, weatherWithAlerts);

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.json(weatherWithAlerts);

  } catch (error) {
    console.error('Erreur API OpenWeather:', error);

    let status = 500;
    let message = 'Erreur lors de la récupération des données météo';

    if (error.response) {
      status = error.response.status;
      if (status === 404) message = 'Ville non trouvée';
      else if (status === 401) message = 'Clé API invalide';
      else if (status === 429) message = 'Limite de requêtes API atteinte';
      else if (status === 400) message = 'Requête invalide';
    } else if (error.request) {
      message = 'Le serveur météo ne répond pas';
      status = 504;
    }

    res.status(status).json({ error: message });
  }
});

// Route pour les prévisions météo sur 5 jours
app.get('/api/forecast/:city', async (req, res) => {
  const city = req.params.city.trim();
  // console.log('Prévisions demandées pour la ville:', city);

  const cacheKey = `forecast_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    // console.log('Prévisions récupérées du cache pour', city);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.json(cachedData);
  }

  try {
    if (!city || typeof city !== 'string' || city.length < 2) {
      return res.status(400).json({ error: 'Nom de ville invalide' });
    }

    // console.log('Appel API OpenWeather pour', city);
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city,
        units: 'metric',
        appid: process.env.OPENWEATHER_KEY,
        lang: 'fr',
        cnt: 40
      },
      timeout: 10000
    });

    if (!response.data || !Array.isArray(response.data.list)) {
      throw new Error('Format de réponse inattendu de l\'API');
    }

    const forecastsByDay = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!forecastsByDay[date]) forecastsByDay[date] = [];
      forecastsByDay[date].push(item);
    });

    const dailyForecasts = Object.values(forecastsByDay)
      .map(dayForecasts => {
        return dayForecasts.reduce((prev, curr) => {
          const prevHour = new Date(prev.dt * 1000).getHours();
          const currHour = new Date(curr.dt * 1000).getHours();
          return (Math.abs(currHour - 12) < Math.abs(prevHour - 12)) ? curr : prev;
        });
      })
      .slice(0, 5);

    const forecastData = {
      city: response.data.city,
      forecasts: dailyForecasts.map(item => ({
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        temp: Math.round(item.main.temp),
        temp_min: Math.round(item.main.temp_min),
        temp_max: Math.round(item.main.temp_max),
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }))
    };

    cache.set(cacheKey, forecastData, 10800);

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'public, max-age=10800');

    console.log(`Prévisions envoyées pour ${city} (${dailyForecasts.length} jours)`);
    res.json(forecastData);

  } catch (error) {
    console.error('Erreur API OpenWeather Forecast:', error.message);
    let status = 500;
    let message = 'Erreur lors de la récupération des prévisions';
    let details = null;

    if (error.response) {
      status = error.response.status;
      if (status === 404) message = 'Ville non trouvée';
      else if (status === 401) {
        message = 'Clé API OpenWeather invalide';
        details = 'Vérifiez votre clé API dans le fichier .env';
        console.error('Clé API OpenWeather invalide !');
      }
      else if (status === 429) message = 'Limite de requêtes API atteinte';
      else if (status === 400) details = error.response.data?.message;
    } else if (error.request) {
      message = 'Le serveur météo ne répond pas';
      status = 504;
    } else {
      details = error.message;
    }

    const errorResponse = { error: message };
    if (details) errorResponse.details = details;
    res.status(status).json(errorResponse);
  }
});





// Route pour les tuiles radar météo
app.get('/api/radar/:layer/:z/:x/:y', async (req, res) => {
  const { layer, z, x, y } = req.params;
  
  const validLayers = ['precipitation_new', 'clouds_new', 'temp_new', 'wind_new'];
  if (!validLayers.includes(layer)) {
    return res.status(400).json({ error: 'Couche non valide' });
  }
  
  try {
    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${process.env.OPENWEATHER_KEY}`;
    
    const response = await axios.get(tileUrl, {
      responseType: 'stream',
      timeout: 5000
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600'); // Cache 10 minutes
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Erreur tuile radar:', error.message);
    res.status(404).send('Tuile non trouvée');
  }
});

// Route de vérification de l'API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
});

// Gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Environnement:', process.env.NODE_ENV || 'development');
  // console.log('Origines autorisées:', allowedOrigins);
});

// Gestion correcte des arrêts
process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

export default app;
