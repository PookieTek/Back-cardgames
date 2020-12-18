const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/Youtube');
const auth = require('../middleware/auth');

router.post('/addModule', auth, youtubeController.AddModule);
router.post('/editModule', auth, youtubeController.UpdateModule);
router.post('/deleteModule', auth, youtubeController.DeleteModule);
router.post('/moveModule', auth, youtubeController.MoveModule);
router.get('/getModule/:id', auth, youtubeController.GetModuleById);

module.exports = router;