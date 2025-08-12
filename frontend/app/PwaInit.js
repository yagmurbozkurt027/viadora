'use client';
import { useEffect } from 'react';

export default function PwaInit() {
  useEffect(() => {
    // Service Worker'ı geçici olarak devre dışı bırak
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/sw.js')
    //     .then((registration) => {
    //       console.log('SW registered: ', registration);
    //     })
    //     .catch((registrationError) => {
    //       console.log('SW registration failed: ', registrationError);
    //     });
    // }
  }, []);

  return null;
}
