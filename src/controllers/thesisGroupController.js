const thesisGroupService = require('../services/thesisGroupService');

const createThesisGroup = async (req, res) => {
  try {
    const result = await thesisGroupService.createThesisGroup(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create thesis group error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo nhóm đồ án' });
  }
};

const getThesisGroups = async (req, res) => {
  try {
    const { thesis_round_id, student_id } = req.query;
    const result = await thesisGroupService.getThesisGroups({ thesis_round_id, student_id });
    res.json(result);
  } catch (error) {
    console.error('Get thesis groups error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách nhóm' });
  }
};

const createGroupInvitation = async (req, res) => {
  try {
    const result = await thesisGroupService.createGroupInvitation(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create group invitation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo lời mời' });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisGroupService.acceptInvitation(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Accept invitation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi chấp nhận lời mời' });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisGroupService.rejectInvitation(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Reject invitation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi từ chối lời mời' });
  }
};

const getInvitations = async (req, res) => {
  try {
    const { student_id } = req.query;
    const result = await thesisGroupService.getInvitations({ student_id });
    res.json(result);
  } catch (error) {
    console.error('Get invitations error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 403 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy danh sách lời mời' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const result = await thesisGroupService.leaveGroup(req.body);
    res.json(result);
  } catch (error) {
    console.error('Leave group error:', error);
    const statusCode = error.message.includes('Không tìm thấy') || error.message.includes('không phải') ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi rời nhóm' });
  }
};

module.exports = {
  createThesisGroup,
  getThesisGroups,
  createGroupInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
  leaveGroup,
};
