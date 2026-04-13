const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: 'Lỗi cơ sở dữ liệu' });
  }

  res.status(500).json({ error: 'Lỗi server nội bộ' });
};

module.exports = errorHandler;
