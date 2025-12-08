const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.put('/updateGroup/:id', groupController.updateGroup);
router.get('/getGrupos', groupController.getGrupos)
router.get('/getMembers/:id', groupController.getMembers)
router.post('/createGrupo', groupController.createGrupo)
router.put('/addMember', groupController.addMember)
router.delete('/removeMember', groupController.removeMember)

module.exports = router;