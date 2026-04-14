const instructorService = require('../services/instructorService');

const getInstructors = async (req, res) => {
  try {
    const { thesis_round_id, search, department_id } = req.query;
    const result = await instructorService.getInstructors({ thesis_round_id, search, department_id });
    res.json(result);
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách giảng viên' });
  }
};

const getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await instructorService.getInstructorById(id);
    res.json(result);
  } catch (error) {
    console.error('Get instructor by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin giảng viên' });
  }
};

const createInstructor = async (req, res) => {
  try {
    const result = await instructorService.createInstructor(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create instructor error:', error);
    const statusCode = error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo giảng viên' });
  }
};

module.exports = {
  getInstructors,
  getInstructorById,
  createInstructor,
};
