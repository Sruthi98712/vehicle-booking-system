const express = require('express');
const router = express.Router();
const intelligenceController = require('../controllers/intelligence.controller');
const { protect } = require('../middleware/auth.middleware');

// Public Search
router.get('/smart-search', intelligenceController.performSmartSearch);

// Protected Chat
router.use(protect);
router.post('/ai-chat', intelligenceController.handleAIChat);
router.get('/chat-history', intelligenceController.getChatHistory);

module.exports = router;
