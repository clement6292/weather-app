// Fonction pour obtenir l'icône météo appropriée
export const getWeatherIcon = (weatherMain, iconCode) => {
  const iconMap = {
    '01d': '☀️',
    '01n': '🌙',
    '02': '⛅',
    '03': '☁️',
    '04': '☁️',
    '09': '🌧️',
    '10': '🌦️',
    '11': '⛈️',
    '13': '❄️',
    '50': '🌫️'
  };

  // Si on a un code d'icône spécifique
  if (iconCode) {
    const prefix = iconCode.substring(0, 2);
    return iconMap[iconCode] || iconMap[prefix] || '🌤️';
  }

  // Fallback basé sur le temps principal
  const main = weatherMain.toLowerCase();
  if (main.includes('clear')) return '☀️';
  if (main.includes('cloud')) return '☁️';
  if (main.includes('rain')) return '🌧️';
  if (main.includes('snow')) return '❄️';
  if (main.includes('thunder')) return '⛈️';
  if (main.includes('drizzle')) return '🌦️';
  if (main.includes('mist') || main.includes('fog')) return '🌫️';
  
  return '🌤️';
};

// Formater la température selon l'unité
export const formatTemp = (temp, unit = 'metric') => {
  const value = unit === 'metric' ? temp : (temp * 9/5) + 32;
  return Math.round(value);
};

// Formater la date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

// Obtenir la direction du vent à partir des degrés
export const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const index = Math.round((degrees %= 360) < 0 ? degrees + 360 : degrees / 22.5) % 16;
  return directions[index];
};

// Convertir m/s en km/h
export const convertWindSpeed = (speed, unit = 'metric') => {
  return unit === 'metric' 
    ? Math.round(speed * 3.6) // m/s to km/h
    : Math.round(speed * 2.237); // m/s to mph
};
