'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, MapPin, FileText, CreditCard, CheckCircle } from 'lucide-react';

export default function ToptanKayit() {
  const [formData, setFormData] = useState({
    businessInfo: {
      companyName: '',
      taxNumber: '',
      address: '',
      phone: '',
      email: ''
    },
    creditLimit: 0,
    paymentTerms: '30 gün',
    customerTier: 'Bronze'
  });

  const [isWholesale, setIsWholesale] = useState(false);
  const [wholesaleStatus, setWholesaleStatus] = useState('none');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDark, setIsDark] = useState(false);

  // Kullanıcının toptan müşteri durumunu kontrol et
  useEffect(() => {
    checkWholesaleStatus();
    
    // Tema kontrolü
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
    
    return () => {
      themeObserver.disconnect();
    };
  }, []);

  const checkWholesaleStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/wholesale/my-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsWholesale(data.isWholesale);
        setWholesaleStatus(data.status);
      }
    } catch (error) {
      console.error('Durum kontrol hatası:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Giriş yapmanız gerekiyor!');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/wholesale/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Toptan müşteri kaydı başarılı! Admin onayı bekleniyor.');
        setIsWholesale(true);
        setWholesaleStatus('pending');
        setFormData({
          businessInfo: { companyName: '', taxNumber: '', address: '', phone: '', email: '' },
          creditLimit: 0,
          paymentTerms: '30 gün',
          customerTier: 'Bronze'
        });
      } else {
        setMessage(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Sunucu hatası oluştu!');
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Zaten toptan müşteri ise bilgi göster
  if (isWholesale) {
    return (
      <div className={`min-h-screen py-12 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 to-black' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl shadow-xl p-8 text-center transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Toptan Müşteri Durumu
            </h1>
            
            <div className={`rounded-lg p-6 mb-6 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border border-gray-600' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Durum Bilgisi</h2>
              <div className="space-y-2">
                                 <p className={`text-lg transition-colors duration-300 ${
                   isDark ? 'text-white' : 'text-gray-900'
                 }`}>
                   <span className="font-medium">Durum:</span>{' '}
                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                     wholesaleStatus === 'active' ? 'bg-green-900 text-green-200' :
                     wholesaleStatus === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                     'bg-red-900 text-red-200'
                   }`}>
                     {wholesaleStatus === 'active' ? 'Onaylandı' :
                      wholesaleStatus === 'pending' ? 'Onay Bekliyor' :
                      'Reddedildi'}
                   </span>
                 </p>
                 
                 {wholesaleStatus === 'pending' && (
                   <p className={`transition-colors duration-300 ${
                     isDark ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     Başvurunuz admin tarafından inceleniyor. Onaylandıktan sonra toptan fiyatlara erişebileceksiniz.
                   </p>
                 )}
                 
                 {wholesaleStatus === 'active' && (
                   <p className="text-green-600 font-medium">
                     🎉 Tebrikler! Toptan müşteri olarak onaylandınız. Artık özel fiyatlara erişebilirsiniz.
                   </p>
                 )}
              </div>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
               <div className={`p-4 rounded-lg transition-colors duration-300 ${
                 isDark 
                   ? 'bg-blue-900 border border-blue-700' 
                   : 'bg-blue-50 border border-blue-200'
               }`}>
                 <Building2 className={`w-8 h-8 mx-auto mb-2 transition-colors duration-300 ${
                   isDark ? 'text-blue-400' : 'text-blue-600'
                 }`} />
                 <h3 className={`font-semibold transition-colors duration-300 ${
                   isDark ? 'text-blue-200' : 'text-blue-800'
                 }`}>Toptan Fiyatlar</h3>
                 <p className={`text-sm transition-colors duration-300 ${
                   isDark ? 'text-blue-300' : 'text-blue-600'
                 }`}>%15-40 indirim</p>
               </div>
               
               <div className={`p-4 rounded-lg transition-colors duration-300 ${
                 isDark 
                   ? 'bg-green-900 border border-green-700' 
                   : 'bg-green-50 border border-green-200'
               }`}>
                 <CreditCard className={`w-8 h-8 mx-auto mb-2 transition-colors duration-300 ${
                   isDark ? 'text-green-400' : 'text-green-600'
                 }`} />
                 <h3 className={`font-semibold transition-colors duration-300 ${
                   isDark ? 'text-green-200' : 'text-green-800'
                 }`}>Vade İmkanı</h3>
                 <p className={`text-sm transition-colors duration-300 ${
                   isDark ? 'text-green-300' : 'text-green-600'
                 }`}>30-90 gün</p>
               </div>
               
               <div className={`p-4 rounded-lg transition-colors duration-300 ${
                 isDark 
                   ? 'bg-purple-900 border border-purple-700' 
                   : 'bg-purple-50 border border-purple-200'
               }`}>
                 <CheckCircle className={`w-8 h-8 mx-auto mb-2 transition-colors duration-300 ${
                   isDark ? 'text-purple-400' : 'text-purple-600'
                 }`} />
                 <h3 className={`font-semibold transition-colors duration-300 ${
                   isDark ? 'text-purple-200' : 'text-purple-800'
                 }`}>Özel Kampanyalar</h3>
                 <p className={`text-sm transition-colors duration-300 ${
                   isDark ? 'text-purple-300' : 'text-purple-600'
                 }`}>İlk bilgi</p>
               </div>
             </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-black' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="text-center mb-8">
            <Building2 className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Toptan Müşteri Kaydı
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Toptan alım yaparak özel fiyatlardan yararlanın
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg transition-colors duration-300 ${
              message.includes('✅') 
                ? isDark 
                  ? 'bg-green-900 text-green-200 border border-green-700' 
                  : 'bg-green-100 text-green-800 border border-green-300'
                : isDark 
                  ? 'bg-red-900 text-red-200 border border-red-700' 
                  : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Şirket Bilgileri */}
            <div className={`p-6 rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border border-gray-600' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <Building2 className={`w-5 h-5 transition-colors duration-300 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Şirket Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.companyName}
                    onChange={(e) => handleInputChange('businessInfo.companyName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Vergi Numarası *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.taxNumber}
                    onChange={(e) => handleInputChange('businessInfo.taxNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={formData.businessInfo.phone}
                    onChange={(e) => handleInputChange('businessInfo.phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    E-posta *
                  </label>
                  <input
                    type="email"
                    value={formData.businessInfo.email}
                    onChange={(e) => handleInputChange('businessInfo.email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Adres *
                  </label>
                  <textarea
                    value={formData.businessInfo.address}
                    onChange={(e) => handleInputChange('businessInfo.address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Toptan Satış Bilgileri */}
            <div className={`p-6 rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-blue-900 border border-blue-700' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                isDark ? 'text-blue-200' : 'text-blue-800'
              }`}>
                <CreditCard className={`w-5 h-5 transition-colors duration-300 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Toptan Satış Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    Müşteri Seviyesi
                  </label>
                  <select
                    value={formData.customerTier}
                    onChange={(e) => handleInputChange('customerTier', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-blue-600 bg-blue-800 text-white' 
                        : 'border-blue-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    Kredi Limiti (TL)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-blue-600 bg-blue-800 text-white' 
                        : 'border-blue-300 bg-white text-gray-900'
                    }`}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    Ödeme Vadesi
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-blue-600 bg-blue-800 text-white' 
                        : 'border-blue-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="30 gün">30 Gün</option>
                    <option value="60 gün">60 Gün</option>
                    <option value="90 gün">90 Gün</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Avantajlar */}
            <div className={`p-6 rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-green-900 border border-green-700' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-green-200' : 'text-green-800'
              }`}>
                🎯 Toptan Müşteri Avantajları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}>Özel Fiyatlar</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-green-300' : 'text-green-600'
                    }`}>%15-40 oranında indirimli fiyatlar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}>Vade İmkanı</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-green-300' : 'text-green-600'
                    }`}>30-90 gün vadeli ödeme seçenekleri</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}>Öncelikli Destek</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-green-300' : 'text-green-600'
                    }`}>7/24 öncelikli müşteri desteği</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      isDark ? 'text-green-200' : 'text-green-800'
                    }`}>Özel Kampanyalar</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-green-300' : 'text-green-600'
                    }`}>Sadece toptan müşterilere özel fırsatlar</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Kayıt Yapılıyor...' : 'Toptan Müşteri Olarak Kayıt Ol'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
