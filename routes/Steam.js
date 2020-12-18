const express = require('express');
const router = express.Router();
const steamController = require('../controllers/Steam');
const auth = require('../middleware/auth');

router.post('/addModule', auth, steamController.AddModule);
router.post('/editModule', auth, steamController.UpdateModule);
router.post('/deleteModule', auth, steamController.DeleteModule);
router.post('/moveModule', auth, steamController.MoveModule);

router.get('/getModule/:id', auth, steamController.GetModuleById);
router.get('/getData/1/:id', auth, steamController.GetTimesGame);
router.get('/getData/2/:appid', auth, steamController.GetPlayerByGame);
router.get('/getData/3/:id', auth, steamController.GetFriendList);
router.get('/searchgame/:name', auth, steamController.SearchGame);

module.exports = router;