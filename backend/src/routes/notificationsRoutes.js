const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/friendship/:email', notificationsController.friendshipNotifications);
router.get('/group/:email', notificationsController.groupNotifications);
router.put('/user/:email/notified', notificationsController.updateUserNotified);

module.exports = router;