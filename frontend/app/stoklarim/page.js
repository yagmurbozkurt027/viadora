"use client";
import { useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";

export default function StoklarimPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${getApiUrl()}/api/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Stoklarım - Kullanıcı stokları:', userData.stocks);
        setStocks(userData.stocks || []);
      }
    } catch (error) {
      console.error("Stok yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = () => {
    fetch(`${getApiUrl()}/api/products`)
      .then(res => res.json())
      .then(data => {
        console.log('Stoklarım - Ürünler yüklendi:', data);
        setProducts(data);
      });
  };

  const updateStock = async (productId, changeAmount) => {
    setIsUpdating(true);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    
    try {
      await fetch(`${getApiUrl()}/api/users/user-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productId, quantity: changeAmount }),
      });
      await fetchStocks();
    } catch (error) {
      console.error("Stok güncelleme hatası:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = (productId, currentQuantity) => {
    updateStock(productId, 1);
  };

  const handleDecrease = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateStock(productId, -1);
    } else {
      removeStock(productId);
    }
  };

  const removeStock = async (productId) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    await fetch(`${getApiUrl()}/api/users/user-stock-remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId, productId }),
    });
    fetchStocks();
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-200">Stoklarım</h1>
      
      {stocks.length === 0 ? (
        <p className="text-center dark:text-gray-200">Henüz stoklarınıza ürün eklemediniz.</p>
      ) : (
        <div className="space-y-4">
          {/* Desktop Tablo */}
          <div className="hidden md:block">
            <table className="w-full border rounded shadow bg-white dark:bg-gray-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Ürün</th>
                  <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Miktar</th>
                  <th className="py-2 px-4 text-gray-800 dark:text-gray-200">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((item, i) => {
                  const product = products.find(p => String(p._id) === String(item.productId));
                  if (!product) {
                    return (
                      <tr key={i} className="border-t dark:border-gray-700">
                        <td className="py-2 px-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                          <span className="text-red-500 dark:text-red-400">❌ Ürün artık mevcut değil</span>
                        </td>
                        <td className="py-2 px-4 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                        <td className="py-2 px-4 flex gap-2 justify-center">
                          <button 
                            onClick={() => removeStock(item.productId)} 
                            className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 flex items-center justify-center"
                            title="Ürünü stoklardan kaldır"
                            disabled={isUpdating}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  const maxStock = product ? product.stock : Infinity;
                  const disablePlus = item.quantity >= maxStock;
                  return (
                    <tr key={i} className="border-t dark:border-gray-700">
                      <td className="py-2 px-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                        {product ? (
                          <>
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border dark:border-gray-600" />
                            <span className="font-semibold">{product.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Bilinmeyen Ürün</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                      <td className="py-2 px-4 flex gap-2 justify-center">
                        <button onClick={() => handleDecrease(item.productId, item.quantity)} className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 font-bold text-lg disabled:opacity-50" disabled={isUpdating}>-</button>
                        <button
                          onClick={() => handleIncrease(item.productId, item.quantity)}
                          className="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 font-bold text-lg disabled:opacity-50"
                          disabled={disablePlus || isUpdating}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeStock(item.productId)}
                          className="bg-gray-300 hover:bg-red-600 text-gray-700 hover:text-white rounded px-2 py-1 flex items-center justify-center"
                          title="Ürünü sil"
                          disabled={isUpdating}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobil Kartlar */}
          <div className="md:hidden space-y-4">
            {stocks.map((item, i) => {
              const product = products.find(p => String(p._id) === String(item.productId));
              if (!product) {
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
                    <p className="text-red-500 dark:text-red-400 font-semibold mb-2">❌ Ürün artık mevcut değil</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">Miktar: {item.quantity}</p>
                    <button 
                      onClick={() => removeStock(item.productId)} 
                      className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 text-sm"
                      disabled={isUpdating}
                    >
                      🗑️ Kaldır
                    </button>
                  </div>
                );
              }
              const maxStock = product ? product.stock : Infinity;
              const disablePlus = item.quantity >= maxStock;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded border dark:border-gray-600" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Miktar: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDecrease(item.productId, item.quantity)} className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 font-bold text-lg disabled:opacity-50" disabled={isUpdating}>-</button>
                    <button
                      onClick={() => handleIncrease(item.productId, item.quantity)}
                      className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 font-bold text-lg disabled:opacity-50"
                      disabled={disablePlus || isUpdating}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeStock(item.productId)}
                      className="bg-gray-300 hover:bg-red-600 text-gray-700 hover:text-white rounded px-3 py-1 flex items-center justify-center"
                      title="Ürünü sil"
                      disabled={isUpdating}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
} 