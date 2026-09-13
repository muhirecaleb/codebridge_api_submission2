const router = require('express').Router();
const controller = require('../controllers/courseController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(controller.listCourses));
router.get('/:id', asyncHandler(controller.getCourse));

module.exports = router;
