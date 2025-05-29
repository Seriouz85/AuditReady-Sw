/**
 * Animation Provider and Utilities
 * Provides smooth animations and micro-interactions for the Mermaid editor
 */
import React, { createContext, useContext, useRef, useEffect } from 'react';
import { MermaidDesignTokens } from '../design-system/MermaidDesignTokens';

interface AnimationContextType {
  registerElement: (element: HTMLElement, config: AnimationConfig) => void;
  unregisterElement: (element: HTMLElement) => void;
  playAnimation: (element: HTMLElement, animation: keyof typeof animations) => Promise<void>;
}

interface AnimationConfig {
  hover?: boolean;
  focus?: boolean;
  click?: boolean;
  entrance?: keyof typeof animations;
  exit?: keyof typeof animations;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Predefined animations
const animations = {
  fadeIn: {
    keyframes: [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    options: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards' as FillMode
    }
  },
  fadeOut: {
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-10px)' }
    ],
    options: {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards' as FillMode
    }
  },
  slideInLeft: {
    keyframes: [
      { opacity: 0, transform: 'translateX(-20px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ],
    options: {
      duration: 300,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fill: 'forwards' as FillMode
    }
  },
  slideInRight: {
    keyframes: [
      { opacity: 0, transform: 'translateX(20px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ],
    options: {
      duration: 300,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fill: 'forwards' as FillMode
    }
  },
  scaleIn: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.9)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    options: {
      duration: 200,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fill: 'forwards' as FillMode
    }
  },
  scaleOut: {
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.95)' }
    ],
    options: {
      duration: 150,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards' as FillMode
    }
  },
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-5px)' },
      { transform: 'translateY(0)' }
    ],
    options: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fill: 'forwards' as FillMode
    }
  },
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ],
    options: {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      fill: 'forwards' as FillMode
    }
  },
  glow: {
    keyframes: [
      { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
      { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
      { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' }
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards' as FillMode
    }
  },
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' }
    ],
    options: {
      duration: 400,
      easing: 'ease-in-out',
      fill: 'forwards' as FillMode
    }
  }
};

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const elementsRef = useRef(new Map<HTMLElement, AnimationConfig>());

  const registerElement = (element: HTMLElement, config: AnimationConfig) => {
    elementsRef.current.set(element, config);
    
    // Add event listeners based on config
    if (config.hover) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    
    if (config.focus) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    }
    
    if (config.click) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);
    }
    
    // Play entrance animation if specified
    if (config.entrance) {
      playAnimation(element, config.entrance);
    }
  };

  const unregisterElement = (element: HTMLElement) => {
    const config = elementsRef.current.get(element);
    if (config) {
      // Remove event listeners
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      
      // Play exit animation if specified
      if (config.exit) {
        playAnimation(element, config.exit);
      }
    }
    
    elementsRef.current.delete(element);
  };

  const playAnimation = async (element: HTMLElement, animationName: keyof typeof animations): Promise<void> => {
    const animation = animations[animationName];
    if (!animation) return;

    return new Promise((resolve) => {
      const webAnimation = element.animate(animation.keyframes, animation.options);
      webAnimation.onfinish = () => resolve();
    });
  };

  const handleMouseEnter = (event: Event) => {
    const element = event.target as HTMLElement;
    element.style.transform = 'translateY(-2px)';
    element.style.transition = `transform ${MermaidDesignTokens.animation.duration[200]} ${MermaidDesignTokens.animation.easing.out}`;
  };

  const handleMouseLeave = (event: Event) => {
    const element = event.target as HTMLElement;
    element.style.transform = 'translateY(0)';
  };

  const handleFocus = (event: Event) => {
    const element = event.target as HTMLElement;
    playAnimation(element, 'glow');
  };

  const handleBlur = (event: Event) => {
    const element = event.target as HTMLElement;
    element.style.boxShadow = '';
  };

  const handleMouseDown = (event: Event) => {
    const element = event.target as HTMLElement;
    element.style.transform = 'scale(0.98)';
    element.style.transition = `transform ${MermaidDesignTokens.animation.duration[100]} ${MermaidDesignTokens.animation.easing.inOut}`;
  };

  const handleMouseUp = (event: Event) => {
    const element = event.target as HTMLElement;
    element.style.transform = 'scale(1)';
    playAnimation(element, 'bounce');
  };

  const contextValue: AnimationContextType = {
    registerElement,
    unregisterElement,
    playAnimation
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Hook for easy animation usage
export const useElementAnimation = (config: AnimationConfig) => {
  const { registerElement, unregisterElement } = useAnimation();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      registerElement(element, config);
      return () => unregisterElement(element);
    }
  }, [config, registerElement, unregisterElement]);

  return elementRef;
};

// Utility component for animated containers
export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  animation?: AnimationConfig;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, animation = { entrance: 'fadeIn' }, className = '', style = {} }) => {
  const elementRef = useElementAnimation(animation);

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
};

// Preset animated components
export const FadeInContainer: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, className = '', style = {} }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = `opacity 300ms ease-out, transform 300ms ease-out`;
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }, delay);
    }
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ opacity: 0, ...style }}
    >
      {children}
    </div>
  );
};

export const SlideInContainer: React.FC<{
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, direction = 'left', delay = 0, className = '', style = {} }) => {
  const elementRef = useElementAnimation({
    entrance: direction === 'left' ? 'slideInLeft' : 'slideInRight',
    hover: true
  });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
};
