const router = require('express').Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.get('/profile', auth, asyncHandler(controller.profile));

module.exports = router;
