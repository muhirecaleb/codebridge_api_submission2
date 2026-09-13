const router = require('express').Router();
const controller = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(auth);
router.post('/', asyncHandler(controller.enroll));
router.get('/mine', asyncHandler(controller.myCourses));
router.delete('/:courseId', asyncHandler(controller.dropCourse));

module.exports = router;
