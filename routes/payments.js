const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
router.post('/pay', paymentsController.pay);
router.post('/create-checkout-session', paymentsController.createCheckoutSession);
module.exports = router;
