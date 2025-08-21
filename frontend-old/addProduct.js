const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY1MDFmYmY3YjcyYmYzYzFjZDkxZDgiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzUxNDUwODYyLCJleHAiOjE3NTE1MzcyNjJ9.EaEZqEnEEbiwEuFobGs99af7MfryHXRvq_flhShrH-A'; // login.js'den aldığın token

const data = {
  name: 'Test Ürünü',
  price: 99.99,
  description: 'Açıklama',
  category: 'Elektronik',
  stock: 10
};

axios.post('http://localhost:3000/api/products', data, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(response => {
    console.log('✅ Ürün eklendi:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Ürün eklenemedi:');
    console.error(error.response?.data || error.message);
  }); 