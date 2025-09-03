'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Download, Eye, Edit, Trash2, Filter } from 'lucide-react';

export default function FaturaYonetimi() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    invoiceType: 'Satış Faturası',
    invoiceDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    status: 'Beklemede',
    description: ''
  });

  const invoiceTypes = [
    { value: 'all', label: 'Tümü' },
    { value: 'Satış Faturası', label: 'Satış Faturası' },
    { value: 'İthal Faturası', label: 'İthal Faturası' },
    { value: 'İrsaliye', label: 'İrsaliye' },
    { value: 'Tanıtım', label: 'Tanıtım' }
  ];

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:6602/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Fatura yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor!');
        return;
      }

      // Backend'in beklediği formata dönüştür
      const invoiceData = {
        invoiceType: newInvoice.invoiceType,
        invoiceDate: newInvoice.invoiceDate,
        customer: {
          name: 'Müşteri',
          taxNumber: '',
          address: ''
        },
        items: [{
          name: 'Ürün',
          quantity: 1,
          unitPrice: parseFloat(newInvoice.totalAmount) || 0,
          taxRate: 18,
          discount: 0
        }],
        paymentMethod: 'Nakit',
        notes: newInvoice.description || '',
        status: newInvoice.status
      };

      const response = await fetch(`http://localhost:6602/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInvoices([...invoices, result.invoice]);
          setShowNewInvoiceModal(false);
          setNewInvoice({
            invoiceNumber: '',
            invoiceType: 'Satış Faturası',
            invoiceDate: new Date().toISOString().split('T')[0],
            totalAmount: '',
            status: 'Beklemede',
            description: ''
          });
          alert('Fatura başarıyla oluşturuldu!');
        } else {
          alert('Fatura oluşturulurken hata oluştu!');
        }
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error || 'Fatura oluşturulurken hata oluştu!'}`);
      }
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      alert('Fatura oluşturulurken hata oluştu!');
    }
  };

  // Fatura işlemleri
  const handleViewInvoice = (invoice) => {
    alert(`Fatura Detayı: ${invoice.invoiceNumber}\nTutar: ${invoice.totalAmount} TL\nDurum: ${invoice.status}`);
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:6602/api/invoices/${invoice._id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoiceNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF indirme özelliği geçici olarak kullanılamıyor');
      }
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF indirme özelliği geçici olarak kullanılamıyor');
    }
  };

  const handleEditInvoice = (invoice) => {
    alert(`Fatura düzenleme: ${invoice.invoiceNumber}\nBu özellik yakında eklenecek!`);
  };

  const handleDeleteInvoice = async (invoice) => {
    if (confirm(`"${invoice.invoiceNumber}" faturasını silmek istediğinizden emin misiniz?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:6602/api/invoices/${invoice._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setInvoices(invoices.filter(inv => inv._id !== invoice._id));
          alert('Fatura başarıyla silindi!');
        } else {
          alert('Fatura silinirken hata oluştu!');
        }
      } catch (error) {
        console.error('Fatura silme hatası:', error);
        alert('Fatura silinirken hata oluştu!');
      }
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = filterType === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.invoiceType === filterType);

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
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fatura Yönetimi</h1>
            </div>
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni Fatura
            </button>
          </div>

          {/* Filtreler */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {invoiceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fatura Listesi */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Fatura No</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Tip</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Tarih</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Tutar</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Durum</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Fatura bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.invoiceType === 'Satış Faturası' ? 'bg-green-100 text-green-800' :
                          invoice.invoiceType === 'İthal Faturası' ? 'bg-blue-100 text-blue-800' :
                          invoice.invoiceType === 'İrsaliye' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {invoice.invoiceType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                        {invoice.totalAmount?.toFixed(2)} TL
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'Ödendi' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status || 'Beklemede'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="İndir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Toplam Fatura</p>
                <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Toplam Tutar</p>
                <p className="text-2xl font-bold text-green-600">
                  {invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0).toFixed(2)} TL
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">₺</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Ödenen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {invoices.filter(inv => inv.status === 'Ödendi').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {invoices.filter(inv => inv.status !== 'Ödendi').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">⏳</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

             {/* Yeni Fatura Modal */}
       {showNewInvoiceModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewInvoiceModal(false)}>
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Fatura</h2>
              <button 
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fatura No
                </label>
                                 <input
                   type="text"
                   value={newInvoice.invoiceNumber}
                   onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                   placeholder="Fatura numarası"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fatura Tipi
                </label>
                                 <select
                   value={newInvoice.invoiceType}
                   onChange={(e) => setNewInvoice({...newInvoice, invoiceType: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                 >
                  <option value="Satış Faturası">Satış Faturası</option>
                  <option value="İthal Faturası">İthal Faturası</option>
                  <option value="İrsaliye">İrsaliye</option>
                  <option value="Tanıtım">Tanıtım</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih
                </label>
                                 <input
                   type="date"
                   value={newInvoice.invoiceDate}
                   onChange={(e) => setNewInvoice({...newInvoice, invoiceDate: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tutar (TL)
                </label>
                                 <input
                   type="number"
                   step="0.01"
                   value={newInvoice.totalAmount}
                   onChange={(e) => setNewInvoice({...newInvoice, totalAmount: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                   placeholder="0.00"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                                 <select
                   value={newInvoice.status}
                   onChange={(e) => setNewInvoice({...newInvoice, status: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                 >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Ödendi">Ödendi</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                                 <textarea
                   value={newInvoice.description}
                   onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-auto"
                   rows="3"
                   placeholder="Fatura açıklaması"
                 />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
                             <button
                 onClick={() => setShowNewInvoiceModal(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors pointer-events-auto"
               >
                 İptal
               </button>
               <button
                 onClick={handleCreateInvoice}
                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors pointer-events-auto"
               >
                 Oluştur
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 