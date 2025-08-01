const axios = require('axios');

const userId = '686501fbf7b72bf3c1cd91d8';

axios.get(`http://localhost:3000/api/cart/${userId}`)
  .then(response => {
    console.log('✅ Sepet:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Sepet alınamadı:');
    console.error(error.response?.data || error.message);
  });