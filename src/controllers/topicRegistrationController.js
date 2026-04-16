const topicRegistrationService = require('../services/topicRegistrationService');

const createProposedTopic = async (req, res) => {
  try {
    const result = await topicRegistrationService.createProposedTopic(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create proposed topic error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo đề tài đề xuất' });
  }
};

const getProposedTopics = async (req, res) => {
  try {
    const { thesis_round_id } = req.query;
    const result = await topicRegistrationService.getProposedTopics({ thesis_round_id });
    res.json(result);
  } catch (error) {
    console.error('Get proposed topics error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách đề tài' });
  }
};

const createTopicRegistration = async (req, res) => {
  try {
    const result = await topicRegistrationService.createTopicRegistration(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create topic registration error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi đăng ký đề tài' });
  }
};

const getTopicRegistrations = async (req, res) => {
  try {
    const { status, student_id } = req.query;
    const result = await topicRegistrationService.getTopicRegistrations({ status, student_id });
    res.json(result);
  } catch (error) {
    console.error('Get topic registrations error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy danh sách đăng ký' });
  }
};

const getPendingRegistrations = async (req, res) => {
  try {
    const { instructor_id } = req.query;
    const result = await topicRegistrationService.getPendingRegistrations({ instructor_id });
    res.json(result);
  } catch (error) {
    console.error('Get pending registrations error:', error);
    const statusCode = error.message.includes('Không tìm thấy') || error.message.includes('không hợp lệ') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy danh sách đăng ký chờ duyệt' });
  }
};

const getPendingRegistrationsForHead = async (req, res) => {
  try {
    const { department_id } = req.query;
    const result = await topicRegistrationService.getPendingRegistrationsForHead({ department_id });
    res.json(result);
  } catch (error) {
    console.error('Get pending registrations for head error:', error);
    const statusCode = error.message.includes('Không tìm thấy') || error.message.includes('không hợp lệ') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy danh sách đăng ký chờ trưởng bộ môn duyệt' });
  }
};

const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await topicRegistrationService.approveRegistration(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Approve registration error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi duyệt đăng ký' });
  }
};

const headApproveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await topicRegistrationService.headApproveRegistration(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Head approve registration error:', error);
    res.status(500).json({ error: 'Lỗi duyệt đăng ký' });
  }
};

module.exports = {
  createProposedTopic,
  getProposedTopics,
  createTopicRegistration,
  getTopicRegistrations,
  getPendingRegistrations,
  getPendingRegistrationsForHead,
  approveRegistration,
  headApproveRegistration,
};
