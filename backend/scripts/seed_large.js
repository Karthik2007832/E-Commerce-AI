const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-ai';

const categories = ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Jewelry", "Beauty", "Automotive", "Toys"];

const productTitles = [
  "Premium Wireless Headphones", "Smart LED Desk Lamp", "Ergonomic Office Chair", "4K Ultra HD Monitor",
  "Stainless Steel Water Bottle", "Yoga Mat Pro", "Minimalist Leather Wallet", "Bluetooth Soundbar",
  "Automatic Espresso Machine", "Organic Cotton T-Shirt", "Designer Running Shoes", "Gold Plated Ring",
  "Ceramic Face Mask", "Portable Car Vacuum", "Building Blocks Set", "Hydrating Facial Mist",
  "Mechanical Gaming Keyboard", "Portable SSD 1TB", "Solar Powered Power Bank", "Electric Toothbrush Pro",
  "Anti-Glare Sunglasses", "Heavy Duty Backpack", "Adjustable Dumbbells", "Digital Air Fryer",
  "Smart Thermostat", "Cordless Drill Set", "Memory Foam Pillow", "Wireless Charging Pad"
];

const productImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1544117518-e1581179059a",
  "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6",
  "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
  "https://images.unsplash.com/photo-1539533377285-b82582875b28",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  "https://images.unsplash.com/photo-1505843490701-5be5d0b19d58",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1581783898377-1c85bf937427"
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const products = [];
    for (let i = 1; i <= 220; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const baseTitle = productTitles[Math.floor(Math.random() * productTitles.length)];
      const title = `${baseTitle} v${i}`;
      const image = productImages[Math.floor(Math.random() * productImages.length)] + `?auto=format&fit=crop&q=80&w=1000&sig=${i}`;
      
      products.push({
        externalId: i,
        title,
        price: Math.floor(Math.random() * 500) + 10,
        description: `High-quality ${title} designed for modern use. Part of our premium ${category} collection. Featuring durable materials and state-of-the-art tech.`,
        category,
        image,
        rating: {
          rate: (Math.random() * 2 + 3).toFixed(1),
          count: Math.floor(Math.random() * 1000) + 1
        }
      });
    }

    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products!`);
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
