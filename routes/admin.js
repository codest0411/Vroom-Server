const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
router.get('/users', adminController.getUsers);
router.get('/payments', adminController.getPayments);
module.exports = router;
