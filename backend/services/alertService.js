// Service de détection d'alertes météo
export class AlertService {
  
  // Vérifier les prévisions pour "pluie demain"
  static checkRainTomorrow(forecastData, customAlerts = null) {
    if (!forecastData?.forecasts || !customAlerts?.rainTomorrow) {
      return null;
    }
    
    // Chercher la prévision de demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const tomorrowForecast = forecastData.forecasts.find(f => f.date === tomorrowStr);
    
    if (tomorrowForecast && tomorrowForecast.description.toLowerCase().includes('rain')) {
      return {
        type: 'custom_rain_tomorrow',
        severity: 'info',
        title: 'Pluie prévue demain',
        message: `Il va pleuvoir demain: ${tomorrowForecast.description}`,
        icon: '🌧️',
        timestamp: Date.now(),
        id: `rain_tomorrow_${Date.now()}`
      };
    }
    
    return null;
  }
  static DEFAULT_THRESHOLDS = {
    temperature: {
      extreme_cold: -15,
      cold: -5,
      hot: 30,
      extreme_hot: 35
    },
    wind: {
      strong: 50, // km/h
      dangerous: 80
    },
    humidity: {
      low: 25,
      high: 85
    },
    pressure: {
      low: 980,
      high: 1030
    }
  };

  static detectAlerts(weatherData, thresholds = this.DEFAULT_THRESHOLDS, customAlerts = null) {
    const alerts = [];
    const { main, weather, wind } = weatherData;
    
    // Les alertes personnalisées sont passées en paramètre depuis le frontend
    
    // Debug: afficher les données reçues
    console.log('=== DEBUG ALERTES ===');
    console.log('Ville:', weatherData.name);
    console.log('Température:', main.temp);
    console.log('Humidité:', main.humidity);
    console.log('Vent:', wind?.speed);
    console.log('Seuils humidité:', thresholds.humidity);
    console.log('Alertes personnalisées:', customAlerts);
    console.log('====================');
    
    // Alertes de température
    if (main.temp <= thresholds.temperature.extreme_cold) {
      alerts.push({
        type: 'temperature',
        severity: 'critical',
        title: 'Froid extrême',
        message: `Température très basse: ${Math.round(main.temp)}°C`,
        icon: 'snowflake'
      });
    } else if (main.temp <= thresholds.temperature.cold) {
      alerts.push({
        type: 'temperature',
        severity: 'warning',
        title: 'Température froide',
        message: `Risque de gel: ${Math.round(main.temp)}°C`,
        icon: 'freeze'
      });
    } else if (main.temp >= thresholds.temperature.extreme_hot) {
      alerts.push({
        type: 'temperature',
        severity: 'critical',
        title: 'Canicule',
        message: `Chaleur extrême: ${Math.round(main.temp)}°C`,
        icon: 'fire'
      });
    } else if (main.temp >= thresholds.temperature.hot) {
      alerts.push({
        type: 'temperature',
        severity: 'warning',
        title: 'Forte chaleur',
        message: `Température élevée: ${Math.round(main.temp)}°C`,
        icon: 'sun'
      });
    }

    // Alertes de vent
    const windSpeedKmh = Math.round(wind?.speed * 3.6) || 0;
    if (windSpeedKmh >= thresholds.wind.dangerous) {
      alerts.push({
        type: 'wind',
        severity: 'critical',
        title: 'Vent dangereux',
        message: `Vent très fort: ${windSpeedKmh} km/h`,
        icon: 'alert'
      });
    } else if (windSpeedKmh >= thresholds.wind.strong) {
      alerts.push({
        type: 'wind',
        severity: 'warning',
        title: 'Vent fort',
        message: `Vent soutenu: ${windSpeedKmh} km/h`,
        icon: 'wind'
      });
    }

    // Alertes météo spéciales
    const weatherMain = weather[0]?.main?.toLowerCase();
    if (weatherMain === 'thunderstorm') {
      alerts.push({
        type: 'weather',
        severity: 'critical',
        title: 'Orage',
        message: 'Risque d\'orages violents',
        icon: 'lightning'
      });
    } else if (weatherMain === 'snow') {
      alerts.push({
        type: 'weather',
        severity: 'warning',
        title: 'Chutes de neige',
        message: 'Conditions de circulation difficiles',
        icon: 'snow'
      });
    }

    // Alertes d'humidité - validation stricte
    const humidity = parseInt(main.humidity);
    if (humidity && !isNaN(humidity) && humidity >= 0 && humidity <= 100) {
      if (humidity <= thresholds.humidity.low) {
        alerts.push({
          type: 'humidity',
          severity: 'info',
          title: 'Air sec',
          message: `Humidité faible: ${humidity}%`,
          icon: 'desert'
        });
      } else if (humidity >= thresholds.humidity.high) {
        alerts.push({
          type: 'humidity',
          severity: 'warning',
          title: 'Humidité élevée',
          message: `Air très humide: ${humidity}%`,
          icon: 'droplet'
        });
      }
    }

    // Vérifier les alertes personnalisées
    if (customAlerts) {
      // Température personnalisée en dessous
      if (customAlerts.tempBelow?.enabled && main.temp <= customAlerts.tempBelow.value) {
        console.log(`ALERTE TEMP BASSE: ${main.temp} <= ${customAlerts.tempBelow.value}`);
        alerts.push({
          type: 'custom_temp_low',
          severity: 'warning',
          title: 'Alerte personnalisée',
          message: `Température sous votre seuil: ${Math.round(main.temp)}°C (seuil: ${customAlerts.tempBelow.value}°C)`,
          icon: 'freeze'
        });
      }
      
      // Température personnalisée au-dessus
      if (customAlerts.tempAbove?.enabled && main.temp >= customAlerts.tempAbove.value) {
        console.log(`ALERTE TEMP HAUTE: ${main.temp} >= ${customAlerts.tempAbove.value}`);
        alerts.push({
          type: 'custom_temp_high',
          severity: 'warning',
          title: 'Alerte personnalisée',
          message: `Température au-dessus de votre seuil: ${Math.round(main.temp)}°C (seuil: ${customAlerts.tempAbove.value}°C)`,
          icon: 'fire'
        });
      }
      
      // Vent personnalisé
      const windSpeedKmh = Math.round(wind?.speed * 3.6) || 0;
      if (customAlerts.windAbove?.enabled && windSpeedKmh >= customAlerts.windAbove.value) {
        console.log(`ALERTE VENT: ${windSpeedKmh} >= ${customAlerts.windAbove.value}`);
        alerts.push({
          type: 'custom_wind',
          severity: 'warning',
          title: 'Alerte vent personnalisée',
          message: `Vent au-dessus de votre seuil: ${windSpeedKmh} km/h (seuil: ${customAlerts.windAbove.value} km/h)`,
          icon: 'alert'
        });
      }
    }

    const finalAlerts = alerts.map((alert, index) => ({
      ...alert,
      timestamp: Date.now(),
      id: `${alert.type}_${weatherData.name}_${alert.severity}_${index}`
    }));
    
    console.log('Alertes générées:', finalAlerts.length);
    finalAlerts.forEach(alert => {
      console.log(`- ${alert.title}: ${alert.message}`);
    });
    
    return finalAlerts;
  }
}