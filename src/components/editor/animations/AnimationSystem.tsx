/**
 * Advanced Animation System for AR Editor
 * Framer Motion-based animations with performance optimization and accessibility
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Node, Edge } from 'reactflow';

// Animation configuration types
interface AnimationConfig {
  duration: number;
  ease: string | number[];
  delay?: number;
  stagger?: number;
  respectsReducedMotion?: boolean;
}

// Predefined animation variants
export const animationVariants = {
  // Node animations
  nodeEntry: {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -10,
      filter: 'blur(2px)',
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  nodeHover: {
    initial: { scale: 1, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    hover: { 
      scale: 1.02, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    }
  },

  nodeSelection: {
    initial: { 
      borderColor: 'transparent',
      borderWidth: 1
    },
    selected: { 
      borderColor: '#3b82f6',
      borderWidth: 2,
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  },

  // Edge animations
  edgeEntry: {
    initial: { 
      pathLength: 0,
      opacity: 0
    },
    animate: { 
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.6, ease: 'easeInOut' },
        opacity: { duration: 0.3, ease: 'easeOut' }
      }
    },
    exit: {
      pathLength: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  },

  edgeFlow: {
    animate: {
      strokeDashoffset: [-20, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  },

  // Panel animations
  panelSlide: {
    initial: { x: -300, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  },

  panelFade: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Loading animations
  loadingPulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [0.98, 1.02, 0.98],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut'
      }
    }
  },

  loadingSpinner: {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: 'linear'
      }
    }
  },

  // Tooltip animations
  tooltipScale: {
    initial: { 
      opacity: 0, 
      scale: 0.9, 
      y: 10 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.15,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 5,
      transition: {
        duration: 0.1,
        ease: 'easeIn'
      }
    }
  },

  // Toast notifications
  toastSlide: {
    initial: { 
      opacity: 0, 
      x: 300, 
      scale: 0.9 
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      x: 300, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  },

  // Stagger container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  },

  // Micro-interactions
  buttonPress: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.1 }
  },

  iconBounce: {
    whileHover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    whileTap: {
      y: 0,
      transition: {
        duration: 0.1
      }
    }
  },

  // Layout shift animations
  layoutShift: {
    layout: true,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  }
};

// Animation wrapper components
interface AnimatedNodeProps {
  children: React.ReactNode;
  isVisible: boolean;
  isSelected: boolean;
  delay?: number;
  onAnimationComplete?: () => void;
}

export const AnimatedNode: React.FC<AnimatedNodeProps> = ({
  children,
  isVisible,
  isSelected,
  delay = 0,
  onAnimationComplete
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={prefersReducedMotion ? {} : animationVariants.nodeEntry}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={onAnimationComplete}
          style={{ 
            transformOrigin: 'center',
            willChange: 'transform, opacity'
          }}
          transition={{ delay }}
        >
          <motion.div
            variants={prefersReducedMotion ? {} : animationVariants.nodeHover}
            whileHover={!prefersReducedMotion ? 'hover' : {}}
            whileTap={!prefersReducedMotion ? 'tap' : {}}
          >
            <motion.div
              variants={prefersReducedMotion ? {} : animationVariants.nodeSelection}
              animate={isSelected ? 'selected' : 'initial'}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedEdgeProps {
  children: React.ReactNode;
  isVisible: boolean;
  isAnimated?: boolean;
  delay?: number;
}

export const AnimatedEdge: React.FC<AnimatedEdgeProps> = ({
  children,
  isVisible,
  isAnimated = false,
  delay = 0
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={prefersReducedMotion ? {} : animationVariants.edgeEntry}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay }}
        >
          {isAnimated && !prefersReducedMotion ? (
            <motion.div
              variants={animationVariants.edgeFlow}
              animate="animate"
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  type?: 'slide' | 'fade';
}

export const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  children,
  isOpen,
  direction = 'left',
  type = 'slide'
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  const getVariants = () => {
    if (prefersReducedMotion) return {};
    
    if (type === 'fade') {
      return animationVariants.panelFade;
    }
    
    const slideVariants = { ...animationVariants.panelSlide };
    
    switch (direction) {
      case 'right':
        slideVariants.initial = { x: 300, opacity: 0 };
        slideVariants.exit = { x: 300, opacity: 0 };
        break;
      case 'top':
        slideVariants.initial = { y: -300, opacity: 0 };
        slideVariants.exit = { y: -300, opacity: 0 };
        break;
      case 'bottom':
        slideVariants.initial = { y: 300, opacity: 0 };
        slideVariants.exit = { y: 300, opacity: 0 };
        break;
    }
    
    return slideVariants;
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.1
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : {
        ...animationVariants.staggerContainer,
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      initial="initial"
      animate="animate"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={prefersReducedMotion ? {} : animationVariants.staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface AnimatedTooltipProps {
  children: React.ReactNode;
  isVisible: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  isVisible,
  placement = 'top'
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={prefersReducedMotion ? {} : animationVariants.tooltipScale}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            transformOrigin: placement === 'top' ? 'bottom center' : 
                           placement === 'bottom' ? 'top center' :
                           placement === 'left' ? 'right center' :
                           'left center',
            willChange: 'transform, opacity'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading animation components
export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#3b82f6'
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : animationVariants.loadingSpinner}
      animate={prefersReducedMotion ? {} : 'animate'}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}20`,
        borderTopColor: color,
        borderRadius: '50%',
        willChange: 'transform'
      }}
    />
  );
};

export const LoadingPulse: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : animationVariants.loadingPulse}
      animate={prefersReducedMotion ? {} : 'animate'}
    >
      {children}
    </motion.div>
  );
};

// Performance optimization utilities
export const useAnimationFrame = (callback: (time: number) => void) => {
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
};

// Animation performance monitor
export const useAnimationPerformance = () => {
  const [metrics, setMetrics] = React.useState({
    averageFPS: 60,
    frameDrops: 0,
    animationsActive: 0
  });

  const frameTimeRef = React.useRef<number[]>([]);
  const animationCountRef = React.useRef(0);

  const trackAnimation = React.useCallback((isActive: boolean) => {
    if (isActive) {
      animationCountRef.current++;
    } else {
      animationCountRef.current = Math.max(0, animationCountRef.current - 1);
    }

    setMetrics(prev => ({
      ...prev,
      animationsActive: animationCountRef.current
    }));
  }, []);

  useAnimationFrame((deltaTime) => {
    frameTimeRef.current.push(deltaTime);
    
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift();
    }
    
    if (frameTimeRef.current.length >= 30) {
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
      const fps = 1000 / avgFrameTime;
      const frameDrops = frameTimeRef.current.filter(time => time > 16.67).length;
      
      setMetrics(prev => ({
        ...prev,
        averageFPS: Math.round(fps),
        frameDrops
      }));
    }
  });

  return { metrics, trackAnimation };
};

export default {
  animationVariants,
  AnimatedNode,
  AnimatedEdge,
  AnimatedPanel,
  AnimatedList,
  AnimatedTooltip,
  LoadingSpinner,
  LoadingPulse,
  useAnimationFrame,
  useAnimationPerformance
};