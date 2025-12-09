const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/getGrupos', groupController.getGrupos);
router.get('/getMembers/:id', groupController.getMembers);
router.post('/createGrupo', groupController.createGrupo);
router.delete('/removeMember', groupController.removeMember);
router.post('/:id/invite', groupController.inviteMembers);

router.put('/updateGroup/:id', groupController.updateGroup);
router.get('/friends/:id', groupController.getFriends);
router.post('/accept-invite', groupController.acceptGroupInvite);
router.delete('/reject-invite', groupController.rejectGroupInvite);

module.exports = router;