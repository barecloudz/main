import { useEffect, useRef } from 'react';
import { motion, useAnimation, Variant, Variants } from 'framer-motion';

// Reusable animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

export const slideUp: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
};

export const slideDown: Variants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
};

export const slideLeft: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
};

export const slideRight: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
};

export const scale: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.8 } }
};

export const staggerChildren = (staggerTime: number = 0.1): Variant => ({
  transition: { staggerChildren: staggerTime }
});

// Lightning animation for "More Growth, More Clients Guaranteed" section
export const lightningAnimation: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.8, 0, 0.6, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 6,
    }
  }
};

// Robot box filling animation
export const robotBoxFill: Variants = {
  initial: { height: 0 },
  animate: { 
    height: '100%',
    transition: { 
      duration: 1.5, 
      ease: "easeOut"
    }
  },
  hover: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: { duration: 0.3 }
  }
};

// Float animation for service boxes
export const floatAnimation = (delay: number = 0): Variants => ({
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }
  }
});

// Custom hook for scroll-triggered animations
export function useScrollAnimation() {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls]);

  return { ref, controls, variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } } };
}

// Animation component that triggers when in viewport
export const AnimateWhenVisible: React.FC<{
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
}> = ({ children, variants = fadeIn, className = '' }) => {
  const { ref, controls } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
