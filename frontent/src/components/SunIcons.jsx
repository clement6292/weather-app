import React from 'react';

const SunIcons = ({ type, size = 24, className = '' }) => {
  const icons = {
    sunrise: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
      >
        <path d="M17 18a5 5 0 0 0-10 0"></path>
        <line x1="12" y1="2" x2="12" y2="9"></line>
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
        <line x1="1" y1="18" x2="3" y2="18"></line>
        <line x1="21" y1="18" x2="23" y2="18"></line>
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
        <line x1="23" y1="22" x2="1" y2="22"></line>
        <polyline points="8 6 12 2 16 6"></polyline>
      </svg>
    ),
    sunset: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
      >
        <path d="M17 18a5 5 0 0 0-10 0"></path>
        <line x1="12" y1="9" x2="12" y2="2"></line>
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
        <line x1="1" y1="18" x2="3" y2="18"></line>
        <line x1="21" y1="18" x2="23" y2="18"></line>
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
        <line x1="23" y1="22" x2="1" y2="22"></line>
        <polyline points="16 5 12 9 8 5"></polyline>
      </svg>
    ),
    duration: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    refresh: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
        <path d="M16 16h5v5"></path>
      </svg>
    )
  };

  return icons[type] || null;
};

export default SunIcons;
