import React from 'react';

const CompanyLogo: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  // Get the appropriate size dimensions
  const dimensions = {
    small: { width: 120, height: 36, fontSize: '0.8rem', lineHeight: '1rem' },
    medium: { width: 150, height: 45, fontSize: '1rem', lineHeight: '1.2rem' },
    large: { width: 180, height: 54, fontSize: '1.2rem', lineHeight: '1.4rem' },
  }[size];

  // Brighter orange color for brand identity
  const bgColor = '#e05f20'; // Brighter orange

  return (
    <div 
      className="flex items-center justify-center rounded overflow-hidden"
      style={{ 
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
      }}
    >
      <div
        className="font-serif text-white font-bold text-center"
        style={{ 
          letterSpacing: '0.05em',
          fontSize: dimensions.fontSize,
          lineHeight: dimensions.lineHeight
        }}
      >
        WA Chump & Sons
      </div>
    </div>
  );
};

export default CompanyLogo;