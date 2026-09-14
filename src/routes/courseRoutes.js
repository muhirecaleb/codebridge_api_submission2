const router = require("express").Router();
const controller = require("../controllers/courseController");
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(controller.listCourses));
router.get("/:id", asyncHandler(controller.getCourse));
router.post("/add", auth, asyncHandler(controller.createCourse));

module.exports = router;
