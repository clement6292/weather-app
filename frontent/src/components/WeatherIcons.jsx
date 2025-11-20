import React from 'react';

const WeatherIcons = ({ icon, size = 64, className = '', animated = false }) => {
  const iconStyle = {
    width: size,
    height: size,
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
  };

  // Animation styles
  const getAnimationClass = (iconCode) => {
    if (!animated) return '';

    if (iconCode.startsWith('01d') || iconCode.startsWith('02d')) {
      return 'animate-spin-slow'; // Slow rotation for sun
    }
    if (iconCode.includes('03') || iconCode.includes('04')) {
      return 'animate-float'; // Floating for clouds
    }
    if (iconCode.includes('09') || iconCode.includes('10')) {
      return 'animate-pulse'; // Pulse for rain
    }
    if (iconCode.includes('13')) {
      return 'animate-bounce-slow'; // Slow bounce for snow
    }
    return '';
  };

  const animationClass = getAnimationClass(icon);

  const icons = {
    // Clear Sky (Day)
    '01d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <radialGradient id="sunGradient" cx="32" cy="32" r="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#FF9A3D" />
          </radialGradient>
          <filter id="sunGlow" x="0" y="0" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="16" fill="url(#sunGradient)" filter="url(#sunGlow)" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 32 + Math.cos(angle) * 20;
          const y1 = 32 + Math.sin(angle) * 20;
          const x2 = 32 + Math.cos(angle) * 28;
          const y2 = 32 + Math.sin(angle) * 28;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFB347"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          );
        })}
      </svg>
    ),
    
    // Clear Sky (Night)
    '01n': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <radialGradient id="moonGradient" cx="32" cy="32" r="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E6F0FF" />
            <stop offset="100%" stopColor="#B8D1FF" />
          </radialGradient>
          <filter id="moonGlow" x="0" y="0" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          d="M42,14c-3.3,8.2-1.1,17.5,6,24.6c7.1,7.1,16.4,9.3,24.6,6c-1.9,9.9-10.3,17-20.6,17c-11.6,0-21-9.4-21-21C31,24.3,37.9,15.9,42,14z" 
          fill="url(#moonGradient)" 
          filter="url(#moonGlow)"
          transform="translate(-10,-10) scale(0.8)"
        />
      </svg>
    ),
    
    // Few Clouds (Day)
    '02d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="partlyCloudyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9F9F9" />
            <stop offset="100%" stopColor="#E0E0E0" />
          </linearGradient>
          <radialGradient id="sunPartlyGradient" cx="45" cy="25" r="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#FF9A3D" />
          </radialGradient>
        </defs>
        <circle cx="45" cy="25" r="12" fill="url(#sunPartlyGradient)" filter="url(#sunGlow)" />
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#partlyCloudyGradient)" 
          stroke="#D1D5DB" 
          strokeWidth="1.5"
          fillOpacity="0.95"
        />
      </svg>
    ),
    
    // Few Clouds (Night)
    '02n': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="nightCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E8FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
          <radialGradient id="moonPartlyGradient" cx="45" cy="25" r="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E6F0FF" />
            <stop offset="100%" stopColor="#B8D1FF" />
          </radialGradient>
        </defs>
        <path 
          d="M42,14c-3.3,8.2-1.1,17.5,6,24.6c7.1,7.1,16.4,9.3,24.6,6c-1.9,9.9-10.3,17-20.6,17c-11.6,0-21-9.4-21-21C31,24.3,37.9,15.9,42,14z" 
          fill="url(#moonPartlyGradient)" 
          filter="url(#moonGlow)"
          transform="translate(-10,-10) scale(0.6)"
        />
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#nightCloudGradient)" 
          fillOpacity="0.2"
          stroke="#A5B4FC" 
          strokeWidth="1.5"
        />
      </svg>
    ),
    
    // Scattered Clouds (Day)
    '03d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="cloudGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#cloudGradient1)" 
          stroke="#D1D5DB" 
          strokeWidth="1.5"
        />
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="#FFFFFF" 
          fillOpacity="0.3"
          transform="translate(0,5)"
        />
      </svg>
    ),
    
    // Scattered Clouds (Night)
    '03n': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="nightCloudGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#nightCloudGradient1)" 
          stroke="#9CA3AF" 
          strokeWidth="1.5"
          fillOpacity="0.15"
        />
      </svg>
    ),
    
    // Broken Clouds (Day)
    '04d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="cloudGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#cloudGradient2)" 
          stroke="#9CA3AF" 
          strokeWidth="1.5"
        />
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="#FFFFFF" 
          fillOpacity="0.15"
          transform="translate(0,5)"
        />
      </svg>
    ),
    
    // Rain (Day)
    '09d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="rainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#6B7280" />
          </linearGradient>
          <linearGradient id="rainDropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#rainGradient)" 
          stroke="#6B7280" 
          strokeWidth="1.5"
        />
        <g>
          <path d="M20,50l2,8l-4,0l2-8z" fill="url(#rainDropGradient)" />
          <path d="M30,50l2,8l-4,0l2-8z" fill="url(#rainDropGradient)" />
          <path d="M40,50l2,8l-4,0l2-8z" fill="url(#rainDropGradient)" />
          <path d="M50,50l2,8l-4,0l2-8z" fill="url(#rainDropGradient)" />
        </g>
      </svg>
    ),
    
    // Rain (Night)
    '09n': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="nightRainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
          <linearGradient id="nightRainDropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#nightRainGradient)" 
          stroke="#4B5563" 
          strokeWidth="1.5"
        />
        <g>
          <path d="M20,50l2,8l-4,0l2-8z" fill="url(#nightRainDropGradient)" />
          <path d="M30,50l2,8l-4,0l2-8z" fill="url(#nightRainDropGradient)" />
          <path d="M40,50l2,8l-4,0l2-8z" fill="url(#nightRainDropGradient)" />
          <path d="M50,50l2,8l-4,0l2-8z" fill="url(#nightRainDropGradient)" />
        </g>
      </svg>
    ),
    
    // Thunderstorm (Day)
    '11d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="thunderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4B5563" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#thunderGradient)" 
          stroke="#1F2937" 
          strokeWidth="1.5"
        />
        <path 
          d="M28,25l-8,12h6l-4,8l12-12h-6l4-8z" 
          fill="#FCD34D" 
          stroke="#F59E0B" 
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#thunderGlow)"
        />
        <defs>
          <filter id="thunderGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
    ),
    
    // Snow (Day)
    '13d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9FAFB" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#snowGradient)" 
          stroke="#D1D5DB" 
          strokeWidth="1.5"
        />
        <g fill="#93C5FD" stroke="#60A5FA" strokeWidth="1">
          <path d="M25,45l2,2l-2,2l-2-2L25,45z M35,45l2,2l-2,2l-2-2L35,45z M45,45l2,2l-2,2l-2-2L45,45z" />
          <path d="M30,50l2,2l-2,2l-2-2L30,50z M40,50l2,2l-2,2l-2-2L40,50z" />
        </g>
      </svg>
    ),
    
    // Mist/Fog (Day)
    '50d': (
      <svg style={iconStyle} viewBox="0 0 64 64" className={className}>
        <defs>
          <linearGradient id="fogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path 
          d="M55,40c0,8.3-6.7,15-15,15H20c-8.3,0-15-6.7-15-15c0-7.2,5.1-13.2,12-14.7c1.1-5.7,6-10,12-10c6.6,0,12,5.4,12,12c0,0.6,0,1.1-0.1,1.7C52.4,35.2,55,37.4,55,40z" 
          fill="url(#fogGradient)" 
          stroke="#D1D5DB" 
          strokeWidth="1.5"
          fillOpacity="0.7"
        />
        <rect x="10" y="45" width="44" height="3" fill="#FFFFFF" fillOpacity="0.8" rx="1.5" />
        <rect x="15" y="50" width="34" height="3" fill="#FFFFFF" fillOpacity="0.6" rx="1.5" />
        <rect x="20" y="55" width="24" height="3" fill="#FFFFFF" fillOpacity="0.4" rx="1.5" />
      </svg>
    )
  };
};

export default WeatherIcons;
