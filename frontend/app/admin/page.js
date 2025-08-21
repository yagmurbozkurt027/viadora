'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDark, setIsDark] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/");
      return;
    }
    
    // Karanlık mod kontrolü
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Theme değişikliklerini dinle
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    fetchProducts();
    
    return () => {
      themeObserver.disconnect();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Ürünler yüklenirken hata oluştu");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      toast.error("Ürünler yüklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingProduct 
                  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products/${editingProduct._id}`
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products`;
      
      const method = editingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("İşlem başarısız");
      
      toast.success(editingProduct ? "Ürün güncellendi!" : "Ürün eklendi!");
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
      fetchProducts();
    } catch (err) {
      toast.error("Bir hata oluştu!");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    
    try {
      const token = localStorage.getItem("token");
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      
      toast.success("Ürün silindi!");
      fetchProducts();
    } catch (err) {
      toast.error("Silme işlemi başarısız!");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className={`text-center mt-10 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className={`rounded-lg shadow-lg p-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold transition-colors ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Admin Paneli
          </h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
              setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? 'İptal' : 'Yeni Ürün Ekle'}
          </button>
        </div>

        {/* Admin Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg border transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Toplam Ürün
                </p>
                <p className={`text-2xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Toptan Müşteriler
                </p>
                <p className={`text-2xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <a 
                    href="/admin/toptan-musteriler" 
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Yönet
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Raporlar
                </p>
                <p className={`text-2xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <a 
                    href="/raporlar" 
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Görüntüle
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Ayarlar
                </p>
                <p className={`text-2xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <a 
                    href="/profil" 
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Düzenle
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Ekleme/Düzenleme Formu */}
        {showAddForm && (
          <div className={`mb-8 p-6 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 transition-colors ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Ürün Adı
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">Kategori Seçin</option>
                  <option value="giyim">Giyim</option>
                  <option value="ayakkabı">Ayakkabı</option>
                  <option value="aksesuar">Aksesuar</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="ev">Ev & Yaşam</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Resim URL (opsiyonel)
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ürün Listesi */}
        <div>
          <h2 className={`text-xl font-semibold mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Mevcut Ürünler ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className={`text-center py-8 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Henüz hiç ürün yok. Yeni ürün ekleyerek başlayın!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className={`border rounded-lg p-4 transition-colors ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold text-lg transition-colors ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      {product.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm mb-2 transition-colors ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {product.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-green-600">{product.price}₺</span>
                    <span className={`font-semibold ${product.stock < 5 ? 'text-red-600' : 'text-blue-600'}`}>
                      Stok: {product.stock}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Kategori: {product.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
