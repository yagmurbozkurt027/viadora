const axios = require('axios');

const data = {
  userId: '686501fbf7b72bf3c1cd91d8'
};

axios.post('http://localhost:3000/api/orders', data)
  .then(response => {
    console.log('✅ Sipariş oluşturuldu:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Sipariş oluşturulamadı:');
    console.error(error.response?.data || error.message);
  });