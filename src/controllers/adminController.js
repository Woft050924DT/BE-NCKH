const adminService = require('../services/adminService');

// ==================== FACULTY MANAGEMENT ====================

const getFaculties = async (req, res) => {
  try {
    const result = await adminService.getFaculties();
    res.json(result);
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách khoa' });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getFacultyById(id);
    res.json(result);
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin khoa' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const result = await adminService.createFaculty(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create faculty error:', error);
    const statusCode = error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo khoa' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateFaculty(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update faculty error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi cập nhật khoa' });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteFaculty(id);
    res.json(result);
  } catch (error) {
    console.error('Delete faculty error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('không thể xóa') ? 409 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi xóa khoa' });
  }
};

// ==================== DEPARTMENT MANAGEMENT ====================

const getDepartments = async (req, res) => {
  try {
    const { faculty_id } = req.query;
    const result = await adminService.getDepartments({ faculty_id });
    res.json(result);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách bộ môn' });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getDepartmentById(id);
    res.json(result);
  } catch (error) {
    console.error('Get department by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin bộ môn' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const result = await adminService.createDepartment(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create department error:', error);
    const statusCode = error.message.includes('đã tồn tại') || error.message.includes('Không tìm thấy') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo bộ môn' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateDepartment(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update department error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi cập nhật bộ môn' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteDepartment(id);
    res.json(result);
  } catch (error) {
    console.error('Delete department error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('không thể xóa') ? 409 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi xóa bộ môn' });
  }
};

// ==================== CLASS MANAGEMENT ====================

const getClasses = async (req, res) => {
  try {
    const { department_id, major_id } = req.query;
    const result = await adminService.getClasses({ department_id, major_id });
    res.json(result);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách lớp học' });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getClassById(id);
    res.json(result);
  } catch (error) {
    console.error('Get class by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin lớp học' });
  }
};

const createClass = async (req, res) => {
  try {
    const result = await adminService.createClass(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create class error:', error);
    const statusCode = error.message.includes('đã tồn tại') || error.message.includes('Không tìm thấy') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo lớp học' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateClass(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update class error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi cập nhật lớp học' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteClass(id);
    res.json(result);
  } catch (error) {
    console.error('Delete class error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('không thể xóa') ? 409 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi xóa lớp học' });
  }
};

// ==================== USER MANAGEMENT ====================

const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const result = await adminService.getUsers({ role, status, search });
    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách người dùng' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getUserById(id);
    res.json(result);
  } catch (error) {
    console.error('Get user by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin người dùng' });
  }
};

const createUser = async (req, res) => {
  try {
    const result = await adminService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create user error:', error);
    const statusCode = error.message.includes('đã tồn tại') || error.message.includes('ít nhất') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo người dùng' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.updateUser(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update user error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi cập nhật người dùng' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error('Delete user error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 
                       error.message.includes('không thể xóa') ? 409 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi xóa người dùng' });
  }
};

// ==================== CREATE STUDENT ====================

const createStudent = async (req, res) => {
  try {
    const result = await adminService.createStudent(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create student error:', error);
    const statusCode = error.message.includes('đã tồn tại') || error.message.includes('Không tìm thấy') || error.message.includes('ít nhất') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo sinh viên' });
  }
};

// ==================== CREATE INSTRUCTOR ====================

const createInstructorAdmin = async (req, res) => {
  try {
    const result = await adminService.createInstructorAdmin(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create instructor error:', error);
    const statusCode = error.message.includes('đã tồn tại') || error.message.includes('Không tìm thấy') || error.message.includes('ít nhất') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo giảng viên' });
  }
};

// ==================== SYSTEM STATISTICS ====================

const getStatistics = async (req, res) => {
  try {
    const result = await adminService.getStatistics();
    res.json(result);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê hệ thống' });
  }
};

module.exports = {
  // Faculty Management
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,

  // Department Management
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  // Class Management
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,

  // User Management
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  // Create Student
  createStudent,

  // Create Instructor
  createInstructorAdmin,

  // Statistics
  getStatistics,
};
