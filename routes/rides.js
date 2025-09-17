const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/ridesController');
router.post('/book', ridesController.bookRide);
router.get('/history', ridesController.getHistory);
router.get('/driver', ridesController.getDriverRides);
router.post('/accept', ridesController.acceptRide);
module.exports = router;
