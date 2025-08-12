'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Share2, Phone, Mail, MapPin, Globe, User } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BusinessCardQR() {
  const [showQR, setShowQR] = useState(false);
  
  // Kartvizit bilgileri - bu kısmı kendi bilgilerinizle güncelleyin
  const businessInfo = {
    name: "Viadora Butik",
    title: "Moda Tasarımcısı & Butik Sahibi",
    phone: "+90 534 425 27 40",
    email: "info@viadora.com",
    website: "www.viadora.com",
    address: "İstanbul, Türkiye",
    description: "Trend ve kaliteyi bir araya getiren Viadora deneyimi"
  };

  // QR kod için vCard formatında veri oluştur
  const generateVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${businessInfo.name}
ORG:${businessInfo.name}
TITLE:${businessInfo.title}
TEL;TYPE=WORK,VOICE:${businessInfo.phone}
EMAIL;TYPE=WORK,INTERNET:${businessInfo.email}
URL:${businessInfo.website}
ADR;TYPE=WORK:;;${businessInfo.address}
NOTE:${businessInfo.description}
END:VCARD`;
    
    return vcard;
  };

  // QR kod değeri
  const qrValue = generateVCard();

  // QR kodu kopyala
  const copyQRData = () => {
    navigator.clipboard.writeText(qrValue);
    toast.success('VCard bilgileri kopyalandı!');
  };

  // QR kodu indir
  const downloadQR = () => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('#business-card-qr svg');
    const ctx = canvas.getContext('2d');
    
    // SVG'yi canvas'a çiz
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      
      const link = document.createElement('a');
      link.download = 'viadora-business-card-qr.png';
      link.href = canvas.toDataURL();
      link.click();
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
    toast.success('QR kod indirildi!');
  };

  // WhatsApp ile paylaş
  const shareViaWhatsApp = () => {
    const message = `Merhaba! ${businessInfo.name} kartvizitimi incelemek ister misiniz?\n\n${businessInfo.name}\n${businessInfo.title}\n📞 ${businessInfo.phone}\n📧 ${businessInfo.email}\n🌐 ${businessInfo.website}\n📍 ${businessInfo.address}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Kartvizit Başlığı */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white text-center">
          📇 Kartvizit QR Kodu
        </h2>
      </div>

      {/* Kartvizit Bilgileri */}
      <div className="p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {businessInfo.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {businessInfo.title}
          </p>
        </div>

        {/* İletişim Bilgileri */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Phone className="w-5 h-5 text-purple-500" />
            <span>{businessInfo.phone}</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5 text-purple-500" />
            <span>{businessInfo.email}</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Globe className="w-5 h-5 text-purple-500" />
            <span>{businessInfo.website}</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-purple-500" />
            <span>{businessInfo.address}</span>
          </div>
        </div>

        {/* QR Kod Bölümü */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {showQR ? 'QR Kodu Gizle' : 'QR Kodu Göster'}
          </button>

          {showQR && (
            <div className="mt-4 text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG
                  id="business-card-qr"
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Bu QR kodu telefonunuzla tarayarak kartvizit bilgilerini kaydedebilirsiniz
              </p>
            </div>
          )}
        </div>

        {/* Aksiyon Butonları */}
        {showQR && (
          <div className="grid grid-cols-3 gap-2 pt-4">
            <button
              onClick={copyQRData}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Copy className="w-4 h-4" />
              Kopyala
            </button>
            
            <button
              onClick={downloadQR}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
            
            <button
              onClick={shareViaWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Share2 className="w-4 h-4" />
              Paylaş
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
