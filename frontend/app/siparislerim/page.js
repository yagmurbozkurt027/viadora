'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function SiparislerimPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/payments/orders?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Siparişler yüklenirken hata oluştu');
      }
    } catch (err) {
      toast.error('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'paid': return 'Ödendi';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">📦 Siparişlerim</h1>
          <p className="text-gray-600">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Henüz Siparişiniz Yok</h2>
            <p className="text-gray-600 mb-6">
              İlk siparişinizi vermek için ürünlerimizi inceleyin.
            </p>
            <button
              onClick={() => window.location.href = '/urunler'}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ürünleri İncele
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Sipariş Başlığı */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Sipariş #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                                              <span className="text-lg font-bold text-gray-800 dark:text-white">
                        ₺{order.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sipariş Detayları */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ürünler */}
                    <div>
                                              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">🛍️ Ürünler</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₺{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Teslimat Bilgileri */}
                    <div>
                                              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">🚚 Teslimat Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Ad Soyad:</strong> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                        <p><strong>Telefon:</strong> {order.shippingAddress?.phone}</p>
                        <p><strong>Adres:</strong> {order.shippingAddress?.address}</p>
                        <p><strong>Şehir:</strong> {order.shippingAddress?.city}</p>
                        <p><strong>Posta Kodu:</strong> {order.shippingAddress?.postalCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Bilgileri */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                        <p className="font-medium">{order.paymentMethod === 'stripe' ? '💳 Kredi Kartı' : order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Toplam Tutar</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">₺{order.total}</p>
                      </div>
                    </div>
                  </div>

                  {/* Kargo Takip */}
                  {order.trackingNumber && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                      <h4 className="font-semibold text-blue-800 mb-2">📦 Kargo Takip</h4>
                      <p className="text-sm text-blue-700">
                        Takip Numarası: <strong>{order.trackingNumber}</strong>
                      </p>
                    </div>
                  )}

                  {/* Notlar */}
                  {order.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                      <h4 className="font-semibold text-yellow-800 mb-2">📝 Notlar</h4>
                      <p className="text-sm text-yellow-700">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 