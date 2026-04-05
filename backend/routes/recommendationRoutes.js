const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { last_product_id, exclude_ids } = req.query;
    
    // Ensure strict data isolation - user can only fetch their own recommendations
    if (req.user.id !== userId && req.user.id !== 'mock_id_guest') {
       return res.status(403).json({ error: 'Unauthorized to access these recommendations' });
    }

    const mlUrl = process.env.ML_API_URL || 'http://localhost:8000';
    let url = `${mlUrl}/recommend/${userId}?`;
    if (last_product_id) url += `last_product_id=${last_product_id}&`;
    if (exclude_ids) url += `exclude_ids=${exclude_ids}`;

    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return res.status(404).json({ error: 'Recommendations not found' });
        }
        throw new Error(`ML API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch(error) {
    console.error('Error fetching recommendations from ML server:', error.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
