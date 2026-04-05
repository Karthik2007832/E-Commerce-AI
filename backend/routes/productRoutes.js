const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

let mockProducts = [];
let isDummyFetched = false;

const fetchDummyJsonProducts = async () => {
  if (isDummyFetched) return mockProducts;
  try {
    console.log("Fetching products from DummyJSON...");
    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = await response.json();
    const dummyItems = data.products || [];
    
    mockProducts = dummyItems.map(p => ({
      externalId: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.thumbnail,
      rating: {
        rate: p.rating,
        count: Math.floor(Math.random() * 500) + 10
      }
    }));
    
    // Pad to 200 items as required
    let index = mockProducts.length;
    while(mockProducts.length < 200) {
      if (dummyItems.length === 0) break;
      const baseItem = dummyItems[Math.floor(Math.random() * dummyItems.length)];
      index++;
      mockProducts.push({
        externalId: 1000 + index,
        title: `${baseItem.title} - Variant V${index}`,
        price: baseItem.price,
        description: baseItem.description,
        category: baseItem.category,
        image: baseItem.thumbnail,
        rating: {
          rate: baseItem.rating,
          count: Math.floor(Math.random() * 500) + 10
        }
      });
    }
    console.log(`✅ Loaded ${mockProducts.length} products from DummyJSON API.`);
    isDummyFetched = true;
  } catch (err) {
    console.error("❌ Failed to fetch from DummyJSON:", err);
  }
  return mockProducts;
};

// Start fetch in background
fetchDummyJsonProducts();

// GET all products or search with pagination
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let productsList = [];
    let totalCount = 0;

    if (req.dbStatus === 'mock') {
      // Mock Pagination & Search
      productsList = mockProducts;
      if (q) {
        const query = q.toString().toLowerCase();
        productsList = productsList.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }
      totalCount = productsList.length;
      productsList = productsList.slice(skip, skip + Number(limit));
    } else {
      // DB Pagination & Search
      const filter = q ? {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      } : {};
      
      totalCount = await Product.countDocuments(filter);
      productsList = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    res.json({
      products: productsList,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      hasMore: skip + productsList.length < totalCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET single product by internal DB ID or externalId
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let product;

    if (req.dbStatus === 'mock') {
      product = mockProducts.find(p => p.externalId === Number(id));
    } else {
      // try finding by mongo object id first then externalId
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ externalId: Number(id) });
      }
      
      // Fallback to mock if not found in DB but in mock list
      if (!product) {
        product = mockProducts.find(p => p.externalId === Number(id));
      }
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
