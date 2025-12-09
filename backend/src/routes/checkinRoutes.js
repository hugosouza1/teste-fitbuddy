const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

router.get('/today/:email', checkinController.getCheckinToday)
router.post('/register', checkinController.registerCheckin)

module.exports = router;