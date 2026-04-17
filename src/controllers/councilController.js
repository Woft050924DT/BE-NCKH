const councilService = require('../services/councilService');

const createCouncil = async (req, res) => {
  try {
    const result = await councilService.createCouncil(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create council error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi tạo hội đồng' });
  }
};

const getCouncils = async (req, res) => {
  try {
    const result = await councilService.getCouncils(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get councils error:', error);
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách hội đồng' });
  }
};

const getCouncilById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await councilService.getCouncilById(id);
    res.json(result);
  } catch (error) {
    console.error('Get council by id error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi lấy thông tin hội đồng' });
  }
};

const updateCouncil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await councilService.updateCouncil(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update council error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Lỗi cập nhật hội đồng' });
  }
};

const deleteCouncil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await councilService.deleteCouncil(id);
    res.json({ message: 'Xóa hội đồng thành công', data: result });
  } catch (error) {
    console.error('Delete council error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xóa hội đồng' });
  }
};

module.exports = {
  createCouncil,
  getCouncils,
  getCouncilById,
  updateCouncil,
  deleteCouncil,
};
