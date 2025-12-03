import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertIcons from './AlertIcons';

const AlertBanner = ({ alerts, theme, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  const getSeverityStyles = (severity) => {
    const styles = {
      critical: {
        bg: theme === 'dark' ? 'bg-red-900/90' : 'bg-red-100',
        border: 'border-red-500',
        text: theme === 'dark' ? 'text-red-200' : 'text-red-800',
        icon: theme === 'dark' ? 'text-red-400' : 'text-red-600'
      },
      warning: {
        bg: theme === 'dark' ? 'bg-orange-900/90' : 'bg-orange-100',
        border: 'border-orange-500',
        text: theme === 'dark' ? 'text-orange-200' : 'text-orange-800',
        icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
      },
      info: {
        bg: theme === 'dark' ? 'bg-blue-900/90' : 'bg-blue-100',
        border: 'border-blue-500',
        text: theme === 'dark' ? 'text-blue-200' : 'text-blue-800',
        icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
      }
    };
    return styles[severity] || styles.info;
  };

  return (
    <AnimatePresence>
      <div className="space-y-2 mb-4">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`${styles.bg} ${styles.border} ${styles.text} border-l-4 rounded-lg p-4 shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${styles.icon}`}>
                    <AlertIcons type={alert.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {alert.title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {alert.message}
                    </p>
                  </div>
                </div>
                
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className={`${styles.text} hover:opacity-70 transition-opacity p-1`}
                    aria-label="Fermer l'alerte"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {alert.severity === 'critical' && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mt-2 text-xs font-medium"
                >
                  ⚠️ Alerte critique - Prenez des précautions
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default AlertBanner;