import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PropertyTransitionProps {
  children: ReactNode;
  // Property ID to use for keying animations
  propertyId?: string;
  // Optional direction for transitions
  direction?: 'right' | 'left' | 'up' | 'down';
}

export const PropertyTransition = ({ 
  children, 
  propertyId = 'default',
  direction = 'right'
}: PropertyTransitionProps) => {
  const getVariants = () => {
    const distance = 50; // pixels to move during animation
    
    switch (direction) {
      case 'right':
        return {
          initial: { x: -distance, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: distance, opacity: 0 }
        };
      case 'left':
        return {
          initial: { x: distance, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -distance, opacity: 0 }
        };
      case 'up':
        return {
          initial: { y: distance, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -distance, opacity: 0 }
        };
      case 'down':
        return {
          initial: { y: -distance, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: distance, opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };
  
  const variants = getVariants();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={propertyId}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyTransition;