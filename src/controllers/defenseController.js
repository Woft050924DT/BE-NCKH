const defenseService = require('../services/defenseService');

const createDefenseCouncil = async (req, res) => {
  try {
    const result = await defenseService.createDefenseCouncil(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create defense council error:', error);
    res.status(500).json({ error: 'Lỗi tạo hội đồng bảo vệ' });
  }
};

const addCouncilMember = async (req, res) => {
  try {
    const result = await defenseService.addCouncilMember(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add council member error:', error);
    res.status(500).json({ error: 'Lỗi thêm thành viên hội đồng' });
  }
};

const createDefenseAssignment = async (req, res) => {
  try {
    const result = await defenseService.createDefenseAssignment(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create defense assignment error:', error);
    res.status(500).json({ error: 'Lỗi tạo phân công bảo vệ' });
  }
};

const submitDefenseResult = async (req, res) => {
  try {
    const result = await defenseService.submitDefenseResult(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit defense result error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi nộp kết quả bảo vệ' });
  }
};

const completeDefenseCouncil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await defenseService.completeDefenseCouncil(id);
    res.json(result);
  } catch (error) {
    console.error('Complete defense council error:', error);
    res.status(500).json({ error: 'Lỗi hoàn thành hội đồng bảo vệ' });
  }
};

const getDefenseSchedule = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await defenseService.getDefenseSchedule(thesisId);
    res.json(result);
  } catch (error) {
    console.error('Get defense schedule error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy lịch bảo vệ' });
  }
};

const getDefenseResults = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await defenseService.getDefenseResults(thesisId);
    res.json(result);
  } catch (error) {
    console.error('Get defense results error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy kết quả bảo vệ' });
  }
};

const finalizeThesis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await defenseService.finalizeThesis(id);
    res.json(result);
  } catch (error) {
    console.error('Finalize thesis error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi hoàn thành đồ án' });
  }
};

module.exports = {
  createDefenseCouncil,
  addCouncilMember,
  createDefenseAssignment,
  submitDefenseResult,
  completeDefenseCouncil,
  getDefenseSchedule,
  getDefenseResults,
  finalizeThesis,
};
