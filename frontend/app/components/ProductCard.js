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
      className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm p-1 flex flex-col items-center transition-all duration-300 hover:shadow-md group w-full"
    >
      {/* Favori Butonu - Sağ üst köşede, Link'den bağımsız */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Kalp butonu tıklandı, favori işlemi yapılıyor:', product._id);
          toggleFavorite(product._id);
        }}
        className="absolute top-0 right-0 text-xs sm:text-xl md:text-2xl hover:scale-125 transition-transform z-30 bg-white/80 dark:bg-gray-800/80 rounded-full p-0.5 sm:p-1.5 md:p-2 shadow-sm"
        title={favorites.includes(product._id) ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {favorites.includes(product._id) ? "❤️" : "🤍"}
      </button>

      <div className="flex flex-col items-center w-full">
        <img
          src={product.image || "/images/default-product.jpg"}
          alt={product.name}
          className="w-8 h-8 sm:w-16 sm:h-16 md:w-28 md:h-28 object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm mb-1 sm:mb-2 md:mb-4 bg-white dark:bg-gray-700"
        />
        <h2 className="text-xs font-bold text-gray-800 dark:text-white mb-0.5 text-center leading-tight">{product.name}</h2>
        <p className="text-xs font-bold mb-0.5 text-blue-600 dark:text-blue-400 text-center">
          {product.price}₺
        </p>
        <span className={`text-xs font-semibold mb-1 ${product.stock < 5 ? 'text-red-500' : 'text-green-500'} text-center`}>
          Stok: {product.stock}
        </span>
        
        {/* Barkod Bilgisi - Sadece bilgisayarda göster */}
        {product.barcodes && product.barcodes.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 mb-1 sm:mb-2">
            <Barcode className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
            <span className="text-xs text-white/80">
              {product.barcodes.length} Barkod
            </span>
          </div>
        )}
      </div>
      
      {/* Kart tıklama alanı - Kalp butonunu hariç tutuyor */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Kart tıklandı, ürün detayına gidiliyor:', product._id);
          window.location.href = `/urunler/${product._id}`;
        }}
        className="absolute top-0 left-0 right-8 bottom-12 z-10 cursor-pointer"
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
        className="mt-0.5 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-0.5 sm:py-2 md:py-2 px-1 sm:px-3 md:px-4 rounded transition-all duration-300 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
      >
        {addToStock ? "Stoklara Ekle" : "Sepete Ekle"}
      </button>
    </div>
  );
} 