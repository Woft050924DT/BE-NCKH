const prisma = require('../config/database');

const createThesisRound = async (req, res) => {
  try {
    const {
      semester,
      round_name,
      start_date,
      end_date,
      registration_deadline,
      faculty_id,
      department_id,
      default_group_mode,
      default_min_members,
      default_max_members,
    } = req.body;

    const thesisRound = await prisma.thesis_rounds.create({
      data: {
        semester,
        round_name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        registration_deadline: new Date(registration_deadline),
        faculty_id,
        department_id,
        status: 'DRAFT',
      },
    });

    await prisma.thesis_round_rules.create({
      data: {
        thesis_round_id: thesisRound.id,
        default_group_mode: default_group_mode || 'BOTH',
        default_min_members: default_min_members || 1,
        default_max_members: default_max_members || 4,
      },
    });

    res.status(201).json(thesisRound);
  } catch (error) {
    console.error('Create thesis round error:', error);
    res.status(500).json({ error: 'Lỗi tạo đợt đồ án' });
  }
};

const activateThesisRound = async (req, res) => {
  try {
    const { id } = req.params;

    const thesisRound = await prisma.thesis_rounds.update({
      where: { id: parseInt(id) },
      data: { status: 'ACTIVE' },
    });

    res.json(thesisRound);
  } catch (error) {
    console.error('Activate thesis round error:', error);
    res.status(500).json({ error: 'Lỗi kích hoạt đợt đồ án' });
  }
};

const assignInstructors = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructors } = req.body;

    const assignments = await Promise.all(
      instructors.map((instructor) =>
        prisma.instructor_assignments.create({
          data: {
            thesis_round_id: parseInt(id),
            instructor_id: instructor.instructor_id,
            supervision_quota: instructor.quota || 0,
            current_load: 0,
            notes: instructor.notes,
          },
        })
      )
    );

    res.status(201).json(assignments);
  } catch (error) {
    console.error('Assign instructors error:', error);
    res.status(500).json({ error: 'Lỗi phân công giảng viên' });
  }
};

const assignClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_ids } = req.body;

    const assignments = await Promise.all(
      class_ids.map((classId) =>
        prisma.thesis_round_classes.create({
          data: {
            thesis_round_id: parseInt(id),
            class_id: classId,
          },
        })
      )
    );

    res.status(201).json(assignments);
  } catch (error) {
    console.error('Assign classes error:', error);
    res.status(500).json({ error: 'Lỗi phân công lớp học' });
  }
};

const addGuidanceProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { processes } = req.body;

    const guidanceProcesses = await Promise.all(
      processes.map((process) =>
        prisma.guidance_processes.create({
          data: {
            thesis_round_id: parseInt(id),
            week_number: process.week_number,
            phase_name: process.phase_name,
            work_description: process.work_description,
            expected_outcome: process.expected_outcome,
          },
        })
      )
    );

    res.status(201).json(guidanceProcesses);
  } catch (error) {
    console.error('Add guidance process error:', error);
    res.status(500).json({ error: 'Lỗi thêm quy trình hướng dẫn' });
  }
};

const getThesisRounds = async (req, res) => {
  try {
    const thesisRounds = await prisma.thesis_rounds.findMany({
      include: {
        thesis_round_rules: true,
        faculties: true,
        departments: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(thesisRounds);
  } catch (error) {
    console.error('Get thesis rounds error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách đợt đồ án' });
  }
};

const getThesisRoundById = async (req, res) => {
  try {
    const { id } = req.params;

    const thesisRound = await prisma.thesis_rounds.findUnique({
      where: { id: parseInt(id) },
      include: {
        thesis_round_rules: true,
        instructor_assignments: {
          include: { instructors: true },
        },
        thesis_round_classes: {
          include: { classes: true },
        },
        guidance_processes: true,
      },
    });

    if (!thesisRound) {
      return res.status(404).json({ error: 'Không tìm thấy đợt đồ án' });
    }

    res.json(thesisRound);
  } catch (error) {
    console.error('Get thesis round error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin đợt đồ án' });
  }
};

module.exports = {
  createThesisRound,
  activateThesisRound,
  assignInstructors,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getThesisRoundById,
};
