'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Users, 
  Shield, 
  Truck, 
  Star, 
  Heart,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Mail
} from 'lucide-react';

// TikTok simgesi için özel bileşen - gerçek TikTok logosu
const TikTokIcon = () => (
  <svg 
    className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export default function TanitimPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Geniş Ürün Yelpazesi",
      description: "Her sezon için trend ürünler, özel tasarımlar ve kaliteli kumaşlar"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Güvenli Alışveriş",
      description: "SSL sertifikalı güvenli ödeme sistemi ve kişisel veri koruması"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Hızlı Teslimat",
      description: "Aynı gün kargo ve ücretsiz kargo seçenekleri"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Müşteri Memnuniyeti",
      description: "7/24 müşteri desteği ve iade garantisi"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Özel Koleksiyonlar",
      description: "Sınırlı sayıda üretilen özel tasarım koleksiyonları"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Kişisel Stil Danışmanlığı",
      description: "Uzman stilistlerimizle kişisel stil danışmanlığı hizmeti"
    }
  ];

  const stats = [
    { number: "1000+", label: "Mutlu Müşteri" },
    { number: "500+", label: "Ürün Çeşidi" },
    { number: "50+", label: "Marka" },
    { number: "24/7", label: "Destek" }
  ];

  const handleWhatsAppClick = () => {
    // İki WhatsApp numarası arasında seçim yap
    const whatsappNumbers = [
      { name: "Yagmur", number: "905344252740" },
      { name: "İlayda", number: "905394865128" }
    ];
    
    // Basit bir seçim dialogu
    const selected = window.confirm(
      `Hangi WhatsApp numarasına mesaj göndermek istiyorsunuz?\n\n` +
      `1. ${whatsappNumbers[0].name}: +90 ${whatsappNumbers[0].number.slice(0, 3)} ${whatsappNumbers[0].number.slice(3, 6)} ${whatsappNumbers[0].number.slice(6)}\n` +
      `2. ${whatsappNumbers[1].name}: +90 ${whatsappNumbers[1].number.slice(0, 3)} ${whatsappNumbers[1].number.slice(3, 6)} ${whatsappNumbers[1].number.slice(6)}\n\n` +
      `Tamam = ${whatsappNumbers[0].name}, İptal = ${whatsappNumbers[1].name}`
    );
    
    const phoneNumber = selected ? whatsappNumbers[0].number : whatsappNumbers[1].number;
    const message = "Merhaba! Butik hakkında bilgi almak istiyorum.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    // İki telefon numarası arasında seçim yap
    const phoneNumbers = [
      { name: "Yagmur", number: "+90 534 425 2740" },
      { name: "İlayda", number: "+90 539 486 5128" }
    ];
    
    // Basit bir seçim dialogu
    const selected = window.confirm(
      `Hangi numarayı aramak istiyorsunuz?\n\n` +
      `1. ${phoneNumbers[0].name}: ${phoneNumbers[0].number}\n` +
      `2. ${phoneNumbers[1].name}: ${phoneNumbers[1].number}\n\n` +
      `Tamam = ${phoneNumbers[0].name}, İptal = ${phoneNumbers[1].name}`
    );
    
    const phoneNumber = selected ? phoneNumbers[0].number : phoneNumbers[1].number;
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <img
              src="/WhatsApp_Görsel_2025-08-06_saat_14.46.29_44ec4450-removebg-preview-removebg-preview.png"
              alt="Viadora Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
          </motion.div>
                                    <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Viadora'ya Hoş Geldiniz
              </motion.h1>
                                    <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              >
                Trend ve kaliteyi bir araya getiren Viadora deneyimi. 
                Her sezon için özel tasarımlar ve benzersiz koleksiyonlar.
              </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Destek
            </button>
            <button 
              onClick={handlePhoneClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              Hemen Ara
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="py-16 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="py-20 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Neden Bizi Tercih Etmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Kalite, güvenilirlik ve müşteri memnuniyeti odaklı hizmet anlayışımızla 
              sizlere en iyi alışveriş deneyimini sunuyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="py-20 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              İletişim Bilgileri
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Sorularınız için bize ulaşın
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
               transition={{ duration: 0.6, delay: 2.2 }}
               className="text-center p-6 bg-purple-50 rounded-xl"
             >
               <Phone className="w-8 h-8 text-purple-600 mx-auto mb-4" />
               <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
               <div className="space-y-1">
                 <p className="text-gray-600">+90 534 425 2740</p>
                 <p className="text-gray-600">+90 539 486 5128</p>
               </div>
             </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 2.4 }}
              className="text-center p-6 bg-green-50 rounded-xl"
            >
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600">7/24 Destek</p>
            </motion.div>
            
                         <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
               transition={{ duration: 0.6, delay: 2.6 }}
               className="text-center p-6 bg-blue-50 rounded-xl"
             >
               <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
               <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
               <div className="space-y-1">
                 <p className="text-gray-600">yagmur@viadora.com.tr</p>
                 <p className="text-gray-600">ilayda@viadora.com.tr</p>
               </div>
             </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 2.8 }}
              className="text-center p-6 bg-orange-50 rounded-xl"
            >
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">Gaziantep</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Social Media Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 3 }}
        className="py-16 bg-gray-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Bizi Takip Edin</h2>
                      <div className="flex justify-center space-x-6">
              <a 
                href="https://instagram.com/viadorayazilim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-purple-400 transition-colors duration-300 group"
                aria-label="Instagram'da takip et"
              >
                <Instagram className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a 
                href="https://facebook.com/viadorayazilim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-300 group"
                aria-label="Facebook'ta takip et"
              >
                <Facebook className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a 
                href="https://twitter.com/viadorayazilim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-300 group"
                aria-label="X'te takip et"
              >
                <Twitter className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </a>
                             <a 
                 href="https://tiktok.com/@viadorayazilim" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-white hover:text-pink-400 transition-colors duration-300 group"
                 aria-label="TikTok'ta takip et"
               >
                 <TikTokIcon />
               </a>
            </div>
        </div>
      </motion.section>

      {/* Floating WhatsApp Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 3.5 }}
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="WhatsApp Destek"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
