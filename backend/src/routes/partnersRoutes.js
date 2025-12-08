const express = require('express');
const router = express.Router();
const partnersController = require('../controllers/partnersController');

router.get('/suggestions/:email', partnersController.getPartnerSuggestions);
router.post('/add', partnersController.addPartner);
router.post('/accept', partnersController.acceptFriendship);
router.delete('/delete', partnersController.deleteFriendship);

module.exports = router;