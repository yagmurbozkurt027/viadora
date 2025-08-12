import { useEffect, useRef, useState } from 'react';

// Fade In animasyonu
export const useFadeIn = (duration = 1000, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return {
    ref: elementRef,
    className: `transition-opacity duration-${duration} ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`
  };
};

// Slide In animasyonu
export const useSlideIn = (direction = 'up', duration = 1000, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return isVisible ? 'translateY(0)' : 'translateY(50px)';
      case 'down':
        return isVisible ? 'translateY(0)' : 'translateY(-50px)';
      case 'left':
        return isVisible ? 'translateX(0)' : 'translateX(50px)';
      case 'right':
        return isVisible ? 'translateX(0)' : 'translateX(-50px)';
      default:
        return isVisible ? 'translateY(0)' : 'translateY(50px)';
    }
  };

  return {
    ref: elementRef,
    style: {
      transform: getTransform(),
      transition: `transform ${duration}ms ease-out`,
      opacity: isVisible ? 1 : 0,
      transitionDelay: `${delay}ms`
    }
  };
};

// Scale animasyonu
export const useScale = (duration = 500, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return {
    ref: elementRef,
    style: {
      transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      transition: `transform ${duration}ms ease-out`,
      opacity: isVisible ? 1 : 0,
      transitionDelay: `${delay}ms`
    }
  };
};

// Bounce animasyonu
export const useBounce = (duration = 1000, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return {
    ref: elementRef,
    style: {
      transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
      transition: `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
      opacity: isVisible ? 1 : 0,
      transitionDelay: `${delay}ms`
    }
  };
};

// Pulse animasyonu
export const usePulse = (duration = 2000) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), duration / 2);
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  return {
    ref: elementRef,
    style: {
      transform: isPulsing ? 'scale(1.05)' : 'scale(1)',
      transition: `transform ${duration / 2}ms ease-in-out`
    }
  };
};

// Shake animasyonu
export const useShake = (trigger) => {
  const [isShaking, setIsShaking] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [trigger]);

  return {
    ref: elementRef,
    style: {
      animation: isShaking ? 'shake 0.5s ease-in-out' : 'none'
    }
  };
};

// Loading spinner animasyonu
export const useLoadingSpinner = (isLoading) => {
  return {
    className: isLoading ? 'animate-spin' : '',
    style: {
      animation: isLoading ? 'spin 1s linear infinite' : 'none'
    }
  };
};

// Parallax efekti
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref: elementRef,
    style: {
      transform: `translateY(${offset}px)`
    }
  };
}; 