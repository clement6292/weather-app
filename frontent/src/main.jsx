import React from 'react'
import ReactDOM from 'react-dom/client'
import { WeatherProvider } from './context/WeatherContext'
import WeatherApp from './WeatherApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WeatherProvider>
      <div className="min-h-screen">
        <WeatherApp />
      </div>
    </WeatherProvider>
  </React.StrictMode>
)