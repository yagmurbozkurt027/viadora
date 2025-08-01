const axios = require('axios');

const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post('http://localhost:3000/api/users/register', {
      username,
      email,
      password
    });
    console.log('✅ Kayıt başarılı:', response.data.message || response.data);
  } catch (error) {
    console.error('❌ Kayıt başarısız!');
    if (error.response) {
      console.error('Durum:', error.response.status);
      console.error('Veri:', error.response.data);
    } else if (error.request) {
      console.error('Sunucudan hiç cevap alınamadı:', error.request);
    } else {
      console.error('Hata:', error.message);
    }
  }
};

// Son kullanıcı bilgileriyle kayıt
registerUser('yenikullanici', 'yeni@example.com', '123456');