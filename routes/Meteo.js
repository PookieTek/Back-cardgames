const express = require('express');
const router = express.Router();
const meteoController = require('../controllers/Meteo');
const auth = require('../middleware/auth');

router.post('/addModule', auth, meteoController.AddModule);
router.post('/editModule', auth, meteoController.UpdateModule);
router.post('/deleteModule', auth, meteoController.DeleteModule);
router.post('/moveModule', auth, meteoController.MoveModule);

router.get('/getModule/:id', auth, meteoController.GetModuleById);

module.exports = router;