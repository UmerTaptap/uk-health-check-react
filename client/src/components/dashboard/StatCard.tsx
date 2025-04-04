import React, { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  change?: {
    value: string | number;
    isIncrease: boolean;
  };
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
  borderColor,
  iconBgColor,
  iconColor
}) => {
  return (
    <div className={`premium-card ${borderColor} border-l-0 border-r-0 border-b-0 border-t-4 hover:shadow-lg transition-shadow duration-300`}>
      <div className="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 flex-1 flex flex-col">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-lg p-2 sm:p-3 shadow-sm ${iconBgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mt-1">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline flex-wrap">
            {change && (
              <div className={`mr-2 flex items-center text-xs sm:text-sm font-medium ${change.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                {change.isIncrease ? (
                  <ArrowUpIcon className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span className="sr-only">{change.isIncrease ? 'Increased' : 'Decreased'} by</span>
                {change.value}
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;