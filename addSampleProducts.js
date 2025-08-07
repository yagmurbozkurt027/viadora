// addSampleProducts.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viadora';

const sampleProducts = [
  {
    name: "Beyaz Spor Ayakkabı",
    description: "Rahat ve şık beyaz spor ayakkabı",
    price: 299.99,
    salePrice: 299.99,
    stock: 50,
    category: "Aksesuar",
    season: "Yaz",
    image: "/images/beyaz-spor-ayakkabı.jpg",
    brand: "Nike",
    color: "Beyaz",
    material: "Deri",
    sizes: [
      { name: "40", stock: 10 },
      { name: "42", stock: 15 },
      { name: "44", stock: 15 },
      { name: "46", stock: 10 }
    ]
  },
  {
    name: "Siyah Ceket",
    description: "Elegant siyah ceket",
    price: 599.99,
    salePrice: 599.99,
    stock: 25,
    category: "Ceket",
    season: "Sonbahar",
    image: "/images/siyah-ceket.jpg",
    brand: "Zara",
    color: "Siyah",
    material: "Yün",
    sizes: [
      { name: "S", stock: 5 },
      { name: "M", stock: 10 },
      { name: "L", stock: 10 }
    ]
  },
  {
    name: "Mavi Gömlek",
    description: "Klasik mavi gömlek",
    price: 199.99,
    salePrice: 199.99,
    stock: 40,
    category: "Bluz",
    season: "İlkbahar",
    image: "/images/mavi-gomlek.jpg",
    brand: "H&M",
    color: "Mavi",
    material: "Pamuk",
    sizes: [
      { name: "S", stock: 10 },
      { name: "M", stock: 15 },
      { name: "L", stock: 15 }
    ]
  },
  {
    name: "Kırmızı Elbise",
    description: "Şık kırmızı elbise",
    price: 399.99,
    salePrice: 399.99,
    stock: 15,
    category: "Elbise",
    season: "Yaz",
    image: "/images/kirmizi-elbise.jpg",
    brand: "Mango",
    color: "Kırmızı",
    material: "Polyester",
    sizes: [
      { name: "S", stock: 5 },
      { name: "M", stock: 5 },
      { name: "L", stock: 5 }
    ]
  },
  {
    name: "Gri Pantolon",
    description: "Rahat gri pantolon",
    price: 249.99,
    salePrice: 249.99,
    stock: 30,
    category: "Pantolon",
    season: "Sonbahar",
    image: "/images/gri-pantolon.jpg",
    brand: "Levi's",
    color: "Gri",
    material: "Kot",
    sizes: [
      { name: "36", stock: 10 },
      { name: "38", stock: 10 },
      { name: "40", stock: 10 }
    ]
  },
  {
    name: "Pembe Tişört",
    description: "Yazlık pembe tişört",
    price: 89.99,
    salePrice: 89.99,
    stock: 60,
    category: "Tişört",
    season: "Yaz",
    image: "/images/pembe-tisort.jpg",
    brand: "Pull&Bear",
    color: "Pembe",
    material: "Pamuk",
    sizes: [
      { name: "S", stock: 20 },
      { name: "M", stock: 20 },
      { name: "L", stock: 20 }
    ]
  },
  {
    name: "Kahverengi Bot",
    description: "Sıcak kahverengi bot",
    price: 449.99,
    salePrice: 449.99,
    stock: 20,
    category: "Aksesuar",
    season: "Kış",
    image: "/images/kahverengi-bot.jpg",
    brand: "Timberland",
    color: "Kahverengi",
    material: "Deri",
    sizes: [
      { name: "40", stock: 5 },
      { name: "42", stock: 10 },
      { name: "44", stock: 5 }
    ]
  },
  {
    name: "Lacivert Mont",
    description: "Sıcak lacivert mont",
    price: 799.99,
    salePrice: 799.99,
    stock: 10,
    category: "Mont",
    season: "Kış",
    image: "/images/lacivert-mont.jpg",
    brand: "The North Face",
    color: "Lacivert",
    material: "Naylon",
    sizes: [
      { name: "M", stock: 5 },
      { name: "L", stock: 5 }
    ]
  },
  {
    name: "Sarı Bluz",
    description: "Canlı sarı bluz",
    price: 159.99,
    salePrice: 159.99,
    stock: 35,
    category: "Bluz",
    season: "İlkbahar",
    image: "/images/sari-bluz.jpg",
    brand: "Bershka",
    color: "Sarı",
    material: "Polyester",
    sizes: [
      { name: "S", stock: 10 },
      { name: "M", stock: 15 },
      { name: "L", stock: 10 }
    ]
  },
  {
    name: "Yeşil Şapka",
    description: "Sportif yeşil şapka",
    price: 49.99,
    salePrice: 49.99,
    stock: 100,
    category: "Aksesuar",
    season: "Yaz",
    image: "/images/yesil-sapka.jpg",
    brand: "Adidas",
    color: "Yeşil",
    material: "Polyester",
    sizes: [
      { name: "L", stock: 100 }
    ]
  }
];

async function addSampleProducts() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut ürünleri temizle
    await Product.deleteMany({});
    console.log('Mevcut ürünler temizlendi');

    // Ürünleri tek tek ekle
    const addedProducts = [];
    for (const productData of sampleProducts) {
      try {
        const product = new Product(productData);
        await product.save();
        addedProducts.push(product);
        console.log(`✓ ${product.name} eklendi`);
      } catch (error) {
        console.error(`✗ ${productData.name} eklenirken hata:`, error.message);
      }
    }

    console.log(`\n${addedProducts.length} ürün başarıyla eklendi`);

    // Eklenen ürünleri listele
    const products = await Product.find({});
    console.log('\nEklenen ürünler:');
    products.forEach(product => {
      console.log(`- ${product.name}: ${product.salePrice}₺ (Stok: ${product.stock})`);
    });

    await mongoose.disconnect();
    console.log('\nİşlem tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
    await mongoose.disconnect();
  }
}

addSampleProducts(); 