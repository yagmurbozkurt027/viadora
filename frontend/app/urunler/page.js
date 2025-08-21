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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products`);
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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/toggle-favorite`, {
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

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/user-stock`, {
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
    return <div className="text-center mt-10">Ürünler yükleniyor...</div>;
  }

  console.log("Render - Products:", products.length, "Filtered:", filteredProducts.length);

      const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div 
      ref={pullToRefresh.ref}
      style={pullToRefresh.style}
      className="h-screen bg-white dark:bg-gray-900 p-0 md:p-8 relative z-10 w-full overflow-x-hidden overflow-y-auto"
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
        <div className="text-center mb-1 sm:mb-4">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1">
            🛍️ Ürünlerimiz
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            En kaliteli ürünlerimizi keşfedin
          </p>
        </div>
      
      {/* Arama ve Filtreleme Bölümü */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0 mb-1 max-w-full overflow-hidden"
      >
        <div className="grid grid-cols-1 gap-0 mb-1">
          {/* Arama */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
              🔍 Arama
            </label>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-0 py-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>

          {/* Kategori Filtresi */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
              📂 Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-0 py-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "Tüm Kategoriler" : category}
                </option>
              ))}
            </select>
          </div>

          {/* Fiyat Aralığı */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
              💰 Fiyat Aralığı
            </label>
            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-0 py-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-0 py-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              />
            </div>
          </div>

          {/* Sıralama */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
              📊 Sıralama
            </label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-0 py-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="name">İsim</option>
                <option value="price">Fiyat</option>
                <option value="category">Kategori</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-0 py-0 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                title={sortOrder === "asc" ? "Artan" : "Azalan"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Filtreleri Temizle */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-800 dark:text-gray-400">
            {filteredProducts.length} ürün bulundu
          </div>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setPriceRange({ min: "", max: "" });
              setSortBy("name");
              setSortOrder("asc");
            }}
            className="px-1 py-0 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs"
          >
            🗑️ Filtreleri Temizle
          </button>
        </div>
              </div>
        <div 
          className="grid grid-cols-2 gap-3 w-full"
        >
                  <div className="col-span-full text-center text-gray-700 dark:text-gray-500 mb-1 text-xs">
          {filteredProducts.length} ürün bulundu
        </div>
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500">Hiç ürün bulunamadı.</div>
        )}
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToStock={addToStock}
            addToCart={addToCart}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
