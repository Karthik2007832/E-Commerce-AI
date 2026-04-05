const express = require('express');
const Interaction = require('../models/Interaction');
const router = express.Router();

// Log basic interaction without necessarily being logged in
router.post('/log', async (req, res) => {
  try {
    const { userId, productId, type } = req.body;
    
    if (req.dbStatus === 'mock') {
      console.log(`[SKIPPED] Interaction logged: User ${userId || 'guest'}, Product ${productId}, Type ${type}`);
      return res.status(201).json({ message: 'Interaction logged (Mock)' });
    }

    const interaction = new Interaction({
      userId: userId || null, // allow null if not logged in
      productId,
      type
    });
    await interaction.save();
    res.status(201).json({ message: 'Interaction logged' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all viewed products for a user to filter recommendations
router.get('/viewed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.dbStatus === 'mock' || !userId || userId === 'null') {
      return res.json([]); // Mock or invalid userId returns empty list
    }

    const views = await Interaction.find({ 
      userId, 
      type: { $in: ['view', 'click', 'add-to-cart'] } 
    }).select('productId');
    
    const viewedIds = [...new Set(views.map(v => v.productId))];
    res.json(viewedIds);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
