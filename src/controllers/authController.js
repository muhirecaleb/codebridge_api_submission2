const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

exports.register = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (typeof full_name !== 'string' || full_name.trim().length < 2 || full_name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'Full name must be between 2 and 100 characters' });
  }

  if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email is required' });
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ success: false, message: 'Password must be between 8 and 72 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(password, rounds);

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name.trim(), normalizedEmail, hashedPassword]
    );

    const user = { id: result.insertId, full_name: full_name.trim(), email: normalizedEmail, role: 'student' };
    return res.status(201).json({ success: true, message: 'Registration successful', user, token: makeToken(user) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    throw err;
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Valid email and password are required' });
  }

  const [rows] = await pool.execute(
    'SELECT id, full_name, email, password, role FROM users WHERE email = ? LIMIT 1',
    [email.trim().toLowerCase()]
  );

  if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const { password: _, ...user } = rows[0];
  return res.json({ success: true, message: 'Login successful', user, token: makeToken(user) });
};

exports.profile = async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, user: rows[0] });
};
