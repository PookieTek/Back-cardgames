const express = require('express');
const router = express.Router();
const userController = require('../controllers/User');
const auth = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/authgoogle', userController.getUserInfo);
router.post('/edit', auth, userController.update);
router.post('/changepwd', auth, userController.changePwd);
router.post('/deleteMe', auth, userController.deleteMe);

router.get('/getGoogle', userController.getConnexionUrl);
router.get('/me', auth, userController.me);
module.exports = router;