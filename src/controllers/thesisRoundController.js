const HttpError = require('../utils/HttpError');
const thesisRoundService = require('../services/thesisRoundService');

const createThesisRound = async (req, res) => {
  try {
    const result = await thesisRoundService.createThesisRound(req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đợt đồ án đã được tạo thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Create thesis round error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi tạo đợt đồ án'
    });
  }
};

const activateThesisRound = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.activateThesisRound(id);
    res.json({
      success: true,
      data: result,
      message: 'Đợt đồ án đã được kích hoạt thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Activate thesis round error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi kích hoạt đợt đồ án'
    });
  }
};

const startThesisRound = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.startThesisRound(id);
    res.json({
      success: true,
      data: result,
      message: 'Đợt đồ án đã được bắt đầu thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Start thesis round error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi bắt đầu đợt đồ án'
    });
  }
};

const autoUpdateThesisRoundStatus = async (req, res) => {
  try {
    const result = await thesisRoundService.autoUpdateThesisRoundStatus();
    res.json({
      success: true,
      data: result,
      message: 'Đã cập nhật trạng thái đợt đồ án thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Auto update thesis round status error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi tự động cập nhật trạng thái đợt đồ án'
    });
  }
};

const assignInstructors = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.assignInstructors(id, req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đã phân công giảng viên thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Assign instructors error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi phân công giảng viên'
    });
  }
};

const assignClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.assignClasses(id, req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đã phân công lớp học thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Assign classes error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi phân công lớp học'
    });
  }
};

const addGuidanceProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.addGuidanceProcess(id, req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Đã thêm quy trình hướng dẫn thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Add guidance process error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi thêm quy trình hướng dẫn'
    });
  }
};

const getThesisRounds = async (req, res) => {
  try {
    const result = await thesisRoundService.getThesisRounds();
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách đợt đồ án thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get thesis rounds error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách đợt đồ án'
    });
  }
};

const getActiveThesisRounds = async (req, res) => {
  try {
    const result = await thesisRoundService.getActiveThesisRounds();
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách đợt đồ án đang hoạt động thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get active thesis rounds error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách đợt đồ án đang hoạt động'
    });
  }
};

const getThesisRoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await thesisRoundService.getThesisRoundById(id);
    res.json({
      success: true,
      data: result,
      message: 'Lấy thông tin đợt đồ án thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get thesis round error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      data: null,
      message: error.message || 'Lỗi lấy thông tin đợt đồ án'
    });
  }
};

const updateRoundStatus = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { status } = req.body;
    const result = await thesisRoundService.updateRoundStatus(roundId, status, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Đã cập nhật trạng thái đợt đồ án thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Update round status error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi cập nhật trạng thái đợt đồ án'
    });
  }
};

module.exports = {
  createThesisRound,
  activateThesisRound,
  startThesisRound,
  autoUpdateThesisRoundStatus,
  assignInstructors,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getActiveThesisRounds,
  getThesisRoundById,
  updateRoundStatus,
};
