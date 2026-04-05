const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('../models/Product');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-ai';

const seedProducts = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Old products cleared.');

    const response = await axios.get('https://fakestoreapi.com/products');
    const products = response.data;

    const mappedProducts = products.map(p => ({
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      rating: {
        rate: p.rating.rate,
        count: p.rating.count
      },
      externalId: p.id
    }));

    await Product.insertMany(mappedProducts);
    console.log(`✅ Successfully seeded ${mappedProducts.length} products.`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedProducts();
