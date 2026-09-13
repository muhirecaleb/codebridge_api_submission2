const pool = require('../config/db');

exports.listCourses = async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const sort = String(req.query.sort || 'asc').toLowerCase();

  if (!['asc', 'desc'].includes(sort)) {
    return res.status(400).json({ success: false, message: 'sort must be asc or desc' });
  }

  const where = [];
  const params = [];

  if (search) {
    where.push('(title LIKE ? OR category LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    where.push('category = ?');
    params.push(category);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM courses ${whereSql}`, params
  );

  const [courses] = await pool.execute(
    `SELECT id, title, description, category, price, created_at
     FROM courses ${whereSql}
     ORDER BY price ${sort === 'asc' ? 'ASC' : 'DESC'}, id ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const total = Number(countRows[0].total);

  return res.json({
    success: true,
    data: courses,
    pagination: { page, limit, offset, total, totalPages: Math.ceil(total / limit) }
  });
};

exports.getCourse = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid course ID' });
  }

  const [rows] = await pool.execute(
    'SELECT id, title, description, category, price, created_at FROM courses WHERE id = ? LIMIT 1',
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  return res.json({ success: true, data: rows[0] });
};
