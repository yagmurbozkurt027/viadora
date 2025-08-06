const nodemailer = require('nodemailer');
const log = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

const emailTemplates = {
  welcome: (username) => ({
    subject: "Viadora'ye Hoş Geldiniz! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Hoş Geldiniz!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Viadora ailesine katıldığınız için teşekkürler</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Merhaba ${username}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Viadora'ya kayıt olduğunuz için teşekkür ederiz! Artık aşağıdaki özelliklerden yararlanabilirsiniz:
          </p>
          
          <ul style="color: #666; line-height: 1.8;">
            <li>🎮 <strong>Gamification Sistemi:</strong> Puanlar toplayın, rozetler kazanın</li>
            <li>🛍️ <strong>Ürün Keşfi:</strong> Binlerce ürün arasından seçim yapın</li>
            <li>❤️ <strong>Favori Sistemi:</strong> Beğendiğiniz ürünleri kaydedin</li>
            <li>📊 <strong>Kişisel Raporlar:</strong> Alışveriş geçmişinizi takip edin</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:6600" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🚀 Alışverişe Başla
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `
  }),

  newProduct: (username, productName, productPrice) => ({
    subject: '🆕 Yeni Ürün: ' + productName,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 28px;">🆕 Yeni Ürün!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Koleksiyonumuza yeni ürün eklendi</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Merhaba ${username}!</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">${productName}</h3>
            <p style="color: #666; font-size: 18px; font-weight: bold;">💰 ${productPrice} TL</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Bu yeni ürünü kaçırmayın! Hemen inceleyin ve favorilerinize ekleyin.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:6600/urunler" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              👀 Ürünü İncele
            </a>
          </div>
        </div>
      </div>
    `
  }),

  gamificationAchievement: (username, achievement) => ({
    subject: '🏆 Yeni Başarı: ' + achievement.name,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 28px;">🏆 Başarı Kazandınız!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Yeni bir rozet kazandınız</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Tebrikler ${username}!</h2>
          
          <div style="text-align: center; background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #ffc107;">
            <div style="font-size: 48px; margin-bottom: 10px;">${achievement.icon}</div>
            <h3 style="color: #856404; margin: 10px 0;">${achievement.name}</h3>
            <p style="color: #856404; margin: 0;">${achievement.description}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Bu başarıyı kazandığınız için tebrikler! Daha fazla rozet kazanmak için aktif olmaya devam edin.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:6600/gamification" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎮 Gamification'ı Görüntüle
            </a>
          </div>
        </div>
      </div>
    `
  }),

  levelUp: (username, newLevel) => ({
    subject: '⭐ Seviye Atladınız: ' + newLevel,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 28px;">⭐ Seviye Atladınız!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Yeni seviyeniz: ${newLevel}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Tebrikler ${username}!</h2>
          
          <div style="text-align: center; background: #e2d9f3; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #6f42c1;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
            <h3 style="color: #6f42c1; margin: 10px 0;">${newLevel} Seviyesine Ulaştınız!</h3>
            <p style="color: #6f42c1; margin: 0;">Harika bir başarı! Daha yüksek seviyelere ulaşmak için devam edin.</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Seviye atladığınız için tebrikler! Bu başarınız gamification sisteminde kaydedildi.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:6600/gamification" style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎮 Seviyenizi Görüntüle
            </a>
          </div>
        </div>
      </div>
    `
  }),

  priceDrop: (username, productName, oldPrice, newPrice) => ({
    subject: '💰 Fiyat Düştü: ' + productName,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px;">
          <h1 style="margin: 0; font-size: 28px;">💰 Fiyat Düştü!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Takip ettiğiniz ürünün fiyatı düştü</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Merhaba ${username}!</h2>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">${productName}</h3>
            <p style="color: #721c24; margin: 5px 0;">
              <span style="text-decoration: line-through; font-size: 16px;">Eski Fiyat: ${oldPrice} TL</span>
            </p>
            <p style="color: #721c24; font-size: 20px; font-weight: bold; margin: 5px 0;">
              🎉 Yeni Fiyat: ${newPrice} TL
            </p>
            <p style="color: #721c24; margin: 5px 0;">
              💰 Tasarruf: ${oldPrice - newPrice} TL
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Bu fırsatı kaçırmayın! Fiyat düşüşü sınırlı süre geçerli olabilir.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:6600/urunler" style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🛒 Hemen Al
            </a>
          </div>
        </div>
      </div>
    `
  })
};

const sendEmail = async (to, templateName, data = {}) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`E-posta şablonu bulunamadı: ${templateName}`);
    }

    const emailContent = typeof template === 'function' ? template(data) : template;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    log.info('E-posta gönderildi', { to, template: templateName, messageId: result.messageId });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    log.error('E-posta gönderme hatası', { to, template: templateName, error: error.message });
    return { success: false, error: error.message };
  }
};

const sendBulkEmail = async (recipients, templateName, data = {}) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, templateName, { ...data, username: recipient.username });
    results.push({ recipient, result });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailTemplates
}; 