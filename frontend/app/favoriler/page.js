'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function FavorilerPage() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(favs);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const favoriteProducts = products.filter(p => favorites.includes(p._id));

  const removeFromFavorites = async (id) => {
    if (loading) return; // Çift tıklamayı önle
    
    setLoading(true);
    
    try {
      // Mevcut favorileri al
      const currentFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      
      // ID'yi favorilerden çıkar
      const updatedFavorites = currentFavorites.filter(favId => favId !== id);
      
      // LocalStorage'ı güncelle
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      
      // State'i güncelle
      setFavorites(updatedFavorites);
      
      // Başarı mesajı göster
      toast.success("Ürün favorilerden çıkarıldı!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      console.log(`Ürün favorilerden çıkarıldı: ${id}`);
      console.log('Güncellenmiş favoriler:', updatedFavorites);
      
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      toast.error("Favorilerden çıkarma işlemi başarısız!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            ❤️ Favorilerim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beğendiğiniz ürünlerinizi buradan takip edin
          </p>
        </div>
        
        {/* Ürün Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Henüz favori ürününüz yok
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Beğendiğiniz ürünleri favorilere ekleyerek buradan takip edebilirsiniz
              </p>
              <Link 
                href="/urunler"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🛍️ Ürünlere Git
              </Link>
            </div>
          ) : (
            favoriteProducts.map(product => (
              <div
                key={product._id}
                className="relative bg-gradient-to-br from-blue-900/80 to-purple-900/80 border-2 border-blue-400/60 rounded-2xl shadow-xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-blue-400/60 group"
              >
                {/* Swipe Hints */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 text-xs text-white/60">← Stoklara Ekle</div>
                  <div className="absolute top-2 right-2 text-xs text-white/60">Favori →</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white/60">↑ Detay</div>
                </div>

                <Link
                  href={`/urunler/${product._id}`}
                  className="w-full flex flex-col items-center"
                >
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
                </Link>
                
                <button
                  onClick={() => removeFromFavorites(product._id)}
                  disabled={loading}
                  className={`mt-3 w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? '⏳ İşleniyor...' : '❤️ Favorilerden Çıkar'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
