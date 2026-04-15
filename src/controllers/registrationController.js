const HttpError = require('../utils/HttpError');
const registrationService = require('../services/registrationService');

const getInstructorRegistrations = async (req, res) => {
  try {
    const { status, roundId } = req.query;
    const result = await registrationService.getInstructorRegistrations(req.user, { status, roundId });
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách đăng ký thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get instructor registrations error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách đăng ký'
    });
  }
};

const instructorReview = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const result = await registrationService.instructorReview(registrationId, req.body, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Đã phản hồi đăng ký thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Instructor review error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi phản hồi đăng ký'
    });
  }
};

const getHeadRegistrations = async (req, res) => {
  try {
    const { roundId, instructorStatus, headStatus } = req.query;
    const result = await registrationService.getHeadRegistrations(req.user, { roundId, instructorStatus, headStatus });
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách đăng ký thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get head registrations error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách đăng ký'
    });
  }
};

const headReview = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const result = await registrationService.headReview(registrationId, req.body, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Đã phản hồi đăng ký thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Head review error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi phản hồi đăng ký'
    });
  }
};

module.exports = {
  getInstructorRegistrations,
  instructorReview,
  getHeadRegistrations,
  headReview,
};
