import { useEffect, useRef, useState } from 'react';

export const useSwipeGestures = (onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      setIsSwiping(true);
      setSwipeDirection(null);
    };

    const handleTouchMove = (e) => {
      currentX.current = e.touches[0].clientX;
      currentY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const deltaX = currentX.current - startX.current;
      const deltaY = currentY.current - startY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Minimum hareket kontrolü
      if (absDeltaX < threshold && absDeltaY < threshold) {
        setIsSwiping(false);
        return;
      }

      // Hangi yöne daha fazla hareket var?
      if (absDeltaX > absDeltaY) {
        // Yatay hareket
        if (deltaX > threshold) {
          setSwipeDirection('right');
          onSwipeRight && onSwipeRight();
        } else if (deltaX < -threshold) {
          setSwipeDirection('left');
          onSwipeLeft && onSwipeLeft();
        }
      } else {
        // Dikey hareket
        if (deltaY > threshold) {
          setSwipeDirection('down');
          onSwipeDown && onSwipeDown();
        } else if (deltaY < -threshold) {
          setSwipeDirection('up');
          onSwipeUp && onSwipeUp();
        }
      }

      // Animasyon için kısa bir gecikme
      setTimeout(() => {
        setIsSwiping(false);
        setSwipeDirection(null);
      }, 300);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    ref: elementRef,
    isSwiping,
    swipeDirection,
    style: {
      transform: isSwiping ? `scale(0.95)` : 'scale(1)',
      transition: 'transform 0.2s ease'
    }
  };
}; 