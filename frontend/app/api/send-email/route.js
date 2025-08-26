import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { type, to, data } = await request.json();
    
    // Email template'ini al
    const templates = {
      welcome: {
        subject: 'Viadora\'ya Hoş Geldiniz!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Hoş Geldiniz, ${data.username}!</h1>
            <p>Viadora ailesine katıldığınız için teşekkür ederiz.</p>
            <p>Hesabınızı aktifleştirmek için <a href="${data.activationLink}" style="color: #3b82f6;">buraya tıklayın</a>.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Bu email Viadora tarafından gönderilmiştir.</p>
          </div>
        `
      },
      'password-reset': {
        subject: 'Şifre Sıfırlama',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Şifre Sıfırlama</h1>
            <p>Şifrenizi sıfırlamak için <a href="${data.resetLink}" style="color: #3b82f6;">buraya tıklayın</a>.</p>
            <p style="color: #666;">Bu link 1 saat geçerlidir.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Bu email Viadora tarafından gönderilmiştir.</p>
          </div>
        `
      },
      'order-confirmation': {
        subject: `Sipariş Onayı - #${data.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Siparişiniz Alındı!</h1>
            <p><strong>Sipariş numarası:</strong> ${data.orderNumber}</p>
            <p><strong>Toplam tutar:</strong> ${data.totalAmount}₺</p>
            <p><strong>Tahmini teslimat:</strong> ${data.estimatedDelivery}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Bu email Viadora tarafından gönderilmiştir.</p>
          </div>
        `
      },
      'stock-alert': {
        subject: 'Stok Uyarısı',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Stok Uyarısı</h1>
            <p><strong>${data.productName}</strong> ürününün stoku kritik seviyede!</p>
            <p><strong>Mevcut stok:</strong> ${data.currentStock}</p>
            <p><strong>Eşik değeri:</strong> ${data.threshold}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Bu email Viadora tarafından gönderilmiştir.</p>
          </div>
        `
      },
      newsletter: {
        subject: data.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">${data.subject}</h1>
            <div>${data.content}</div>
            <hr style="margin: 20px 0;">
            <p><a href="${data.unsubscribeLink}" style="color: #666;">Newsletter'dan çık</a></p>
            <p style="color: #666; font-size: 12px;">Bu email Viadora tarafından gönderilmiştir.</p>
          </div>
        `
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error('Geçersiz email tipi');
    }

    // Backend'e email gönderme isteği
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: template.subject,
        html: template.html,
        type
      })
    });

    if (!response.ok) {
      throw new Error('Email gönderilemedi');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email başarıyla gönderildi' 
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ 
      error: 'Email gönderilemedi' 
    }, { status: 500 });
  }
} 