'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowLeft, Heart, Package, Star, ShoppingBag } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:6602/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          toast.error("Ürün bulunamadı!");
        }
      } catch (error) {
        console.error("Ürün yükleme hatası:", error);
        toast.error("Ürün yüklenirken hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }

    // Favorileri kontrol et
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(favs);
    setIsFavorite(favs.includes(productId));
  }, [productId]);

  const toggleFavorite = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Favori eklemek için giriş yapmalısınız!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:6602/api/users/toggle-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        let updated;
        if (isFavorite) {
          updated = favorites.filter(id => id !== productId);
        } else {
          updated = [...favorites, productId];
        }
        setFavorites(updated);
        setIsFavorite(!isFavorite);
        localStorage.setItem("favorites", JSON.stringify(updated));
        
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Favori işlemi başarısız');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      toast.error('Favori işlemi sırasında hata oluştu');
    }
  };

  const addToStock = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        toast.error('Giriş yapmanız gerekiyor!');
        return;
      }

      const response = await fetch(`http://localhost:6602/api/users/user-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          productId: product._id,
          quantity: 1
        })
      });

      if (response.ok) {
        toast.success(`${product.name} stoklarınıza eklendi!`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Stoklara eklenirken hata oluştu!');
      }
    } catch (err) {
      console.error('addToStock hatası:', err);
      toast.error('Stoklara eklenirken hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ürün Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Aradığınız ürün mevcut değil.</p>
          <Link 
            href="/urunler"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/urunler"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Ürünlere Dön</span>
            </Link>
            
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isFavorite 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="font-medium">{isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative bg-gray-100 dark:bg-gray-700 p-8 flex items-center justify-center">
              <div className="relative">
                <img
                  src={product.image || "/images/default-product.jpg"}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12">
              <div className="space-y-6">
                {/* Product Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                      {product.category || 'Genel'}
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
                      Stok: {product.stock}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {product.price}₺
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-lg">KDV Dahil</span>
                  </div>
                </div>

                {/* Product Description */}
                {product.description && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ürün Açıklaması</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Product Features */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Özellikler</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Stok Durumu</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {product.stock > 0 ? `${product.stock} adet mevcut` : 'Stokta yok'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Kategori</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{product.category || 'Genel'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={addToStock}
                      disabled={product.stock <= 0}
                      className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      <Package className="w-5 h-5" />
                      {product.stock > 0 ? 'Stoklara Ekle' : 'Stokta Yok'}
                    </button>

                    <button
                      onClick={toggleFavorite}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                        isFavorite 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' 
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
