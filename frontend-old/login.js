const axios = require('axios');

const data = {
  email: 'yeni@example.com',
  password: '123456'
};

axios.post('http://localhost:3001/api/users/login', data)
  .then(response => {
    console.log('✅ Giriş başarılı:');
    console.log(response.data.token);
  })
  .catch(error => {
    console.error('❌ Giriş başarısız:');
    if (error.response) {
      console.error('Durum:', error.response.status);
      console.error('Veri:', error.response.data);
    } else {
      console.error(error.message);
    }
  });