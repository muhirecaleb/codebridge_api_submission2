const pool = require('../config/db');

exports.enroll = async (req, res) => {
  const courseIds = Array.isArray(req.body.course_ids)
    ? req.body.course_ids
    : [req.body.course_id];

  if (!courseIds.length || courseIds.some(id => !Number.isInteger(Number(id)) || Number(id) < 1)) {
    return res.status(400).json({ success: false, message: 'Provide a valid course_id or course_ids' });
  }

  const ids = [...new Set(courseIds.map(Number))];
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const placeholders = ids.map(() => '?').join(',');
    const [courses] = await conn.execute(
      `SELECT id FROM courses WHERE id IN (${placeholders})`,
      ids
    );

    if (courses.length !== ids.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'One or more courses do not exist' });
    }

    const enrollmentPlaceholders = ids.map(() => '(?, ?)').join(',');
    const enrollmentParams = ids.flatMap(courseId => [req.user.id, courseId]);

    try {
      await conn.execute(
        `INSERT INTO enrollments (user_id, course_id) VALUES ${enrollmentPlaceholders}`,
        enrollmentParams
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        await conn.rollback();
        return res.status(409).json({ success: false, message: 'One or more courses are already enrolled' });
      }
      throw err;
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Enrollment successful',
      enrolled_course_ids: ids
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.myCourses = async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.id, c.title, c.description, c.category, c.price, e.enrolled_at
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = ?
     ORDER BY e.enrolled_at DESC`,
    [req.user.id]
  );

  return res.json({ success: true, data: rows });
};

exports.dropCourse = async (req, res) => {
  const courseId = Number.parseInt(req.params.courseId, 10);
  if (!Number.isInteger(courseId) || courseId < 1) {
    return res.status(400).json({ success: false, message: 'Invalid course ID' });
  }

  const [result] = await pool.execute(
    'DELETE FROM enrollments WHERE user_id = ? AND course_id = ?',
    [req.user.id, courseId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  return res.json({ success: true, message: 'Course dropped successfully' });
};
