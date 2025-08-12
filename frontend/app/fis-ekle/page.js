"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function FislerimTablosu() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 mt-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Fişlerim</h2>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : transactions.length === 0 ? (
        <div>Henüz fiş eklemediniz.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900">
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left rounded-tl-xl">Mağaza</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">İşlem Tipi</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">Toplam</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">Ürün Sayısı</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left rounded-tr-xl">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((fis, idx) => (
                <tr
                  key={fis._id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-blue-950`}
                >
                  <td className="py-2 px-4 font-medium">{fis.storeName || '-'}</td>
                  <td className="py-2 px-4 capitalize">{fis.type || '-'}</td>
                  <td className="py-2 px-4 text-blue-700 dark:text-blue-300 font-semibold">{fis.total?.toFixed(2) || '0.00'}₺</td>
                  <td className="py-2 px-4 text-center">{fis.items?.length || 0}</td>
                  <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">{fis.createdAt ? new Date(fis.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function FisEkle() {
  const [type, setType] = useState("girdi");
  const [storeName, setStoreName] = useState("");
  const [user, setUser] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([
    { productName: "", quantity: 1, unitPrice: 0 }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = field === "quantity" || field === "unitPrice" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productName: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const validateForm = () => {
    const newErrors = {};
    
    if (!storeName.trim()) {
      newErrors.storeName = "Mağaza adı zorunludur";
    }
    
    if (!user.trim()) {
      newErrors.user = "Kullanıcı adı zorunludur";
    }
    
    items.forEach((item, index) => {
      if (!item.productName.trim()) {
        newErrors[`productName_${index}`] = "Ürün adı zorunludur";
      }
      if (item.quantity <= 0) {
        newErrors[`quantity_${index}`] = "Miktar 0'dan büyük olmalıdır";
      }
      if (item.unitPrice < 0) {
        newErrors[`unitPrice_${index}`] = "Birim fiyat negatif olamaz";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Lütfen tüm hataları düzeltin!");
      return;
    }

    setIsSubmitting(true);
    const totalAmount = calculateTotal();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, storeName, user, description, items, total: totalAmount })
      });

      if (res.ok) {
        const data = await res.json();
        alert("Fiş başarıyla kaydedildi!");
        router.push(`/fis/${data._id}`);
      } else {
        const errorText = await res.text();
        alert("Fiş kaydedilemedi. Lütfen tüm alanları doldurduğunuzdan emin olun ve tekrar deneyin.");
        console.error("Fiş kaydetme hatası:", errorText);
      }
    } catch (error) {
      alert("Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin.");
      console.error("Network error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4 mt-8">
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
          <h1 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-gray-100">Yeni Fiş Ekle</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İşlem Tipi</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="girdi">Girdi</option>
                <option value="çıktı">Çıktı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kullanıcı</label>
              <input 
                value={user} 
                onChange={e => setUser(e.target.value)} 
                className={`w-full border rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.user ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`} 
              />
              {errors.user && (
                <p className="text-red-500 text-sm mt-1">{errors.user}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mağaza Adı</label>
            <input 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              required 
              className={`w-full border rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.storeName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`} 
            />
            {errors.storeName && (
              <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ürünler</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input 
                    placeholder="Ürün Adı" 
                    value={item.productName} 
                    onChange={e => handleItemChange(idx, "productName", e.target.value)} 
                    required 
                    className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Miktar" 
                    value={item.quantity} 
                    onChange={e => handleItemChange(idx, "quantity", e.target.value)} 
                    required 
                    className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Birim Fiyat" 
                    value={item.unitPrice} 
                    onChange={e => handleItemChange(idx, "unitPrice", e.target.value)} 
                    required 
                    className="w-28 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem(idx)} 
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={addItem} 
              className="mt-3 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors"
            >
              ➕ Ürün Ekle
            </button>
          </div>

          {/* Toplam Tutar */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-base font-bold text-blue-900 dark:text-blue-100 text-center">
              Toplam Tutar: {calculateTotal().toFixed(2)}₺
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 transform ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'
            } text-white`}
          >
            {isSubmitting ? '⏳ Kaydediliyor...' : '💾 Fişi Kaydet'}
          </button>
        </form>
        </div>
      </div>
      <FislerimTablosu />
    </div>
  );
}