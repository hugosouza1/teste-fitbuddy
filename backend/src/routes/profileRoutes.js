const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/profile/:email', profileController.getUserProfile);
router.delete('/deleteProfile/:email', profileController.deleteProfile); 
router.put('/profile', profileController.updateUserProfile);
router.post('/register', profileController.createUser);
router.post('/login', profileController.getCredenciais);

module.exports = router;
