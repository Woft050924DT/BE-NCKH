const HttpError = require('../utils/HttpError');
const groupService = require('../services/groupService');

const createGroup = async (req, res) => {
  try {
    const { roundId } = req.params;
    const result = await groupService.createGroup(roundId, req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Nhóm đã được tạo thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi tạo nhóm'
    });
  }
};

const inviteToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await groupService.inviteToGroup(groupId, req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đã gửi lời mời thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Invite to group error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi gửi lời mời'
    });
  }
};

const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const result = await groupService.respondToInvitation(invitationId, req.body, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Đã phản hồi lời mời thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Respond to invitation error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi phản hồi lời mời'
    });
  }
};

const registerTopic = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await groupService.registerTopic(groupId, req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đã đăng ký đề tài thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Register topic error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi đăng ký đề tài'
    });
  }
};

module.exports = {
  createGroup,
  inviteToGroup,
  respondToInvitation,
  registerTopic,
};
