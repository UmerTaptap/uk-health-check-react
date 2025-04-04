import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SharedLayoutTransitionProps {
  children: ReactNode;
  // ID for the shared element
  id: string | number;
  // Optional className
  className?: string;
  // Optional transition duration in seconds
  duration?: number;
  // Optional scale effect
  withScale?: boolean;
}

/**
 * SharedLayoutTransition component
 * 
 * This component provides smooth layout transitions between views when the same content
 * is displayed in different parts of the UI (e.g., a card in a list view that expands
 * to a full detail view). It uses framer-motion's layoutId to animate the transition.
 */
export const SharedLayoutTransition = ({ 
  children, 
  id, 
  className = "", 
  duration = 0.5,
  withScale = false
}: SharedLayoutTransitionProps) => {
  return (
    <motion.div
      layoutId={`shared-layout-${id}`}
      className={className}
      transition={{ 
        type: "spring",
        stiffness: 300, 
        damping: 30,
        duration
      }}
      initial={withScale ? { scale: 0.9, opacity: 0 } : undefined}
      animate={withScale ? { scale: 1, opacity: 1 } : undefined}
      exit={withScale ? { scale: 0.9, opacity: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default SharedLayoutTransition;