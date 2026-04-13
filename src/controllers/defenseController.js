const prisma = require('../config/database');

const createDefenseCouncil = async (req, res) => {
  try {
    const {
      council_code,
      council_name,
      thesis_round_id,
      chairman_id,
      secretary_id,
      defense_date,
      start_time,
      end_time,
      venue,
      notes,
    } = req.body;

    const defenseCouncil = await prisma.defense_councils.create({
      data: {
        council_code,
        council_name,
        thesis_round_id,
        chairman_id,
        secretary_id,
        defense_date: defense_date ? new Date(defense_date) : null,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        venue,
        status: 'PREPARING',
        notes,
      },
    });

    res.status(201).json(defenseCouncil);
  } catch (error) {
    console.error('Create defense council error:', error);
    res.status(500).json({ error: 'Lỗi tạo hội đồng bảo vệ' });
  }
};

const addCouncilMember = async (req, res) => {
  try {
    const { defense_council_id, instructor_id, role, order_number } = req.body;

    const member = await prisma.council_members.create({
      data: {
        defense_council_id,
        instructor_id,
        role,
        order_number: order_number || 1,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Add council member error:', error);
    res.status(500).json({ error: 'Lỗi thêm thành viên hội đồng' });
  }
};

const createDefenseAssignment = async (req, res) => {
  try {
    const { defense_council_id, thesis_id, defense_order, defense_time } = req.body;

    const assignment = await prisma.defense_assignments.create({
      data: {
        defense_council_id,
        thesis_id,
        defense_order,
        defense_time: defense_time ? new Date(defense_time) : null,
        status: 'PENDING_DEFENSE',
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create defense assignment error:', error);
    res.status(500).json({ error: 'Lỗi tạo phân công bảo vệ' });
  }
};

const submitDefenseResult = async (req, res) => {
  try {
    const { defense_assignment_id, instructor_id, defense_score, comments, suggestions } = req.body;

    if (!instructor_id) {
      return res.status(400).json({ error: 'Thiếu instructor_id' });
    }

    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(instructor_id) },
    });

    if (!instructor) {
      return res.status(403).json({ error: 'Không tìm thấy giảng viên' });
    }

    const defenseResult = await prisma.defense_results.create({
      data: {
        defense_assignment_id,
        instructor_id: instructor.id,
        defense_score,
        comments,
        suggestions,
      },
    });

    const assignment = await prisma.defense_assignments.findUnique({
      where: { id: defense_assignment_id },
      include: { theses: true },
    });

    const allResults = await prisma.defense_results.findMany({
      where: { defense_assignments: { thesis_id: assignment.thesis_id } },
    });

    const avgScore = allResults.reduce((sum, r) => sum + parseFloat(r.defense_score || 0), 0) / allResults.length;

    await prisma.theses.update({
      where: { id: assignment.thesis_id },
      data: { defense_score: avgScore },
    });

    res.status(201).json(defenseResult);
  } catch (error) {
    console.error('Submit defense result error:', error);
    res.status(500).json({ error: 'Lỗi nộp kết quả bảo vệ' });
  }
};

const completeDefenseCouncil = async (req, res) => {
  try {
    const { id } = req.params;

    const defenseCouncil = await prisma.defense_councils.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED' },
    });

    res.json(defenseCouncil);
  } catch (error) {
    console.error('Complete defense council error:', error);
    res.status(500).json({ error: 'Lỗi hoàn thành hội đồng bảo vệ' });
  }
};

const getDefenseSchedule = async (req, res) => {
  try {
    const { thesisId } = req.params;

    const assignment = await prisma.defense_assignments.findFirst({
      where: { thesis_id: parseInt(thesisId) },
      include: {
        defense_councils: {
          include: {
            council_members: {
              include: {
                instructors: {
                  include: { users: true },
                },
              },
            },
          },
        },
        theses: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Không tìm thấy lịch bảo vệ' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get defense schedule error:', error);
    res.status(500).json({ error: 'Lỗi lấy lịch bảo vệ' });
  }
};

const getDefenseResults = async (req, res) => {
  try {
    const { thesisId } = req.params;

    const assignment = await prisma.defense_assignments.findFirst({
      where: { thesis_id: parseInt(thesisId) },
      include: {
        defense_results: {
          include: {
            instructors: {
              include: { users: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Không tìm thấy kết quả bảo vệ' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get defense results error:', error);
    res.status(500).json({ error: 'Lỗi lấy kết quả bảo vệ' });
  }
};

const finalizeThesis = async (req, res) => {
  try {
    const { id } = req.params;

    const thesis = await prisma.theses.findUnique({
      where: { id: parseInt(id) },
    });

    if (!thesis) {
      return res.status(404).json({ error: 'Không tìm thấy đồ án' });
    }

    const reviewScore = parseFloat(thesis.review_score || 0);
    const supervisionScore = parseFloat(thesis.supervision_score || 0);
    const defenseScore = parseFloat(thesis.defense_score || 0);

    const finalScore = (reviewScore * 0.3) + (supervisionScore * 0.3) + (defenseScore * 0.4);

    const status = finalScore >= 5 ? 'COMPLETED' : 'FAILED';

    const updatedThesis = await prisma.theses.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    await prisma.status_history.create({
      data: {
        table_name: 'theses',
        record_id: thesis.id,
        old_status: thesis.status,
        new_status: status,
        changed_by_id: 1,
        change_reason: `Điểm tổng kết: ${finalScore.toFixed(2)}`,
      },
    });

    res.json({
      ...updatedThesis,
      finalScore: finalScore.toFixed(2),
    });
  } catch (error) {
    console.error('Finalize thesis error:', error);
    res.status(500).json({ error: 'Lỗi hoàn thành đồ án' });
  }
};

module.exports = {
  createDefenseCouncil,
  addCouncilMember,
  createDefenseAssignment,
  submitDefenseResult,
  completeDefenseCouncil,
  getDefenseSchedule,
  getDefenseResults,
  finalizeThesis,
};
