const thesisRoundService = require('../services/thesisRoundService');

const createThesisRound = async (req, res) => {
  try {
    const result = await thesisRoundService.createThesisRound(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create thesis round error:', error);
    res.status(500).json({ error: 'Lỗi tạo đợt đồ án' });
  }
};

const activateThesisRound = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.activateThesisRound(id);
    res.json(result);
  } catch (error) {
    console.error('Activate thesis round error:', error);
    res.status(500).json({ error: 'Lỗi kích hoạt đợt đồ án' });
  }
};

const assignInstructors = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.assignInstructors(id, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Assign instructors error:', error);
    res.status(500).json({ error: 'Lỗi phân công giảng viên' });
  }
};

const assignClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.assignClasses(id, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Assign classes error:', error);
    res.status(500).json({ error: 'Lỗi phân công lớp học' });
  }
};

const addGuidanceProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.addGuidanceProcess(id, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add guidance process error:', error);
    res.status(500).json({ error: 'Lỗi thêm quy trình hướng dẫn' });
  }
};

const getThesisRounds = async (req, res) => {
  try {
    const result = await thesisRoundService.getThesisRounds();
    res.json(result);
  } catch (error) {
    console.error('Get thesis rounds error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách đợt đồ án' });
  }
};

const getThesisRoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.getThesisRoundById(id);
    res.json(result);
  } catch (error) {
    console.error('Get thesis round error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin đợt đồ án' });
  }
};

module.exports = {
  createThesisRound,
  activateThesisRound,
  assignInstructors,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getThesisRoundById,
};
