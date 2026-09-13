module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate resource' });
  }

  if (err.code && String(err.code).startsWith('ER_')) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
