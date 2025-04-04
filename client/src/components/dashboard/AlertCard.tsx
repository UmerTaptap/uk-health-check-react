import React from 'react';
import { motion } from 'framer-motion';
import { AlertType, AlertSeverity } from '@/lib/types';

type AlertCardProps = {
  alert: {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    location: string;
    detectedAt: string;
    reading?: string;
    deadline: string;
    assignedTo: {
      initials: string;
      name: string;
    };
  };
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  // Determine border and badge colors based on severity
  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-high-risk',
          badge: 'bg-red-100 text-high-risk',
          icon: 'text-high-risk'
        };
      case 'medium':
        return {
          border: 'border-at-risk',
          badge: 'bg-amber-100 text-at-risk',
          icon: 'text-at-risk'
        };
      case 'low':
        return {
          border: 'border-primary',
          badge: 'bg-blue-100 text-primary',
          icon: 'text-primary'
        };
      default:
        return {
          border: 'border-gray-300',
          badge: 'bg-gray-100 text-gray-700',
          icon: 'text-gray-500'
        };
    }
  };

  // Get icon based on alert type
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'moisture':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'mould':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'air-quality':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'tenant-report':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const styles = getSeverityStyles(alert.severity);
  const severityText = 
    alert.severity === 'high' ? 'High Priority' : 
    alert.severity === 'medium' ? 'Medium Priority' : 'Low Priority';

  const getAlertTitle = (type: AlertType) => {
    switch (type) {
      case 'moisture':
        return 'Excessive Moisture Level Detected';
      case 'mould':
        return 'Mould Growth Detected';
      case 'air-quality':
        return 'Poor Air Quality Measurement';
      case 'tenant-report':
        return 'Tenant Reported Damp Odor';
      default:
        return 'Alert Detected';
    }
  };

  return (
    <motion.div 
      className={`bg-white overflow-hidden shadow-sm rounded-lg border-l-4 ${styles.border}`}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 15 
      }}
    >
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.span 
              className={styles.icon}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {getAlertIcon(alert.type)}
            </motion.span>
            <h3 className="text-base font-semibold text-gray-900">{getAlertTitle(alert.type)}</h3>
          </div>
          <motion.span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {severityText}
          </motion.span>
        </div>
        <motion.div 
          className="mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="text-sm text-gray-500 grid grid-cols-2 gap-2 mb-2">
            <div>
              <span className="font-medium">Location:</span> {alert.location}
            </div>
            <div>
              <span className="font-medium">Detected:</span> {alert.detectedAt}
            </div>
            {alert.reading && (
              <div>
                <span className="font-medium">Reading:</span> {alert.reading}
              </div>
            )}
            <div>
              <span className="font-medium">Deadline:</span> 
              <motion.span 
                className={`font-medium ${alert.severity === 'high' ? 'text-high-risk' : alert.severity === 'medium' ? 'text-at-risk' : ''}`}
                animate={{ 
                  scale: alert.severity === 'high' ? [1, 1.05, 1] : 1
                }}
                transition={{ 
                  repeat: alert.severity === 'high' ? Infinity : 0, 
                  repeatType: "reverse",
                  duration: 1.5
                }}
              >
                {alert.deadline}
              </motion.span>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="mt-3 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center text-sm text-gray-500">
            <motion.div 
              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-xs font-medium">{alert.assignedTo.initials}</span>
            </motion.div>
            Assigned to {alert.assignedTo.name}
          </div>
          <div className="flex space-x-2">
            <motion.button 
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Details
            </motion.button>
            <motion.button 
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Respond
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
