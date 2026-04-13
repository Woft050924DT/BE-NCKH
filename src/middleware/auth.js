const { verifyToken } = require('../config/jwt');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.status) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc người dùng không tồn tại' });
    }

    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
