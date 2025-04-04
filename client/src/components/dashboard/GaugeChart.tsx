import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  suffix?: string;
  description?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max,
  label,
  color,
  size = 'medium',
  animated = true,
  suffix = '%',
  description
}) => {
  // Calculate dimensions based on size
  const dimensions = {
    small: {
      width: 120,
      height: 120,
      strokeWidth: 8,
      fontSize: 18,
      labelSize: 10
    },
    medium: {
      width: 160,
      height: 160,
      strokeWidth: 10,
      fontSize: 22,
      labelSize: 12
    },
    large: {
      width: 200,
      height: 200,
      strokeWidth: 12,
      fontSize: 28,
      labelSize: 14
    }
  };
  
  const { width, height, strokeWidth, fontSize, labelSize } = dimensions[size];
  
  // Calculate the percentage for the gauge
  const percentage = Math.min(Math.max(0, value / max), 1);
  const radius = (width / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // The gauge is a semi-circle, so we only need half of the circumference
  const semicircle = circumference * 0.75;
  
  // Calculate the stroke-dasharray and stroke-dashoffset
  const dashArray = `${semicircle} ${circumference}`;
  const dashOffset = semicircle - (percentage * semicircle);
  
  // Calculate the rotation to make the gauge start from the bottom left
  const rotation = 135;
  
  // Get color based on percentage for threshold gauges
  const getThresholdColor = () => {
    if (color === 'threshold') {
      if (percentage < 0.5) return 'var(--brand-rust)'; // High risk
      if (percentage < 0.8) return 'var(--brand-gold)'; // Medium risk
      return 'var(--brand-green)'; // Good
    }
    return color;
  };
  
  // Decide text color based on gauge color
  const getTextColor = () => {
    const actualColor = getThresholdColor();
    if (actualColor === 'var(--brand-rust)') return 'text-high-risk';
    if (actualColor === 'var(--brand-gold)') return 'text-at-risk';
    if (actualColor === 'var(--brand-green)') return 'text-compliant';
    return 'text-primary';
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width, height }}>
        {/* Background circle */}
        <svg
          width={width}
          height={height}
          className="transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
          
          {/* Foreground circle - animated */}
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke={getThresholdColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            initial={{ strokeDashoffset: semicircle }}
            animate={{ 
              strokeDashoffset: animated ? dashOffset : semicircle,
              transition: { 
                duration: animated ? 1.5 : 0,
                ease: "easeOut"
              }
            }}
          />
        </svg>
        
        {/* Value display */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: `rotate(0deg)` }}
        >
          <motion.div 
            className={`font-bold ${getTextColor()}`}
            style={{ fontSize }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: animated ? 0.8 : 0, duration: 0.3 }
            }}
          >
            {value.toFixed(1)}{suffix}
          </motion.div>
          <motion.div 
            className="text-gray-500 font-medium mt-1"
            style={{ fontSize: labelSize }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: animated ? 1 : 0, duration: 0.3 }
            }}
          >
            {label}
          </motion.div>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 mt-1 text-center max-w-[140px]">
          {description}
        </p>
      )}
    </div>
  );
};

export default GaugeChart;