"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from 'react-toastify';
import { useFadeIn, useSlideIn, useScale } from '../hooks/useAnimations';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';

export default function UrunlerPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");


  
  const fetchProducts = async () => {
    try {
      console.log("Ürünler yükleniyor...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://butik-proje-1y7w6wirb-yagmurs-projects-54afa3cf.vercel.app'}/api/products`);
      console.log("API Response status:", res.status);
      console.log("API Response ok:", res.ok);
      
      if (!res.ok) throw new Error("Ürünler yüklenirken hata oluştu");
      
      const data = await res.json();
      console.log("API Response data:", data);
      console.log("Ürün sayısı:", data.length);
      
      setProducts(data);
    } catch (err) {
      console.error("Ürün yükleme hatası:", err);
      toast.error("Ürünler yüklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const pullToRefresh = usePullToRefresh(fetchProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(favs);
  }, []);

  useEffect(() => {
    console.log("Filtreleme useEffect çalıştı - Products:", products.length);
    
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (priceRange.min !== "") {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log("Filtered products:", filtered.length);
    setFilteredProducts(filtered);
  }, [products, search, selectedCategory, priceRange, sortBy, sortOrder]);

  const toggleFavorite = async (productId) => {
    console.log('toggleFavorite çağrıldı:', productId);
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Favori eklemek için giriş yapmalısınız!");
      return;
    }

    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://butik-proje-1y7w6wirb-yagmurs-projects-54afa3cf.vercel.app'}/api/users/toggle-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.isFavorite) {
          toast.success(data.message);
        } else {
          toast.info(data.message);
        }
        
        let updated;
        if (favorites.includes(productId)) {
          updated = favorites.filter(id => id !== productId);
        } else {
          updated = [...favorites, productId];
        }
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        
        if (data.points) {
          toast.success(`+${data.points - (favorites.includes(productId) ? 0 : 5)} puan kazandın!`);
        }
      } else {
        toast.error(data.error || 'Favori işlemi başarısız');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      toast.error('Favori işlemi sırasında hata oluştu');
    }
  };

  const addToStock = async (product) => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('addToStock çağrıldı:', { product, userId, token: !!token });
      
      if (!userId || !token) {
        toast.error('Giriş yapmanız gerekiyor!');
        return;
      }

      const requestBody = {
        userId: userId,
        productId: product._id,
        quantity: 1
      };
      
      console.log('API isteği gönderiliyor:', requestBody);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://butik-proje-1y7w6wirb-yagmurs-projects-54afa3cf.vercel.app'}/api/users/user-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('API yanıtı:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const result = await response.json();
        console.log('API başarılı:', result);
        toast.success(`${product.name} stoklarınıza eklendi!`);
      } else {
        const error = await response.json();
        console.error('API hatası:', error);
        toast.error(error.message || 'Stoklara eklenirken hata oluştu!');
      }
    } catch (err) {
      console.error('addToStock hatası:', err);
      toast.error('Stoklara eklenirken hata oluştu!');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  console.log("Render - Products:", products.length, "Filtered:", filteredProducts.length);

      const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div 
      ref={pullToRefresh.ref}
      style={pullToRefresh.style}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 relative z-10 w-full overflow-x-hidden overflow-y-auto"
    >
      {/* Pull-to-Refresh Indicator */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center">
        <div 
          className={`transition-all duration-300 ${
            pullToRefresh.isRefreshing 
              ? 'opacity-100 translate-y-4' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          {pullToRefresh.isRefreshing && (
            <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Pull-to-Refresh Text */}
      <div className="fixed top-16 left-0 right-0 z-20 flex justify-center">
        <div 
          className={`transition-all duration-300 text-sm ${
            pullToRefresh.pullDistance > 40 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2'
          }`}
        >
          {pullToRefresh.pullDistance > 40 && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
              {pullToRefresh.pullDistance >= 80 ? 'Bırakın ve yenileyin' : 'Aşağı çekin ve yenileyin'}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Başlık */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl md:text-3xl">🛍️</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3">
            Ürünlerimiz
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            En kaliteli ürünlerimizi keşfedin ve favorilerinizi bulun
          </p>
        </div>
      
      {/* Arama ve Filtreleme Bölümü */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-5 md:p-6 mb-6 border border-white/20 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {/* Arama */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              🔍 Ürün Ara
            </label>
            <input
              type="text"
              placeholder="Ürün adı veya açıklama..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-400"
            />
          </div>

          {/* Kategori Filtresi */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              📂 Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "Tüm Kategoriler" : category}
                </option>
              ))}
            </select>
          </div>

          {/* Fiyat Aralığı */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              💰 Fiyat Aralığı
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min ₺"
                value={priceRange.min}
                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Max ₺"
                value={priceRange.max}
                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-400"
              />
            </div>
          </div>

          {/* Sıralama */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              📊 Sıralama
            </label>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base cursor-pointer"
              >
                <option value="name">İsim</option>
                <option value="price">Fiyat</option>
                <option value="category">Kategori</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-semibold"
                title={sortOrder === "asc" ? "Artan" : "Azalan"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Filtreleri Temizle */}
        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm">✨</span>
            </div>
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
              {filteredProducts.length} ürün bulundu
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setPriceRange({ min: "", max: "" });
              setSortBy("name");
              setSortOrder("asc");
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg font-semibold flex items-center gap-2"
          >
            🗑️ Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun ürün bulunamadı.</p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              addToStock={addToStock}
              addToCart={addToCart}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
}
