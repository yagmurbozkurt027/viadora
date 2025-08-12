import { useState } from 'react';
import { toast } from 'react-toastify';

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Email gönderme fonksiyonu
  const sendEmail = async (emailData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Email gönderilemedi');
      }

      const result = await response.json();
      toast.success('Email başarıyla gönderildi!');
      return result;
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Email gönderilemedi!');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hoş geldin emaili
  const sendWelcomeEmail = async (userData) => {
    return sendEmail({
      type: 'welcome',
      to: userData.email,
      data: {
        username: userData.username,
        activationLink: `${window.location.origin}/activate/${userData.activationToken}`
      }
    });
  };

  // Şifre sıfırlama emaili
  const sendPasswordResetEmail = async (email, resetToken) => {
    return sendEmail({
      type: 'password-reset',
      to: email,
      data: {
        resetLink: `${window.location.origin}/reset-password/${resetToken}`
      }
    });
  };

  // Sipariş onay emaili
  const sendOrderConfirmationEmail = async (orderData) => {
    return sendEmail({
      type: 'order-confirmation',
      to: orderData.email,
      data: {
        orderNumber: orderData.orderNumber,
        orderItems: orderData.items,
        totalAmount: orderData.totalAmount,
        estimatedDelivery: orderData.estimatedDelivery
      }
    });
  };

  // Stok uyarı emaili
  const sendStockAlertEmail = async (productData) => {
    return sendEmail({
      type: 'stock-alert',
      to: productData.adminEmail,
      data: {
        productName: productData.name,
        currentStock: productData.stock,
        threshold: productData.threshold
      }
    });
  };

  // Newsletter emaili
  const sendNewsletterEmail = async (subscribers, newsletterData) => {
    return sendEmail({
      type: 'newsletter',
      to: subscribers,
      data: {
        subject: newsletterData.subject,
        content: newsletterData.content,
        unsubscribeLink: `${window.location.origin}/unsubscribe`
      }
    });
  };

  // Email template'leri
  const emailTemplates = {
    welcome: {
      subject: 'Viadora\'ye Hoş Geldiniz!',
      template: `
        <h1>Hoş Geldiniz, {{username}}!</h1>
        <p>Viadora ailesine katıldığınız için teşekkür ederiz.</p>
        <p>Hesabınızı aktifleştirmek için <a href="{{activationLink}}">buraya tıklayın</a>.</p>
      `
    },
    'password-reset': {
      subject: 'Şifre Sıfırlama',
      template: `
        <h1>Şifre Sıfırlama</h1>
        <p>Şifrenizi sıfırlamak için <a href="{{resetLink}}">buraya tıklayın</a>.</p>
        <p>Bu link 1 saat geçerlidir.</p>
      `
    },
    'order-confirmation': {
      subject: 'Sipariş Onayı - #{{orderNumber}}',
      template: `
        <h1>Siparişiniz Alındı!</h1>
        <p>Sipariş numarası: {{orderNumber}}</p>
        <p>Toplam tutar: {{totalAmount}}₺</p>
        <p>Tahmini teslimat: {{estimatedDelivery}}</p>
      `
    },
    'stock-alert': {
      subject: 'Stok Uyarısı',
      template: `
        <h1>Stok Uyarısı</h1>
        <p>{{productName}} ürününün stoku kritik seviyede!</p>
        <p>Mevcut stok: {{currentStock}}</p>
        <p>Eşik değeri: {{threshold}}</p>
      `
    },
    newsletter: {
      subject: '{{subject}}',
      template: `
        <h1>{{subject}}</h1>
        <div>{{content}}</div>
        <p><a href="{{unsubscribeLink}}">Newsletter'dan çık</a></p>
      `
    }
  };

  return {
    isLoading,
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
    sendStockAlertEmail,
    sendNewsletterEmail,
    emailTemplates
  };
}; 