const axios = require('axios');

axios.get('http://localhost:3000/api/products')
  .then(response => {
    console.log('✅ Ürünler:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Ürünler alınamadı:');
    console.error(error.response?.data || error.message);
  });