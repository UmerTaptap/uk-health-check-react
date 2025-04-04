import React from 'react';
import { Link } from 'wouter';
import { Eye, AlertCircle } from 'lucide-react';
import { PropertyStatus, RiskLevel, Property } from '@/lib/types';

type PropertyRowProps = {
  property: Property;
};

const PropertyRow: React.FC<PropertyRowProps> = ({ property }) => {
  const getStatusBadge = (status: PropertyStatus) => {
    const styles = {
      'compliant': 'bg-green-100 text-compliant',
      'at-risk': 'bg-amber-100 text-at-risk',
      'non-compliant': 'bg-red-100 text-high-risk'
    };
    
    const labels = {
      'compliant': 'Compliant',
      'at-risk': 'At Risk',
      'non-compliant': 'Non-Compliant'
    };
    
    return (
      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };
  
  const getRiskText = (risk: RiskLevel) => {
    const styles = {
      'high': 'text-high-risk font-medium',
      'medium': 'text-at-risk font-medium',
      'low': 'text-gray-500',
      'none': 'text-gray-400'
    };
    
    const labels = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'none': 'None'
    };
    
    return (
      <span className={styles[risk]}>
        {labels[risk]}
      </span>
    );
  };
  
  return (
    <tr>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-900">{property.name}</div>
            <div className="text-xs sm:text-sm text-gray-500 truncate">{property.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        {getStatusBadge(property.status)}
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        {getRiskText(property.riskLevel)}
        <div className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">{property.riskReason}</div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {property.alerts.high > 0 && (
            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 text-xs font-medium bg-red-100 text-high-risk rounded-md shadow-sm">
              {property.alerts.high} High
            </span>
          )}
          {property.alerts.medium > 0 && (
            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-at-risk rounded-md shadow-sm">
              {property.alerts.medium} Med
            </span>
          )}
          {property.alerts.low > 0 && (
            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md shadow-sm">
              {property.alerts.low} Low
            </span>
          )}
          {(property.alerts.high === 0 && property.alerts.medium === 0 && property.alerts.low === 0) && (
            <span className="text-gray-500 text-xs sm:text-sm">None</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-500">
        <div>{property.lastInspection.date}</div>
        <div className="text-xs text-gray-400">{property.lastInspection.daysAgo} days ago</div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-medium">
        <div className="flex space-x-2 sm:space-x-3 justify-end">
          {(property.alerts.high > 0 || property.alerts.medium > 0) && (
            <button className="text-at-risk hover:text-amber-700 transition-colors duration-150">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          <Link href={`/properties/${property.id}`} className="text-primary hover:text-blue-800 transition-colors duration-150">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default PropertyRow;