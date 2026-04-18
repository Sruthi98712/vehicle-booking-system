const express = require('express');
const router = express.Router();
const { createReview, getUserReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.get('/:userId', getUserReviews);

module.exports = router;
