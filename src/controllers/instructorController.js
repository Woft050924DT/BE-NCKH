const instructorService = require('../services/instructorService');

const getSupervisedStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { thesis_round_id, status } = req.query;
    const result = await instructorService.getSupervisedStudents(id, { thesis_round_id, status });
    res.json(result);
  } catch (error) {
    console.error('Get supervised students error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách sinh viên được hướng dẫn' });
  }
};

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

const getInstructorByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await instructorService.getInstructorByUserId(user_id);
    res.json(result);
  } catch (error) {
    console.error('Get instructor by user ID error:', error);
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

const getInstructorsByDepartmentHead = async (req, res) => {
  try {
    const { thesis_round_id, search, department_id } = req.query;
    // Nếu có authentication, lấy department_id từ req.user
    const deptId = req.user?.departmentId || department_id;
    
    if (!deptId) {
      return res.status(400).json({ error: 'Thiếu department_id' });
    }
    
    const result = await instructorService.getInstructorsByDepartmentHead(deptId, { thesis_round_id, search });
    res.json(result);
  } catch (error) {
    console.error('Get instructors by department head error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách giảng viên theo bộ môn' });
  }
};

module.exports = {
  getInstructors,
  getInstructorById,
  getInstructorByUserId,
  createInstructor,
  getInstructorsByDepartmentHead,
  getSupervisedStudents,
};
