const HttpError = require('../utils/HttpError');
const topicService = require('../services/topicService');

const createTopic = async (req, res) => {
  try {
    const { roundId } = req.params;
    const result = await topicService.createTopic(roundId, req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đề tài đã được tạo thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Create topic error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi tạo đề tài'
    });
  }
};

const getTopics = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { isTaken, instructorId } = req.query;
    const result = await topicService.getTopics(roundId, { isTaken, instructorId });
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách đề tài thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách đề tài'
    });
  }
};

module.exports = {
  createTopic,
  getTopics,
};
