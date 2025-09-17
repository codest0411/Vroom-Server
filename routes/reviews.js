const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
router.post('/rate', reviewsController.rate);
module.exports = router;
