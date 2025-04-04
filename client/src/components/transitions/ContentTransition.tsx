import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ContentTransitionProps {
  children: ReactNode;
  // Delay before animation starts
  delay?: number;
  // Direction for the animation
  direction?: 'up' | 'down' | 'left' | 'right';
  // Type of animation - fade, slide, or both
  type?: 'fade' | 'slide' | 'combined';
  // Duration of the animation
  duration?: number;
  // Additional className
  className?: string;
}

/**
 * ContentTransition component
 * 
 * This component provides smooth entry/exit animations for content sections
 * with configurable direction, delay, and animation type.
 */
export const ContentTransition = ({ 
  children, 
  delay = 0, 
  direction = 'up', 
  type = 'combined',
  duration = 0.5,
  className = ""
}: ContentTransitionProps) => {
  // Calculate animation properties based on direction and type
  let initialProps: any = {};
  let animateProps: any = {};
  let exitProps: any = {};
  
  // Set opacity values
  initialProps.opacity = type === 'slide' ? 1 : 0;
  animateProps.opacity = 1;
  exitProps.opacity = type === 'slide' ? 1 : 0;
  
  // Add movement based on direction if type is 'slide' or 'combined'
  if (type !== 'fade') {
    const distance = 20; // pixels to move during animation
    
    if (direction === 'up') {
      initialProps.y = distance;
      animateProps.y = 0;
      exitProps.y = distance;
    } else if (direction === 'down') {
      initialProps.y = -distance;
      animateProps.y = 0;
      exitProps.y = -distance;
    } else if (direction === 'left') {
      initialProps.x = distance;
      animateProps.x = 0;
      exitProps.x = distance;
    } else if (direction === 'right') {
      initialProps.x = -distance;
      animateProps.x = 0;
      exitProps.x = -distance;
    }
  }
  
  return (
    <motion.div
      className={className}
      initial={initialProps}
      animate={animateProps}
      exit={exitProps}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0] // Custom easing curve
      }}
    >
      {children}
    </motion.div>
  );
};

export default ContentTransition;