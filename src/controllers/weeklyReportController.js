const HttpError = require('../utils/HttpError');
const weeklyReportService = require('../services/weeklyReportService');

const createWeeklyReport = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await weeklyReportService.createWeeklyReport(thesisId, req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Báo cáo hàng tuần đã được tạo thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Create weekly report error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi tạo báo cáo hàng tuần'
    });
  }
};

const getWeeklyReports = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const result = await weeklyReportService.getWeeklyReports(thesisId, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Lấy danh sách báo cáo hàng tuần thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Get weekly reports error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi lấy danh sách báo cáo hàng tuần'
    });
  }
};

const provideFeedback = async (req, res) => {
  try {
    const { reportId } = req.params;
    const result = await weeklyReportService.provideFeedback(reportId, req.body, req.user);
    res.json({
      success: true,
      data: result,
      message: 'Đã cung cấp phản hồi thành công'
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    console.error('Provide feedback error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Lỗi cung cấp phản hồi'
    });
  }
};

module.exports = {
  createWeeklyReport,
  getWeeklyReports,
  provideFeedback,
};
