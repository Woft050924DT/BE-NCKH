const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');
const {
  getThesisRounds,
  createThesisRound,
  getThesisRoundById,
  updateRoundStatus,
} = require('../controllers/thesisRoundController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireRole('admin'));

// ==================== FACULTY MANAGEMENT ====================
router.get('/faculties', getFaculties);
router.get('/faculties/:id', getFacultyById);
router.post('/faculties', createFaculty);
router.put('/faculties/:id', updateFaculty);
router.delete('/faculties/:id', deleteFaculty);

// ==================== DEPARTMENT MANAGEMENT ====================
router.get('/departments', getDepartments);
router.get('/departments/:id', getDepartmentById);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// ==================== CLASS MANAGEMENT ====================
router.get('/classes', getClasses);
router.get('/classes/:id', getClassById);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

// ==================== USER MANAGEMENT ====================
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ==================== CREATE STUDENT ====================
router.post('/students', createStudent);

// ==================== CREATE INSTRUCTOR ====================
router.post('/instructors', createInstructorAdmin);

// ==================== THESIS ROUND MANAGEMENT ====================
router.get('/thesis-rounds', getThesisRounds);
router.get('/thesis-rounds/:id', getThesisRoundById);
router.post('/thesis-rounds', createThesisRound);
router.put('/thesis-rounds/:id/status', updateRoundStatus);

// ==================== SYSTEM STATISTICS ====================
router.get('/statistics', getStatistics);

module.exports = router;
