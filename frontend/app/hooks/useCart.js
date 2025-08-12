import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  // Sepeti localStorage'dan yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sepeti localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Sepete ürün ekle
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      
      if (existingItem) {
        // Ürün zaten sepette varsa miktarını artır
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Yeni ürün ekle
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    toast.success(`${product.name} sepete eklendi!`);
  };

  // Sepetten ürün kaldır
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.success('Ürün sepetten kaldırıldı!');
  };

  // Ürün miktarını güncelle
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Sepeti temizle
  const clearCart = () => {
    setCart([]);
    toast.success('Sepet temizlendi!');
  };

  // Toplam fiyat hesapla
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Toplam ürün sayısı
  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Sepet boş mu?
  const isCartEmpty = () => {
    return cart.length === 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartEmpty
  };
}; 