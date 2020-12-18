const express = require('express');
const router = express.Router();
const discordController = require('../controllers/Discord');
const auth = require('../middleware/auth');

router.post('/addModule', auth, discordController.AddModule);
router.post('/editModule', auth, discordController.UpdateModule);
router.post('/deleteModule', auth, discordController.DeleteModule);
router.post('/moveModule', auth, discordController.MoveModule);

router.get('/getModule/:id', auth, discordController.GetModuleById);
router.get('/getLoginLink', auth, discordController.GetLogin);
router.get('/getMe/:id', auth, discordController.GetMe);
router.get('/getGuilds/:id', auth, discordController.GetFriends);

module.exports = router;