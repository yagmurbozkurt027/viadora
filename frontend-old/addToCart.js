const axios = require('axios');

const data = {
  userId: '686501fbf7b72bf3c1cd91d8', // MongoDB'den veya login sonrası userId
  items: [
    {
      product: '68650595f7b72bf3c1cd91db', // productList.js ile bulabilirsin
      quantity: 2
    }
  ]
};

axios.post('http://localhost:3000/api/cart', data)
  .then(response => {
    console.log('✅ Sepete eklendi:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Sepete eklenemedi:');
    console.error(error.response?.data || error.message);
  });