'use client';
import { useState, useEffect } from 'react';
import { Barcode, Search, Plus, Edit, Trash2, Download, X } from 'lucide-react';

export default function BarkodYonetimi() {
  const [barcodes, setBarcodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };

  const searchBarcode = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/barcode/search/${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedProduct(data.product);
      } else {
        alert('Barkod bulunamadı');
      }
    } catch (error) {
      console.error('Barkod arama hatası:', error);
      alert('Barkod arama hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarcode = async () => {
    if (!selectedProductForBarcode || !barcodeNumber) {
      alert('Lütfen ürün ve barkod numarası seçin');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/barcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: selectedProductForBarcode,
          code: barcodeNumber
        })
      });

      if (response.ok) {
        alert('Barkod başarıyla eklendi!');
        setShowAddForm(false);
        setSelectedProductForBarcode('');
        setBarcodeNumber('');
      } else {
        alert('Barkod eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Barkod ekleme hatası:', error);
      alert('Barkod ekleme hatası');
    }
  };

  const handleEditBarcode = () => {
    setShowEditForm(true);
  };

  const handleDeleteBarcode = () => {
    setShowDeleteForm(true);
  };

  const handleEditBarcodeSubmit = async () => {
    if (!selectedProductForBarcode || !barcodeNumber) {
      alert('Lütfen ürün ve barkod numarası seçin');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/barcode/product/${selectedProductForBarcode}/${barcodeNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: barcodeNumber
        })
      });

      if (response.ok) {
        alert('Barkod başarıyla güncellendi!');
        setShowEditForm(false);
        setSelectedProductForBarcode('');
        setBarcodeNumber('');
      } else {
        alert('Barkod güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Barkod güncelleme hatası:', error);
      alert('Barkod güncelleme hatası');
    }
  };

  const handleDeleteBarcodeSubmit = async () => {
    if (!barcodeNumber) {
      alert('Lütfen silinecek barkod numarasını girin');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/barcode/${barcodeNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Barkod başarıyla silindi!');
        setShowDeleteForm(false);
        setBarcodeNumber('');
      } else {
        alert('Barkod silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Barkod silme hatası:', error);
      alert('Barkod silme hatası');
    }
  };

  const handleDownloadReport = () => {
    // Rapor indirme fonksiyonu
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/barcode/report`;
    link.download = 'barkod-raporu.pdf';
    link.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Barcode className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Barkod Yönetimi</h1>
          </div>

          {/* Barkod Arama */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Barkod Arama</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Barkod numarasını girin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={searchBarcode}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Aranıyor...' : 'Ara'}
              </button>
            </div>
          </div>

                     {/* Bulunan Ürün */}
           {selectedProduct && (
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-lg">
               <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Bulunan Ürün</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Ürün Adı</p>
                   <p className="font-medium text-gray-800 dark:text-white">{selectedProduct.name}</p>
                 </div>
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Kategori</p>
                   <p className="font-medium text-gray-800 dark:text-white">{selectedProduct.category}</p>
                 </div>
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Sezon</p>
                   <p className="font-medium text-gray-800 dark:text-white">{selectedProduct.season}</p>
                 </div>
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Marka</p>
                   <p className="font-medium text-gray-800 dark:text-white">{selectedProduct.brand || 'Belirtilmemiş'}</p>
                 </div>
               </div>
             </div>
           )}

          {/* Barkod İşlemleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Barkod Ekle</h3>
              </div>
              <p className="text-gray-600 mb-4">Ürünlere yeni barkod ekleyin</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Barkod Ekle
              </button>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Edit className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Barkod Düzenle</h3>
              </div>
              <p className="text-gray-600 mb-4">Mevcut barkodları düzenleyin</p>
              <button 
                onClick={handleEditBarcode}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Düzenle
              </button>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Barkod Sil</h3>
              </div>
              <p className="text-gray-600 mb-4">Barkodları silin</p>
              <button 
                onClick={handleDeleteBarcode}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>

        {/* Barkod Raporu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Barkod Raporu</h2>
            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Rapor İndir
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">150</p>
              <p className="text-gray-600">Toplam Barkod</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">120</p>
              <p className="text-gray-600">Aktif Barkod</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">25</p>
              <p className="text-gray-600">Beden Barkod</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-gray-600">Renk Barkod</p>
            </div>
          </div>
        </div>
      </div>

             {/* Barkod Ekleme Modal */}
       {showAddForm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Barkod Ekle</h3>
               <button 
                 onClick={() => setShowAddForm(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Ürün Seçin
                 </label>
                 <select
                   value={selectedProductForBarcode}
                   onChange={(e) => setSelectedProductForBarcode(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 >
                   <option value="">Ürün seçin...</option>
                   {products.map(product => (
                     <option key={product._id} value={product._id}>
                       {product.name} - {product.category}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Barkod Numarası
                 </label>
                 <input
                   type="text"
                   value={barcodeNumber}
                   onChange={(e) => setBarcodeNumber(e.target.value)}
                   placeholder="Barkod numarasını girin..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 />
               </div>
             </div>
             
             <div className="flex gap-3 mt-6">
               <button
                 onClick={handleAddBarcode}
                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Ekle
               </button>
               <button
                 onClick={() => setShowAddForm(false)}
                 className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
               >
                 İptal
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Barkod Düzenleme Modal */}
       {showEditForm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Barkod Düzenle</h3>
               <button 
                 onClick={() => setShowEditForm(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Ürün Seçin
                 </label>
                 <select
                   value={selectedProductForBarcode}
                   onChange={(e) => setSelectedProductForBarcode(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 >
                   <option value="">Ürün seçin...</option>
                   {products.map(product => (
                     <option key={product._id} value={product._id}>
                       {product.name} - {product.category}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Yeni Barkod Numarası
                 </label>
                 <input
                   type="text"
                   value={barcodeNumber}
                   onChange={(e) => setBarcodeNumber(e.target.value)}
                   placeholder="Yeni barkod numarasını girin..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 />
               </div>
             </div>
             
             <div className="flex gap-3 mt-6">
               <button
                 onClick={handleEditBarcodeSubmit}
                 className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
               >
                 Güncelle
               </button>
               <button
                 onClick={() => setShowEditForm(false)}
                 className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
               >
                 İptal
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Barkod Silme Modal */}
       {showDeleteForm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Barkod Sil</h3>
               <button 
                 onClick={() => setShowDeleteForm(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Silinecek Barkod Numarası
                 </label>
                 <input
                   type="text"
                   value={barcodeNumber}
                   onChange={(e) => setBarcodeNumber(e.target.value)}
                   placeholder="Silinecek barkod numarasını girin..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 />
               </div>
             </div>
             
             <div className="flex gap-3 mt-6">
               <button
                 onClick={handleDeleteBarcodeSubmit}
                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                 Sil
               </button>
               <button
                 onClick={() => setShowDeleteForm(false)}
                 className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
               >
                 İptal
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
} 