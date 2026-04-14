const reportService = require('../services/reportService');

const createThesisTask = async (req, res) => {
  try {
    const result = await reportService.createThesisTask(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create thesis task error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo nhiệm vụ' });
  }
};

const updateThesisTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reportService.updateThesisTask(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update thesis task error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật nhiệm vụ' });
  }
};

const getThesisTasks = async (req, res) => {
  try {
    const { thesis_id } = req.query;
    const result = await reportService.getThesisTasks({ thesis_id });
    res.json(result);
  } catch (error) {
    console.error('Get thesis tasks error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách nhiệm vụ' });
  }
};

const createWeeklyReport = async (req, res) => {
  try {
    const result = await reportService.createWeeklyReport(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create weekly report error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo báo cáo tuần' });
  }
};

const updateWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reportService.updateWeeklyReport(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update weekly report error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật báo cáo tuần' });
  }
};

const getWeeklyReports = async (req, res) => {
  try {
    const { thesis_id } = req.query;
    const result = await reportService.getWeeklyReports({ thesis_id });
    res.json(result);
  } catch (error) {
    console.error('Get weekly reports error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách báo cáo tuần' });
  }
};

const addIndividualContribution = async (req, res) => {
  try {
    const result = await reportService.addIndividualContribution(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add individual contribution error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi thêm đóng góp cá nhân' });
  }
};

const submitFinalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reportService.submitFinalReport(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Submit final report error:', error);
    res.status(500).json({ error: 'Lỗi nộp báo cáo cuối kỳ' });
  }
};

const getThesisProgress = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await reportService.getThesisProgress(thesisId);
    res.json(result);
  } catch (error) {
    console.error('Get thesis progress error:', error);
    res.status(500).json({ error: 'Lỗi lấy tiến độ đồ án' });
  }
};

module.exports = {
  createThesisTask,
  updateThesisTask,
  getThesisTasks,
  createWeeklyReport,
  updateWeeklyReport,
  getWeeklyReports,
  addIndividualContribution,
  submitFinalReport,
  getThesisProgress,
};
