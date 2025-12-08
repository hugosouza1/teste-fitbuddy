const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');

router.get('/search/:name', gymController.searchGym);
router.post('/register', gymController.createGym);

module.exports = router;