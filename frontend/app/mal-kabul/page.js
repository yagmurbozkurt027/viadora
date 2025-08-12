'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

export default function MalKabulYonetimi() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewReceiptModal, setShowNewReceiptModal] = useState(false);
  const [newReceipt, setNewReceipt] = useState({
    receiptNumber: '',
    supplier: { name: '', address: '', phone: '' },
    deliveryNote: '',
    receiptDate: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
    status: 'Beklemede'
  });

  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'Beklemede', label: 'Beklemede' },
    { value: 'Tam Kabul', label: 'Tam Kabul' },
    { value: 'Kısmi Kabul', label: 'Kısmi Kabul' },
    { value: 'Red', label: 'Red' }
  ];

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/goods-receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.goodsReceipts || []);
      }
    } catch (error) {
      console.error('Mal kabul yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor!');
        return;
      }

      const receiptData = {
        receiptNumber: newReceipt.receiptNumber,
        supplier: newReceipt.supplier,
        deliveryNote: newReceipt.deliveryNote,
        receiptDate: newReceipt.receiptDate,
        items: newReceipt.items,
        notes: newReceipt.notes,
        status: newReceipt.status
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/goods-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(receiptData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReceipts([...receipts, result.goodsReceipt]);
          setShowNewReceiptModal(false);
          setNewReceipt({
            receiptNumber: '',
            supplier: { name: '', address: '', phone: '' },
            deliveryNote: '',
            receiptDate: new Date().toISOString().split('T')[0],
            items: [],
            notes: '',
            status: 'Beklemede'
          });
          alert('Mal kabul başarıyla oluşturuldu!');
        } else {
          alert('Mal kabul oluşturulurken hata oluştu!');
        }
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error || 'Mal kabul oluşturulurken hata oluştu!'}`);
      }
    } catch (error) {
      console.error('Mal kabul oluşturma hatası:', error);
      alert('Mal kabul oluşturulurken hata oluştu!');
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const filteredReceipts = filterStatus === 'all' 
    ? receipts 
    : receipts.filter(receipt => receipt.status === filterStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Tam Kabul':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Kısmi Kabul':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'Red':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tam Kabul':
        return 'bg-green-100 text-green-800';
      case 'Kısmi Kabul':
        return 'bg-orange-100 text-orange-800';
      case 'Red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mal Kabul Yönetimi</h1>
            </div>
            <button 
              onClick={() => setShowNewReceiptModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni Mal Kabul
            </button>
          </div>

          {/* Filtreler */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Durum Filtresi:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mal Kabul Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Yükleniyor...
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Mal kabul bulunamadı
              </div>
            ) : (
              filteredReceipts.map((receipt, index) => (
                <motion.div
                  key={receipt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {receipt.receiptNumber}
                    </h3>
                    {getStatusIcon(receipt.status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Tedarikçi</p>
                      <p className="font-medium">{receipt.supplier?.name || 'Belirtilmemiş'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">İrsaliye No</p>
                      <p className="font-medium">{receipt.deliveryNote || 'Belirtilmemiş'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Tarih</p>
                      <p className="font-medium">
                        {new Date(receipt.receiptDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Toplam Ürün</p>
                      <p className="font-medium">{receipt.totalItems || 0} adet</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Toplam Miktar</p>
                      <p className="font-medium">{receipt.totalQuantity || 0} adet</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                      {receipt.status || 'Beklemede'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Toplam Mal Kabul</p>
                <p className="text-2xl font-bold text-green-600">{receipts.length}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {receipts.filter(r => r.status === 'Beklemede').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Kabul Edilen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {receipts.filter(r => r.status === 'Tam Kabul').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Reddedilen</p>
                <p className="text-2xl font-bold text-red-600">
                  {receipts.filter(r => r.status === 'Red').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Yeni Mal Kabul Modal */}
        {showNewReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewReceiptModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Mal Kabul</h2>
                <button 
                  onClick={() => setShowNewReceiptModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mal Kabul No
                  </label>
                  <input
                    type="text"
                    value={newReceipt.receiptNumber}
                    onChange={(e) => setNewReceipt({...newReceipt, receiptNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                    placeholder="Mal kabul numarası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tedarikçi Adı
                  </label>
                  <input
                    type="text"
                    value={newReceipt.supplier.name}
                    onChange={(e) => setNewReceipt({
                      ...newReceipt, 
                      supplier: {...newReceipt.supplier, name: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                    placeholder="Tedarikçi adı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İrsaliye No
                  </label>
                  <input
                    type="text"
                    value={newReceipt.deliveryNote}
                    onChange={(e) => setNewReceipt({...newReceipt, deliveryNote: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                    placeholder="İrsaliye numarası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={newReceipt.receiptDate}
                    onChange={(e) => setNewReceipt({...newReceipt, receiptDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={newReceipt.notes}
                    onChange={(e) => setNewReceipt({...newReceipt, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                    rows="3"
                    placeholder="Mal kabul notları"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewReceiptModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors pointer-events-auto"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateReceipt}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors pointer-events-auto"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 