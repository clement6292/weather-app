import React from 'react';

const WeatherCard = ({ weather, unit, onRefresh }) => {
  if (!weather || !weather.main) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p>Chargement des données météo...</p>
      </div>
    );
  }

  // Formatage de la date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Conversion de la direction du vent en points cardinaux
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const convertWindSpeed = (speed, unit) => {
    if (unit === 'metric') {
      return speed.toFixed(1);
    } else {
      return (speed * 2.23694).toFixed(1);
    }
  };

  const formatLocalTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('fr-FR');
  };

  const dayHours = Math.floor((weather.sys.sunset - weather.sys.sunrise) / 3600);
  const dayMinutes = Math.floor(((weather.sys.sunset - weather.sys.sunrise) % 3600) / 60);

  const {
    coord,
    weather: [weatherInfo],
    main,
    visibility,
    wind,
    clouds,
    sys,
    timezone,
    name,
    dt
  } = weather;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête avec ville et date */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {name}, {sys?.country}
            </h2>
            <p className="text-gray-500">{formatDate(dt)}</p>
            <p className="text-lg mt-2 capitalize">{weatherInfo.description}</p>
          </div>
          <button 
            onClick={onRefresh}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Rafraîchir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Température principale */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={`http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`} 
              alt={weatherInfo.description}
              className="w-24 h-24"
            />
            <div className="ml-4">
              <span className="text-5xl font-bold">{Math.round(main.temp)}°</span>
              <span className="text-gray-500 ml-2">{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
          </div>
          <div className="text-right">
            <p>Ressenti: {Math.round(main.feels_like)}°</p>
            <p>Min: {Math.round(main.temp_min)}° / Max: {Math.round(main.temp_max)}°</p>
          </div>
        </div>
      </div>

      {/* Détails météo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {/* Carte Vent */}
        <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
            Vent
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Vitesse:</span> {convertWindSpeed(wind.speed, unit)} {unit === 'metric' ? 'm/s' : 'mph'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Direction:</span> {getWindDirection(wind.deg)} ({wind.deg}°)
            </p>
            {wind.gust && (
              <p className="text-gray-600">
                <span className="font-medium">Rafales:</span> {convertWindSpeed(wind.gust, unit)} {unit === 'metric' ? 'm/s' : 'mph'}
              </p>
            )}
          </div>
        </div>

        {/* Carte Humidité & Pression */}
        <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
            Humidité & Pression
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Humidité:</span> {main.humidity}%
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Pression:</span> {main.pressure} hPa
            </p>
            {main.sea_level && (
              <p className="text-gray-600">
                <span className="font-medium">Niveau mer:</span> {main.sea_level} hPa
              </p>
            )}
            {main.grnd_level && (
              <p className="text-gray-600">
                <span className="font-medium">Niveau sol:</span> {main.grnd_level} hPa
              </p>
            )}
          </div>
        </div>

        {/* Carte Visibilité & Nuages */}
        <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Visibilité & Nuages
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Visibilité:</span> {(visibility / 1000).toFixed(1)} km
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Nuages:</span> {clouds.all}%
            </p>
            {weatherInfo?.main && (
              <p className="text-gray-600 capitalize">
                <span className="font-medium">Conditions:</span> {weatherInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Carte Soleil */}
        <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
            Soleil
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Lever:</span> {formatLocalTime(sys.sunrise)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Coucher:</span> {formatLocalTime(sys.sunset)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Durée du jour:</span> {dayHours}h{dayMinutes.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Carte Coordonnées */}
        <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all md:col-span-2">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Coordonnées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Latitude:</span> {coord.lat}°
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Longitude:</span> {coord.lon}°
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Fuseau horaire:</span> GMT{timezone >= 0 ? '+' : ''}{timezone / 3600}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Ville:</span> {name}, {sys?.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
