import React from 'react';
import { Link } from 'wouter';
import { Eye, AlertTriangle } from 'lucide-react';
import { PropertyStatus, RiskLevel } from '@/lib/types';
import { motion } from 'framer-motion';

type PropertyCardProps = {
  property: {
    id: string;
    name: string;
    description: string;
    address: string;
    status: PropertyStatus;
    riskLevel: RiskLevel;
    alerts: {
      high: number;
      medium: number;
      low: number;
    };
    lastInspection: {
      date: string;
      daysAgo: number;
    };
    sensors: number;
  };
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-compliant">
            Compliant
          </span>
        );
      case 'at-risk':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-at-risk">
            At Risk
          </span>
        );
      case 'non-compliant':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-high-risk">
            Non-Compliant
          </span>
        );
      default:
        return null;
    }
  };
  
  const getBorderColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'border-t-4 border-high-risk';
      case 'medium':
        return 'border-t-4 border-at-risk';
      case 'low':
        return 'border-t-4 border-blue-400';
      case 'none':
        return 'border-t-4 border-gray-300';
      default:
        return 'border-t-4 border-gray-300';
    }
  };
  
  const totalAlerts = property.alerts.high + property.alerts.medium + property.alerts.low;
  
  return (
    <motion.div 
      className={`bg-white shadow-lg rounded-lg overflow-hidden ${getBorderColor(property.riskLevel)} hover:shadow-xl transition-shadow duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="p-5">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {getStatusBadge(property.status)}
          </motion.div>
        </div>
        <p className="mt-1 text-sm text-gray-500">{property.description}</p>
        <p className="mt-2 text-xs text-gray-400">{property.address}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Alerts</p>
            <div className="flex space-x-2 mt-1">
              {property.alerts.high > 0 && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-red-100 text-high-risk rounded-md shadow-sm"
                >
                  {property.alerts.high} High
                </motion.span>
              )}
              {property.alerts.medium > 0 && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-at-risk rounded-md shadow-sm"
                >
                  {property.alerts.medium} Med
                </motion.span>
              )}
              {property.alerts.low > 0 && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md shadow-sm"
                >
                  {property.alerts.low} Low
                </motion.span>
              )}
              {totalAlerts === 0 && (
                <span className="text-gray-500 text-xs">None</span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Last Inspection</p>
            <p className="text-sm mt-1">{property.lastInspection.date}</p>
            <p className="text-xs text-gray-400">{property.lastInspection.daysAgo} days ago</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Risk Level</p>
            <p className={`text-sm mt-1 ${
              property.riskLevel === 'high' 
                ? 'text-high-risk font-medium' 
                : property.riskLevel === 'medium' 
                  ? 'text-at-risk font-medium' 
                  : property.riskLevel === 'low' 
                    ? 'text-blue-600' 
                    : 'text-gray-500'
            }`}>
              {property.riskLevel.charAt(0).toUpperCase() + property.riskLevel.slice(1)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Sensors</p>
            <p className="text-sm mt-1">{property.sensors} installed</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-4">
        {(property.alerts.high > 0 || property.alerts.medium > 0) && (
          <motion.button 
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            className="text-at-risk hover:text-amber-700 transition-colors duration-150"
          >
            <AlertTriangle className="h-5 w-5" />
          </motion.button>
        )}
        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
          <Link href={`/properties/${property.id}`} className="text-primary hover:text-blue-800 transition-colors duration-150">
            <Eye className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;