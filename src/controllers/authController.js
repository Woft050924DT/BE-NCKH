const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json({
      success: true,
      data: result,
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('bắt buộc') ? 400 : 401;
    res.status(statusCode).json({
      success: false,
      data: null,
      message: error.message || 'Lỗi đăng nhập'
    });
  }
};

const logout = async (req, res) => {
  try {
    const result = authService.logout();
    res.json({
      success: true,
      data: result,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi đăng xuất'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await authService.getProfile(req.user);
    res.json({
      success: true,
      data: result,
      message: 'Lấy thông tin thành công'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    const statusCode = error.message.includes('Thiếu') ? 400 : 
                       error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      data: null,
      message: error.message || 'Lỗi lấy thông tin người dùng'
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
};
