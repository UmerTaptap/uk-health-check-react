import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Property, PropertyData, PropertyStatus, RiskLevel } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
import { ContentTransition } from '@/components/transitions/ContentTransition';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: PropertyData;
  compact?: boolean;
  onDeleteClick?: (property: PropertyData) => void;
}

const PropertyCard = ({ property, compact = false, onDeleteClick }: PropertyCardProps) => {
  const [isValid, setIsValid] = useState(false);
  const [randomQuality, setRandomQuality] = useState(0);

  // Validate property data when component mounts and set random quality
  useEffect(() => {
    // const validProperty = 
    //   property && 
    //   typeof property === 'object' && 
    //   property.id && 
    //   property.name && 
    //   property.address && 
    //   property.status && 
    //   property.riskLevel &&
    //   property.alerts &&
    //   property.lastInspection;

    // setIsValid(!!validProperty);

    // Generate random quality between 10-100 (skewed to create more variation)
    const random = Math.floor(Math.random() * 91) + 10;
    // Occasionally create some very poor or excellent results
    const skewedRandom = Math.random() > 0.8
      ? (Math.random() > 0.5 ? random + 20 : random - 20)
      : random;
    setRandomQuality(Math.min(100, Math.max(0, skewedRandom)));
  }, [property]);

  // if (!isValid) {
  //   return null;
  // }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(property);
    }
  };

  const getStatusStyle = (status: string) => {
    console.log('Current status', status);
    switch (status) {
      case 'Compliant':
        return { bg: 'rgba(10, 145, 85, 0.15)', text: 'var(--brand-green)' };
      case 'at-risk':
        return { bg: 'rgba(237, 176, 21, 0.15)', text: 'var(--brand-gold)' };
      case 'non-compliant':
        return { bg: 'rgba(163, 67, 15, 0.15)', text: 'var(--brand-rust)' };
      default:
        return { bg: 'rgba(66, 42, 29, 0.15)', text: 'var(--brand-dark-brown)' };
    }
  };

  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      case 'none':
        return 'No Risk';
      default:
        return 'Unknown';
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return 'var(--brand-rust)';
      case 'medium':
        return 'var(--brand-gold)';
      case 'low':
        return 'var(--brand-green)';
      case 'none':
        return 'var(--brand-dark-green)';
      default:
        return 'var(--brand-dark-brown)';
    }
  };

  const alerts = property.compliance.riskLevel || { high: 0, medium: 0, low: 0 };
  const lastInspection = property.propertyDetails.lastInspection;// || { date: 'Unknown', daysAgo: 0 };
  const lastInspectionDate = new Date(lastInspection);

  const today = new Date();
  const timeDiff = today.getTime() - lastInspectionDate.getTime();
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  const statusStyle = getStatusStyle(property.compliance.currentStatus);

  const cardHeader = (
    <div className="p-4 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <ContentTransition delay={0.1} direction="right">
          <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
        </ContentTransition>
        <ContentTransition delay={0.2} direction="left">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text
              }}
            >
              {property.compliance.currentStatus === 'Compliant' ? 'Compliant' :
                property.compliance.currentStatus === 'at-risk' ? 'At Risk' : 'Non-Compliant'}
            </span>

            {onDeleteClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={handleDeleteClick}
                title="Delete property"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ContentTransition>
      </div>
      <ContentTransition delay={0.3} direction="up">
        <p className="text-sm text-gray-500 mt-1">{property.address}</p>
      </ContentTransition>
    </div>
  );

  const cardDetails = !compact && (
    <div className="px-4 py-3">
      <ContentTransition delay={0.4} direction="up">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Risk Level</div>
            <div className="text-sm font-medium mt-1" style={{ color: getRiskColor(property.compliance.riskLevel) }}>
              {getRiskText(property.compliance.riskLevel)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Inspection</div>
            <div className="text-sm mt-1">
              {lastInspectionDate.getDate() + '/' + (lastInspectionDate.getMonth() + 1) + '/' + lastInspectionDate.getFullYear()}
              <span className="text-xs text-gray-500 ml-1">
                ({daysAgo} days ago)
              </span>
            </div>
          </div>
        </div>
      </ContentTransition>



      {/* 
      <ContentTransition delay={0.5} direction="up">
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Active Alerts</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {alerts.high > 0 && (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(163, 67, 15, 0.15)', 
                  color: 'var(--brand-rust)' 
                }}
              >
                {alerts.high} High
              </span>
            )}
            {alerts.medium > 0 && (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(237, 176, 21, 0.15)', 
                  color: 'var(--brand-gold)' 
                }}
              >
                {alerts.medium} Med
              </span>
            )}
            {alerts.low > 0 && (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(10, 145, 85, 0.15)', 
                  color: 'var(--brand-green)' 
                }}
              >
                {alerts.low} Low
              </span>
            )}
            {alerts.high === 0 && alerts.medium === 0 && alerts.low === 0 && (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(11, 74, 46, 0.15)', 
                  color: 'var(--brand-dark-green)' 
                }}
              >
                None
              </span>
            )}
          </div>




          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Good</span>
              <span>Poor</span>
            </div>
            <div className="relative h-4 w-full rounded-full overflow-hidden bg-gray-100">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, 
                    rgba(16, 185, 129, 0.7) 0%, 
                    rgba(245, 158, 11, 0.7) 50%, 
                    rgba(239, 68, 68, 0.7) 100%)`
                }}
              />
              <div 
                className="absolute top-0 bottom-0 left-0 bg-white bg-opacity-70"
                style={{
                  right: `${100 - randomQuality}%`,
                  transition: 'right 0.5s ease'
                }}
              />





              <div 
                className="absolute top-0 h-4 w-1 bg-gray-900 rounded-full z-10"
                style={{
                  left: `${randomQuality}%`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.5s ease'
                }}
              />
            </div>
        
          </div>

          <ContentTransition delay={0.3} direction="up">
            <p className="text-sm text-gray-500 mt-1">Deaths from respiratory diseases</p>
          </ContentTransition>




        </div>
        
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Property Group</div>
          <div className="flex flex-wrap gap-1">
            {property.groupId ? (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(10, 145, 85, 0.15)', 
                  color: 'var(--brand-green)' 
                }}
              >
                {property.groupName || `Group #${property.groupId}`}
              </span>
            ) : (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: 'rgba(66, 42, 29, 0.15)', 
                  color: 'var(--brand-dark-brown)' 
                }}
              >
                Not assigned to any group
              </span>
            )}
          </div>
        </div>
      </ContentTransition> */}





    </div>
  );

  return (
    <SharedLayoutTransition
      id={`property-overview-${property._id}`}
      className="bg-white rounded-lg shadow-sm overflow-hidden transition-all"
      withScale={true}
    >
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <Link href={`/properties/${property._id}`}>
            <div className="cursor-pointer">
              {cardHeader}
              {cardDetails}
            </div>
          </Link>
        </div>
      </motion.div>
    </SharedLayoutTransition>
  );
};

export default PropertyCard;

// import { motion } from 'framer-motion';
// import { Link } from 'wouter';
// import { Property, PropertyData, PropertyStatus, RiskLevel } from '@/lib/types';
// import { useState, useEffect } from 'react';
// import { Trash2 } from 'lucide-react';
// import { SharedLayoutTransition } from '@/components/transitions/SharedLayoutTransition';
// import { ContentTransition } from '@/components/transitions/ContentTransition';
// import { Button } from '@/components/ui/button';

// interface PropertyCardProps {
//   property: Property;
//   compact?: boolean;
//   onDeleteClick?: (property: Property) => void;
// }

// const PropertyCard = ({ property, compact = false, onDeleteClick }: PropertyCardProps) => {
//   const [isValid, setIsValid] = useState(false);
//   const [randomQuality, setRandomQuality] = useState(0);

//   // Validate property data when component mounts and set random quality
//   useEffect(() => {
//     // const validProperty = 
//     //   property && 
//     //   typeof property === 'object' && 
//     //   property.id && 
//     //   property.name && 
//     //   property.address && 
//     //   property.status && 
//     //   property.riskLevel &&
//     //   property.alerts &&
//     //   property.lastInspection;

//     // setIsValid(!!validProperty);

//     // Generate random quality between 10-100 (skewed to create more variation)
//     const random = Math.floor(Math.random() * 91) + 10;
//     // Occasionally create some very poor or excellent results
//     const skewedRandom = Math.random() > 0.8
//       ? (Math.random() > 0.5 ? random + 20 : random - 20)
//       : random;
//     setRandomQuality(Math.min(100, Math.max(0, skewedRandom)));
//   }, [property]);

//   // if (!isValid) {
//   //   return null;
//   // }

//   const handleDeleteClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (onDeleteClick) {
//       onDeleteClick(property);
//     }
//   };

//   const getStatusStyle = (status: string) => {
//     console.log('Current status', status);
//     switch (status) {
//       case 'Compliant':
//         return { bg: 'rgba(10, 145, 85, 0.15)', text: 'var(--brand-green)' };
//       case 'at-risk':
//         return { bg: 'rgba(237, 176, 21, 0.15)', text: 'var(--brand-gold)' };
//       case 'non-compliant':
//         return { bg: 'rgba(163, 67, 15, 0.15)', text: 'var(--brand-rust)' };
//       default:
//         return { bg: 'rgba(66, 42, 29, 0.15)', text: 'var(--brand-dark-brown)' };
//     }
//   };

//   const getRiskText = (risk: RiskLevel) => {
//     switch (risk) {
//       case 'high':
//         return 'High Risk';
//       case 'medium':
//         return 'Medium Risk';
//       case 'low':
//         return 'Low Risk';
//       case 'none':
//         return 'No Risk';
//       default:
//         return 'Unknown';
//     }
//   };

//   const getRiskColor = (risk: RiskLevel) => {
//     switch (risk) {
//       case 'high':
//         return 'var(--brand-rust)';
//       case 'medium':
//         return 'var(--brand-gold)';
//       case 'low':
//         return 'var(--brand-green)';
//       case 'none':
//         return 'var(--brand-dark-green)';
//       default:
//         return 'var(--brand-dark-brown)';
//     }
//   };

//   const alerts = property.riskLevel || { high: 0, medium: 0, low: 0 };
//   const lastInspection = property.lastInspection;// || { date: 'Unknown', daysAgo: 0 };
//   // const lastInspectionDate = new Date(lastInspection);

//   // const today = new Date();
//   // const timeDiff = today.getTime() - lastInspectionDate.getTime();
//   // const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

//   const statusStyle = getStatusStyle(property.status);

//   const cardHeader = (
//     <div className="p-4 border-b border-gray-100">
//       <div className="flex justify-between items-center">
//         <ContentTransition delay={0.1} direction="right">
//           <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
//         </ContentTransition>
//         <ContentTransition delay={0.2} direction="left">
//           <div className="flex items-center gap-2">
//             <span
//               className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
//               style={{
//                 backgroundColor: statusStyle.bg,
//                 color: statusStyle.text
//               }}
//             >
//               {property.status === 'Compliant' ? 'Compliant' :
//                 property.status === 'at-risk' ? 'At Risk' : 'Non-Compliant'}
//             </span>

//             {onDeleteClick && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
//                 onClick={handleDeleteClick}
//                 title="Delete property"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </ContentTransition>
//       </div>
//       <ContentTransition delay={0.3} direction="up">
//         <p className="text-sm text-gray-500 mt-1">{property.address}</p>
//       </ContentTransition>
//     </div>
//   );

//   const cardDetails = !compact && (
//     <div className="px-4 py-3">
//       <ContentTransition delay={0.4} direction="up">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <div className="text-xs text-gray-500">Risk Level</div>
//             <div className="text-sm font-medium mt-1" style={{ color: getRiskColor(property.riskLevel) }}>
//               {getRiskText(property.riskLevel)}
//             </div>
//           </div>
//           <div>
//             <div className="text-xs text-gray-500">Last Inspection</div>
//             <div className="text-sm mt-1">
//               {lastInspection.date}
//               {/* {lastInspectionDate.getDate() + '/' + (lastInspectionDate.getMonth() + 1) + '/' + lastInspectionDate.getFullYear()} */}
//               <span className="text-xs text-gray-500 ml-1">
//                 {/* ({daysAgo} days ago) */}
//                 {lastInspection.daysAgo} days ago
//               </span>
//             </div>
//           </div>
//         </div>
//       </ContentTransition>



//       {/* 
//       <ContentTransition delay={0.5} direction="up">
//         <div className="mt-3">
//           <div className="text-xs text-gray-500 mb-1">Active Alerts</div>
//           <div className="flex flex-wrap gap-1 mb-2">
//             {alerts.high > 0 && (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(163, 67, 15, 0.15)', 
//                   color: 'var(--brand-rust)' 
//                 }}
//               >
//                 {alerts.high} High
//               </span>
//             )}
//             {alerts.medium > 0 && (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(237, 176, 21, 0.15)', 
//                   color: 'var(--brand-gold)' 
//                 }}
//               >
//                 {alerts.medium} Med
//               </span>
//             )}
//             {alerts.low > 0 && (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(10, 145, 85, 0.15)', 
//                   color: 'var(--brand-green)' 
//                 }}
//               >
//                 {alerts.low} Low
//               </span>
//             )}
//             {alerts.high === 0 && alerts.medium === 0 && alerts.low === 0 && (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(11, 74, 46, 0.15)', 
//                   color: 'var(--brand-dark-green)' 
//                 }}
//               >
//                 None
//               </span>
//             )}
//           </div>




//           <div className="mt-2">
//             <div className="flex justify-between text-xs text-gray-500 mb-1">
//               <span>Good</span>
//               <span>Poor</span>
//             </div>
//             <div className="relative h-4 w-full rounded-full overflow-hidden bg-gray-100">
//               <div 
//                 className="absolute inset-0"
//                 style={{
//                   background: `linear-gradient(90deg, 
//                     rgba(16, 185, 129, 0.7) 0%, 
//                     rgba(245, 158, 11, 0.7) 50%, 
//                     rgba(239, 68, 68, 0.7) 100%)`
//                 }}
//               />
//               <div 
//                 className="absolute top-0 bottom-0 left-0 bg-white bg-opacity-70"
//                 style={{
//                   right: `${100 - randomQuality}%`,
//                   transition: 'right 0.5s ease'
//                 }}
//               />





//               <div 
//                 className="absolute top-0 h-4 w-1 bg-gray-900 rounded-full z-10"
//                 style={{
//                   left: `${randomQuality}%`,
//                   transform: 'translateX(-50%)',
//                   transition: 'left 0.5s ease'
//                 }}
//               />
//             </div>
        
//           </div>

//           <ContentTransition delay={0.3} direction="up">
//             <p className="text-sm text-gray-500 mt-1">Deaths from respiratory diseases</p>
//           </ContentTransition>




//         </div>
        
//         <div className="mt-3">
//           <div className="text-xs text-gray-500 mb-1">Property Group</div>
//           <div className="flex flex-wrap gap-1">
//             {property.groupId ? (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(10, 145, 85, 0.15)', 
//                   color: 'var(--brand-green)' 
//                 }}
//               >
//                 {property.groupName || `Group #${property.groupId}`}
//               </span>
//             ) : (
//               <span 
//                 className="px-1.5 py-0.5 rounded text-xs"
//                 style={{ 
//                   backgroundColor: 'rgba(66, 42, 29, 0.15)', 
//                   color: 'var(--brand-dark-brown)' 
//                 }}
//               >
//                 Not assigned to any group
//               </span>
//             )}
//           </div>
//         </div>
//       </ContentTransition> */}





//     </div>
//   );

//   return (
//     <SharedLayoutTransition
//       id={`property-overview-${property.id}`}
//       className="bg-white rounded-lg shadow-sm overflow-hidden transition-all"
//       withScale={true}
//     >
//       <motion.div
//         whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
//         transition={{ duration: 0.2 }}
//       >
//         <div className="relative">
//           <Link href={`/properties/${property.id}`}>
//             <div className="cursor-pointer">
//               {cardHeader}
//               {cardDetails}
//             </div>
//           </Link>
//         </div>
//       </motion.div>
//     </SharedLayoutTransition>
//   );
// };

// export default PropertyCard;