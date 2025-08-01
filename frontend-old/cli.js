const axios = require('axios');
const inquirer = require('inquirer');
let token = null;
let userId = null;

async function mainMenu() {
  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Bir işlem seçin:',
        choices: [
          { name: '1- Kayıt ol', value: 'register' },
          { name: '2- Giriş yap', value: 'login' },
          { name: '3- Ürünleri listele', value: 'listProducts' },
          { name: '4- Ürün ekle', value: 'addProduct' },
          { name: '5- Sepete ürün ekle', value: 'addToCart' },
          { name: '6- Sepeti görüntüle', value: 'getCart' },
          { name: '7- Sipariş oluştur', value: 'order' },
          { name: '0- Çıkış', value: 'exit' }
        ]
      }
    ]);

    if (choice === 'exit') {
      console.log('Güle güle!');
      process.exit(0);
    }

    await handleChoice(choice);
  }
}

async function handleChoice(choice) {
  switch (choice) {
    case 'register':
      await register();
      break;
    case 'login':
      await login();
      break;
    case 'listProducts':
      await listProducts();
      break;
    case 'addProduct':
      await addProduct();
      break;
    case 'addToCart':
      await addToCart();
      break;
    case 'getCart':
      await getCart();
      break;
    case 'order':
      await createOrder();
      break;
    default:
      break;
  }
}

async function register() {
  const { username, email, password } = await inquirer.prompt([
    { name: 'username', message: 'Kullanıcı adı:' },
    { name: 'email', message: 'Email:' },
    { name: 'password', message: 'Şifre:', type: 'password' }
  ]);
  try {
    const res = await axios.post('http://localhost:3000/api/users/register', { username, email, password });
    console.log('✅ Kayıt başarılı:', res.data.message || res.data);
  } catch (err) {
    console.error('❌ Kayıt başarısız:', err.response?.data || err.message);
  }
}

async function login() {
  const { email, password } = await inquirer.prompt([
    { name: 'email', message: 'Email:' },
    { name: 'password', message: 'Şifre:', type: 'password' }
  ]);
  try {
    const res = await axios.post('http://localhost:3000/api/users/login', { email, password });
    token = res.data.token;
    // Token'dan userId'yi almak için backend'de decode edebilirsin, burada basitçe userId'yi soralım:
    const { userIdInput } = await inquirer.prompt([
      { name: 'userIdInput', message: 'Kendi userId\'nizi girin (MongoDB\'den veya kayıttan alın):' }
    ]);
    userId = userIdInput;
    console.log('✅ Giriş başarılı! Token:', token);
  } catch (err) {
    console.error('❌ Giriş başarısız:', err.response?.data || err.message);
  }
}

async function listProducts() {
  try {
    const res = await axios.get('http://localhost:3000/api/products');
    console.log('✅ Ürünler:', res.data);
  } catch (err) {
    console.error('❌ Ürünler alınamadı:', err.response?.data || err.message);
  }
}

async function addProduct() {
  if (!token) {
    console.log('Önce giriş yapmalısınız!');
    return;
  }
  const { name, price, description, category, stock } = await inquirer.prompt([
    { name: 'name', message: 'Ürün adı:' },
    { name: 'price', message: 'Fiyat:', type: 'number' },
    { name: 'description', message: 'Açıklama:' },
    { name: 'category', message: 'Kategori:' },
    { name: 'stock', message: 'Stok:', type: 'number' }
  ]);
  try {
    const res = await axios.post('http://localhost:3000/api/products',
      { name, price, description, category, stock },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Ürün eklendi:', res.data);
  } catch (err) {
    console.error('❌ Ürün eklenemedi:', err.response?.data || err.message);
  }
}

async function addToCart() {
  if (!userId) {
    console.log('Önce giriş yapmalısınız!');
    return;
  }
  const { product, quantity } = await inquirer.prompt([
    { name: 'product', message: 'Ürün id:' },
    { name: 'quantity', message: 'Adet:', type: 'number' }
  ]);
  try {
    const res = await axios.post('http://localhost:3000/api/cart', {
      userId,
      items: [{ product, quantity }]
    });
    console.log('✅ Sepete eklendi:', res.data);
  } catch (err) {
    console.error('❌ Sepete eklenemedi:', err.response?.data || err.message);
  }
}

async function getCart() {
  if (!userId) {
    console.log('Önce giriş yapmalısınız!');
    return;
  }
  try {
    const res = await axios.get(`http://localhost:3000/api/cart/${userId}`);
    console.log('✅ Sepet:', res.data);
  } catch (err) {
    console.error('❌ Sepet alınamadı:', err.response?.data || err.message);
  }
}

async function createOrder() {
  if (!userId) {
    console.log('Önce giriş yapmalısınız!');
    return;
  }
  try {
    const res = await axios.post('http://localhost:3000/api/orders', { userId });
    console.log('✅ Sipariş oluşturuldu:', res.data);
  } catch (err) {
    console.error('❌ Sipariş oluşturulamadı:', err.response?.data || err.message);
  }
}

mainMenu();