/**
 * Animation Utilities for MASTER PISETH Admin Dashboard
 * Optimized for smooth 60fps animations with luxury glassmorphism theme
 */

// Motion/Framer Motion animation variants for consistent animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

// Staggered children animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
};

// Table row animation with stagger
export const tableRowAnimation = (index: number) => ({
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { 
    duration: 0.2, 
    delay: index * 0.02,
    ease: [0.4, 0, 0.2, 1]
  }
});

// Modal/Dialog animation
export const modalAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
};

// Dropdown animation
export const dropdownAnimation = {
  initial: { opacity: 0, scale: 0.95, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -5 },
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
};

// Loading spinner animation
export const spinnerAnimation = {
  animate: {
    rotate: 360
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
};

// Pulse animation for notifications
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Smooth page transition
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

// CSS class names for Tailwind CSS animations
export const cssAnimations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-300',
  slideInFromRight: 'animate-in slide-in-from-right-4 duration-300',
  zoomIn: 'animate-in zoom-in-95 duration-200',
  zoomOut: 'animate-out zoom-out-95 duration-200',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
};

// Easing functions
export const easings = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 }
};

// Performance optimization: Use transform and opacity only
export const performantAnimation = {
  initial: { opacity: 0, transform: 'translateY(10px)' },
  animate: { opacity: 1, transform: 'translateY(0)' },
  exit: { opacity: 0, transform: 'translateY(-10px)' },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
};
