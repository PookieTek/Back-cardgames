const express = require('express');
const router = express.Router();
const newsController = require('../controllers/News');
const auth = require('../middleware/auth');

router.post('/addModule', auth, newsController.AddModule);
router.post('/editModule', auth, newsController.UpdateModule);
router.post('/deleteModule', auth, newsController.DeleteModule);
router.post('/moveModule', auth, newsController.MoveModule);
router.get('/getModule/:id', auth, newsController.GetModuleById);

module.exports = router;