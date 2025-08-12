import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Browser desteğini kontrol et
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkPermission();
    }
  }, []);

  const checkPermission = async () => {
    if (!isSupported) return;
    
    const permission = await Notification.permission;
    setPermission(permission);
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Bu tarayıcı push notifications desteklemiyor!');
      return false;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Bildirim izni verildi!');
        return true;
      } else {
        toast.error('Bildirim izni reddedildi!');
        return false;
      }
    } catch (error) {
      toast.error('Bildirim izni alınırken hata oluştu!');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    setIsLoading(true);
    try {
      // Service Worker'ı kaydet
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Push subscription oluştur
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'your_vapid_public_key')
      });

      // Backend'e subscription gönder
      await sendSubscriptionToServer(subscription);
      
      setSubscription(subscription);
      toast.success('Bildirimler aktif edildi!');
      return subscription;
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('Bildirim aboneliği başarısız!');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return;

    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      
      // Backend'den subscription'ı kaldır
      await removeSubscriptionFromServer(subscription);
      
      setSubscription(null);
      toast.success('Bildirimler devre dışı bırakıldı!');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Bildirim aboneliği kaldırılamadı!');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!subscription) {
      toast.error('Önce bildirimlere abone olun!');
      return;
    }

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          title: 'Test Bildirimi',
          body: 'Bu bir test bildirimidir!',
          icon: '/images/logo.png',
          badge: '/images/badge.png',
          data: {
            url: window.location.href
          }
        })
      });

      if (response.ok) {
        toast.success('Test bildirimi gönderildi!');
      } else {
        toast.error('Test bildirimi gönderilemedi!');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Test bildirimi gönderilemedi!');
    }
  };

  // VAPID key'i Uint8Array'e çevir
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Backend'e subscription gönder
  const sendSubscriptionToServer = async (subscription) => {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: localStorage.getItem('userId')
        })
      });

      if (!response.ok) {
        throw new Error('Subscription kaydedilemedi');
      }
    } catch (error) {
      console.error('Subscription save error:', error);
    }
  };

  // Backend'den subscription kaldır
  const removeSubscriptionFromServer = async (subscription) => {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: localStorage.getItem('userId')
        })
      });

      if (!response.ok) {
        throw new Error('Subscription kaldırılamadı');
      }
    } catch (error) {
      console.error('Subscription remove error:', error);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification
  };
}; 