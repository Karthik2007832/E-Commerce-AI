const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const router = express.Router();

const MOCK_USERS_PATH = path.join(__dirname, '../data/mock_users.json');

// Helper to ensure data directory and file exist
const ensureMockUserStorage = () => {
  const dir = path.dirname(MOCK_USERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_USERS_PATH)) {
    fs.writeFileSync(MOCK_USERS_PATH, JSON.stringify([], null, 2));
  }
};

const getMockUsers = () => {
  try {
    ensureMockUserStorage();
    const data = fs.readFileSync(MOCK_USERS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading mock users:', error);
    return [];
  }
};

const saveMockUser = (user) => {
  try {
    ensureMockUserStorage();
    const users = getMockUsers();
    users.push(user);
    fs.writeFileSync(MOCK_USERS_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving mock user:', error);
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (req.dbStatus === 'mock') {
      const users = getMockUsers();
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const dummyId = "mock_id_" + Buffer.from(email).toString('base64').substring(0, 8);
      const newUser = { id: dummyId, username, email, password };
      saveMockUser(newUser);
      
      const token = jwt.sign({ id: dummyId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.status(201).json({ token, user: { id: dummyId, username, email } });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.dbStatus === 'mock') {
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) return res.status(400).json({ error: 'Invalid Credentials' });
      if (user.password !== password) return res.status(400).json({ error: 'Invalid Credentials' });
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.json({ token, user: { id: user.id, username: user.username, email } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;

