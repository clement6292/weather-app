// server.js - Amélioration de la sécurité
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";

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
    // Autoriser les requêtes sans origine (comme les apps mobiles ou Postman)
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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Validation des entrées
const validateCity = (city) => {
  // Vérifie que la ville n'est pas vide et est une chaîne de caractères
  if (!city || typeof city !== 'string' || city.trim() === '') {
    console.log('Ville invalide (vide ou pas une chaîne)');
    return false;
  }
  
  // Autorise les lettres, espaces, tirets, apostrophes et caractères accentués
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
  });};

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API fonctionnelle' });
});

// Route météo améliorée
app.get('/api/weather/:city', async (req, res, next) => {
  const city = req.params.city.trim();
  console.log('Ville reçue:', city);
  
  if (!validateCity(city)) {
    console.log('Validation échouée pour la ville:', city);
    return res.status(400).json({ 
      error: "Nom de ville invalide. Utilisez uniquement des lettres, des espaces, des tirets et des apostrophes." 
    });
  }

  // Vérifier le cache
  const cacheKey = `weather_${city}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Données récupérées du cache pour', city);
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
    
    // Mettre en cache la réponse
    cache.set(cacheKey, response.data);
    
    // Réponse avec en-têtes CORS explicites
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
  console.log('Origines autorisées:', allowedOrigins);
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