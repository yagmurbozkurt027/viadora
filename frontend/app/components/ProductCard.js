'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Barcode } from 'lucide-react';

export default function ProductCard({ product, favorites, toggleFavorite, addToStock, addToCart }) {
  const router = useRouter();

  return (
    <div
      className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-lg p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col items-center transition-all duration-300 group w-full min-h-[120px] sm:min-h-[140px] md:min-h-[180px] lg:min-h-[220px]"
    >
      {/* Favori Butonu - Sağ üst köşede, Link'den bağımsız */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Kalp butonu tıklandı, favori işlemi yapılıyor:', product._id);
          toggleFavorite(product._id);
        }}
        className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 lg:top-4 lg:right-4 text-lg sm:text-xl md:text-2xl lg:text-3xl hover:scale-125 transition-transform z-30 bg-white/90 dark:bg-gray-800/90 rounded-full p-1 sm:p-1.5 md:p-2 lg:p-3 shadow-md"
        title={favorites.includes(product._id) ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {favorites.includes(product._id) ? "❤️" : "🤍"}
      </button>

      <div className="flex flex-col items-center w-full h-full justify-between">
        {/* Ürün Resmi */}
        <img
          src={product.image || "/images/default-product.jpg"}
          alt={product.name}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mb-2 sm:mb-3 md:mb-4 bg-white dark:bg-gray-700"
        />
        
        {/* Ürün Bilgileri */}
        <div className="text-center flex-1 flex flex-col justify-center w-full">
          <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 text-center leading-tight line-clamp-2">
            {product.name}
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-blue-600 dark:text-blue-400 text-center">
            {product.price}₺
          </p>
          
          <span className={`text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 ${product.stock < 5 ? 'text-red-500' : 'text-green-500'} text-center`}>
            Stok: {product.stock}
          </span>
          
          {/* Barkod Bilgisi - Sadece masaüstünde göster */}
          {product.barcodes && product.barcodes.length > 0 && (
            <div className="hidden md:flex items-center justify-center gap-1 mb-2 lg:mb-3">
              <Barcode className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                {product.barcodes.length} Barkod
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Kart tıklama alanı - Kalp butonunu hariç tutuyor */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Kart tıklandı, ürün detayına gidiliyor:', product._id);
          window.location.href = `/urunler/${product._id}`;
        }}
        className="absolute top-0 left-0 right-8 bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 z-10 cursor-pointer"
        aria-label={`${product.name} detaylarını görüntüle`}
      />
      
      {/* Sepete Ekle Butonu */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('ProductCard buton tıklandı:', { product, addToCart: !!addToCart, addToStock: !!addToStock });
          if (addToStock) {
            console.log('addToStock çağrılıyor');
            addToStock(product);
          } else if (addToCart) {
            console.log('addToCart çağrılıyor');
            addToCart(product);
          } else {
            console.log('Hiçbir fonksiyon bulunamadı!');
          }
        }}
        disabled={product.stock <= 0}
        className="mt-2 sm:mt-3 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 sm:py-2.5 md:py-3 lg:py-4 px-2 sm:px-3 md:px-4 lg:px-6 rounded-md transition-all duration-300 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base lg:text-lg hover:scale-105 active:scale-95"
      >
        {addToStock ? "Stoklara Ekle" : "Sepete Ekle"}
      </button>
    </div>
  );
} 