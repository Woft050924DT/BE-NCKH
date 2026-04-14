const gradingService = require('../services/gradingService');

const createReviewAssignment = async (req, res) => {
  try {
    const result = await gradingService.createReviewAssignment(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create review assignment error:', error);
    res.status(500).json({ error: 'Lỗi tạo phân công chấm bài' });
  }
};

const submitReviewResult = async (req, res) => {
  try {
    const result = await gradingService.submitReviewResult(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit review result error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi nộp kết quả chấm bài' });
  }
};

const submitSupervisionComment = async (req, res) => {
  try {
    const result = await gradingService.submitSupervisionComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit supervision comment error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi nộp nhận xét hướng dẫn' });
  }
};

const submitPeerEvaluation = async (req, res) => {
  try {
    const result = await gradingService.submitPeerEvaluation(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit peer evaluation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi nộp đánh giá đồng đẳng' });
  }
};

const reviewWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await gradingService.reviewWeeklyReport(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Review weekly report error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi đánh giá báo cáo tuần' });
  }
};

const getThesisScores = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await gradingService.getThesisScores(thesisId);
    res.json(result);
  } catch (error) {
    console.error('Get thesis scores error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy điểm số đồ án' });
  }
};

module.exports = {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
};
