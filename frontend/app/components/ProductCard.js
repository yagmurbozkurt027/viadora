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
      className="relative bg-gradient-to-br from-blue-900/80 to-purple-900/80 border-2 border-blue-400/60 rounded-2xl shadow-xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-blue-400/60 group"
    >
      {/* Favori Butonu - Sağ üst köşede, Link'den bağımsız */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Kalp butonu tıklandı, favori işlemi yapılıyor:', product._id);
          toggleFavorite(product._id);
        }}
        className="absolute top-1 right-1 text-2xl hover:scale-150 transition-transform z-30 bg-black/40 rounded-full p-2"
        title={favorites.includes(product._id) ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {favorites.includes(product._id) ? "❤️" : "🤍"}
      </button>

      
      <div className="flex flex-col items-center w-full">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-gradient-to-r from-blue-400 via-white to-purple-400 rounded-full blur-2xl opacity-60 transition" />
        <img
          src={product.image || "/images/default-product.jpg"}
          alt={product.name}
          className="w-28 h-28 object-cover rounded-xl border-4 border-white shadow-xl mb-4 bg-white/60"
        />
        <h2 className="text-lg font-extrabold text-white mb-1 drop-shadow-lg tracking-wide uppercase text-center">{product.name}</h2>
        <p className="text-base font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg text-center">
          {product.price}₺
        </p>
        <span className={`text-base font-semibold mb-3 ${product.stock < 5 ? 'text-red-400' : 'text-green-300'} drop-shadow text-center`}>
          Stok: {product.stock}
        </span>
        
        {/* Barkod Bilgisi */}
        {product.barcodes && product.barcodes.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Barcode className="w-4 h-4 text-white/80" />
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
        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
      >
        {addToStock ? "Stoklara Ekle" : "Sepete Ekle"}
      </button>
    </div>
  );
} 