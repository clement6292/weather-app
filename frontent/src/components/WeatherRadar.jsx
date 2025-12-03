import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const WeatherRadar = ({ theme, weather }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('precipitation');
  const [baseLayer, setBaseLayer] = useState('street'); // 'street' ou 'satellite'
  const [showLabels, setShowLabels] = useState(true); // Afficher les labels en vue satellite
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const baseLayersRef = useRef({});
  const animationRef = useRef(null);
  const markerRef = useRef(null);

  // Coordonnées par défaut (Paris)
  const defaultCoords = [48.8566, 2.3522];

  // Charger Leaflet dynamiquement
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        initializeMap();
        return;
      }

      // Charger CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Charger JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Mettre à jour la carte quand la météo change
  useEffect(() => {
    if (mapInstanceRef.current && window.L && weather?.coord) {
      updateMarker(mapInstanceRef.current, window.L);
    }
  }, [weather]);

  const updateMarker = (map, L) => {
    // Supprimer l'ancien marqueur s'il existe
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Ajouter un nouveau marqueur si on a des coordonnées
    if (weather?.coord) {
      markerRef.current = L.marker([weather.coord.lat, weather.coord.lon])
        .addTo(map)
        .bindPopup(`<b>${weather.name}</b><br/>${Math.round(weather.main.temp)}°C`)
        .openPopup();
      
      // Centrer la carte sur la nouvelle ville
      map.setView([weather.coord.lat, weather.coord.lon], 8);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    // Créer la carte
    const map = L.map(mapRef.current, {
      center: defaultCoords,
      zoom: 8,
      zoomControl: true,
      attributionControl: false
    });

    // Créer les couches de base
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '© Esri, Maxar, Earthstar Geographics'
    });
    
    // Couche de labels pour la vue satellite
    const labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© CartoDB',
      pane: 'shadowPane' // Afficher au-dessus des autres couches
    });
    
    // Stocker les couches de base
    baseLayersRef.current = {
      street: streetLayer,
      satellite: satelliteLayer,
      labels: labelsLayer
    };
    
    // Ajouter la couche de base par défaut
    baseLayersRef.current[baseLayer].addTo(map);
    
    // Ajouter les labels si on est en vue satellite et qu'ils sont activés
    if (baseLayer === 'satellite' && showLabels) {
      baseLayersRef.current.labels.addTo(map);
    }

    mapInstanceRef.current = map;

    // Ajouter les couches météo
    addWeatherLayers(map, L);

    // Ajouter un marqueur pour la ville actuelle
    updateMarker(map, L);
  };

  const addWeatherLayers = (map, L) => {
    // Utiliser notre backend comme proxy
    const layers = {
      precipitation: L.tileLayer(
        'http://localhost:5000/api/radar/precipitation_new/{z}/{x}/{y}',
        { opacity: 0.6, maxZoom: 12 }
      ),
      clouds: L.tileLayer(
        'http://localhost:5000/api/radar/clouds_new/{z}/{x}/{y}',
        { opacity: 0.6, maxZoom: 12 }
      ),
      temperature: L.tileLayer(
        'http://localhost:5000/api/radar/temp_new/{z}/{x}/{y}',
        { opacity: 0.6, maxZoom: 12 }
      ),
      wind: L.tileLayer(
        'http://localhost:5000/api/radar/wind_new/{z}/{x}/{y}',
        { opacity: 0.6, maxZoom: 12 }
      )
    };

    layersRef.current = layers;
    
    // Ajouter la couche par défaut
    if (layers[currentLayer]) {
      layers[currentLayer].addTo(map);
    }
  };

  const switchLayer = (layerName) => {
    if (!mapInstanceRef.current || !layersRef.current) return;

    // Supprimer l'ancienne couche
    if (layersRef.current[currentLayer]) {
      mapInstanceRef.current.removeLayer(layersRef.current[currentLayer]);
    }

    // Ajouter la nouvelle couche
    if (layersRef.current[layerName]) {
      layersRef.current[layerName].addTo(mapInstanceRef.current);
    }

    setCurrentLayer(layerName);
  };

  const switchBaseLayer = (layerType) => {
    if (!mapInstanceRef.current || !baseLayersRef.current) return;

    // Supprimer l'ancienne couche de base
    if (baseLayersRef.current[baseLayer]) {
      mapInstanceRef.current.removeLayer(baseLayersRef.current[baseLayer]);
    }
    
    // Supprimer les labels si on quitte la vue satellite
    if (baseLayer === 'satellite' && baseLayersRef.current.labels) {
      mapInstanceRef.current.removeLayer(baseLayersRef.current.labels);
    }

    // Ajouter la nouvelle couche de base
    if (baseLayersRef.current[layerType]) {
      baseLayersRef.current[layerType].addTo(mapInstanceRef.current);
    }
    
    // Ajouter les labels si on passe en vue satellite et qu'ils sont activés
    if (layerType === 'satellite' && showLabels && baseLayersRef.current.labels) {
      baseLayersRef.current.labels.addTo(mapInstanceRef.current);
    }

    setBaseLayer(layerType);
  };

  const toggleLabels = () => {
    if (!mapInstanceRef.current || !baseLayersRef.current.labels || baseLayer !== 'satellite') return;

    if (showLabels) {
      // Supprimer les labels
      mapInstanceRef.current.removeLayer(baseLayersRef.current.labels);
    } else {
      // Ajouter les labels
      baseLayersRef.current.labels.addTo(mapInstanceRef.current);
    }

    setShowLabels(!showLabels);
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    if (!layersRef.current[currentLayer]) return;

    let opacity = 0.3;
    let increasing = true;

    animationRef.current = setInterval(() => {
      const layer = layersRef.current[currentLayer];
      
      if (layer) {
        // Animation simple d'opacité pour simuler le mouvement
        if (increasing) {
          opacity += 0.1;
          if (opacity >= 0.8) increasing = false;
        } else {
          opacity -= 0.1;
          if (opacity <= 0.3) increasing = true;
        }
        
        layer.setOpacity(opacity);
      }
    }, 500 / animationSpeed);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };

  const zoomToLocation = () => {
    if (mapInstanceRef.current && weather?.coord) {
      mapInstanceRef.current.setView([weather.coord.lat, weather.coord.lon], 10);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          Radar Météo
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:flex-nowrap">
          {/* Sélecteur de vue de base */}
          <div className="relative">
            <select
              value={baseLayer}
              onChange={(e) => switchBaseLayer(e.target.value)}
              className={`px-8 py-1 rounded-lg border text-sm appearance-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="street">Plan</option>
              <option value="satellite">Satellite</option>
            </select>
            
            {/* Icône dynamique selon la vue sélectionnée */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {baseLayer === 'street' ? (
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Flèche du dropdown */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Sélecteur de couche météo */}
          <div className="relative">
            <select
              value={currentLayer}
              onChange={(e) => switchLayer(e.target.value)}
              className={`px-8 py-1 rounded-lg border text-sm appearance-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="precipitation">Précipitations</option>
              <option value="clouds">Nuages</option>
              <option value="temperature">Température</option>
              <option value="wind">Vent</option>
            </select>
            
            {/* Icône dynamique selon la couche sélectionnée */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {currentLayer === 'precipitation' && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.07 32.91 32.91 0 003.256.508 3.5 3.5 0 007.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.07A11.717 11.717 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
                </svg>
              )}
              {currentLayer === 'clouds' && (
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
              )}
              {currentLayer === 'temperature' && (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v6.5a4.5 4.5 0 109 0V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v6.5a2.5 2.5 0 11-5 0V5a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              {currentLayer === 'wind' && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Flèche du dropdown */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Contrôles d'animation */}
          <button
            onClick={toggleAnimation}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : theme === 'dark'
                  ? 'bg-green-800 text-green-200 hover:bg-green-700'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={isPlaying ? 'Arrêter l\'animation' : 'Démarrer l\'animation'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isPlaying ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </button>

          {/* Bouton labels (seulement en vue satellite) */}
          {baseLayer === 'satellite' && (
            <button
              onClick={toggleLabels}
              className={`p-2 rounded-lg transition-colors ${
                showLabels
                  ? theme === 'dark'
                    ? 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={showLabels ? 'Masquer les noms de villes' : 'Afficher les noms de villes'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </button>
          )}

          {/* Zoom sur position */}
          {weather?.coord && (
            <button
              onClick={zoomToLocation}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              title="Centrer sur la ville actuelle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Contrôle de vitesse d'animation */}
      {isPlaying && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Vitesse:
          </span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {animationSpeed}x
          </span>
        </div>
      )}

      {/* Carte */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        />
        
        {!mapLoaded && (
          <div className={`absolute inset-0 flex items-center justify-center rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Chargement de la carte...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-medium">Vue:</span> {baseLayer === 'satellite' ? 'Satellite haute résolution' : 'Plan des rues'}
          <span className="ml-2 sm:ml-4 font-medium">Légende:</span>
          {currentLayer === 'precipitation' && ' Bleu = Pluie, Blanc = Neige'}
          {currentLayer === 'clouds' && ' Blanc = Nuages épais'}
          {currentLayer === 'temperature' && ' Rouge = Chaud, Bleu = Froid'}
          {currentLayer === 'wind' && ' Flèches = Direction du vent'}
        </div>
        <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-right sm:text-left`}>
          Données: OpenWeather • Images: {baseLayer === 'satellite' ? 'Esri/Maxar' : 'OpenStreetMap'}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherRadar;