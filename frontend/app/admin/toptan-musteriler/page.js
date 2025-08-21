'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock, Users, Eye } from 'lucide-react';

export default function ToptanMusterilerAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadWholesaleCustomers();
  }, []);

  const loadWholesaleCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/wholesale/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Müşteri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/wholesale/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await loadWholesaleCustomers();
        alert(`Müşteri durumu ${newStatus === 'active' ? 'onaylandı' : 'reddedildi'}`);
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken hata oluştu!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Onaylandı';
      case 'pending': return 'Onay Bekliyor';
      case 'inactive': return 'Reddedildi';
      default: return 'Bilinmiyor';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                Toptan Müşteri Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">
                Toptan müşteri başvurularını yönetin ve onaylayın
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                <div className="text-sm text-gray-500">Toplam Müşteri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {customers.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Onay Bekleyen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Müşteri Listesi */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Müşteri Listesi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seviye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuru Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.userId?.username || 'Bilinmiyor'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.userId?.email || 'E-posta yok'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.businessInfo?.companyName || 'Şirket adı yok'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.businessInfo?.taxNumber || 'Vergi no yok'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.customerTier)}`}>
                        {customer.customerTier}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {customer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCustomerStatus(customer._id, 'active')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Onayla"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => updateCustomerStatus(customer._id, 'inactive')}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reddet"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz toptan müşteri yok</h3>
              <p className="text-gray-500">Toptan müşteri başvuruları burada görünecek.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detay Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.userId?.username || 'Bilinmiyor'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.userId?.email || 'E-posta yok'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.businessInfo?.companyName || 'Belirtilmemiş'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.businessInfo?.taxNumber || 'Belirtilmemiş'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.businessInfo?.phone || 'Belirtilmemiş'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Seviyesi</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(selectedCustomer.customerTier)}`}>
                    {selectedCustomer.customerTier}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kredi Limiti</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.creditLimit.toLocaleString('tr-TR')} TL</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Vadesi</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.paymentTerms}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <p className="text-sm text-gray-900">{selectedCustomer.businessInfo?.address || 'Belirtilmemiş'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başvuru Tarihi</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                    {getStatusText(selectedCustomer.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {selectedCustomer.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer._id, 'active');
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer._id, 'inactive');
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reddet
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
