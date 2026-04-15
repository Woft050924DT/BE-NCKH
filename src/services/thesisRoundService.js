const HttpError = require('../utils/HttpError');
const prisma = require('../config/database');

const createThesisRound = async (data, user) => {
  try {
    const {
      roundCode,
      roundName,
      thesisTypeId,
      departmentId,
      academicYear,
      semester,
      startDate,
      endDate,
      topicProposalDeadline,
      registrationDeadline,
      reportSubmissionDeadline,
      notes,
    } = data;

    // Validate deadline order
    if (topicProposalDeadline && registrationDeadline && endDate) {
      if (new Date(topicProposalDeadline) >= new Date(registrationDeadline)) {
        throw new HttpError(400, 'Hạn nộp đề tài phải trước hạn đăng ký');
      }
      if (new Date(registrationDeadline) >= new Date(endDate)) {
        throw new HttpError(400, 'Hạn đăng ký phải trước ngày kết thúc');
      }
    }

    // Check for overlapping active round in same department + semester + academicYear
    const existingRound = await prisma.thesis_rounds.findFirst({
      where: {
        department_id: parseInt(departmentId),
        semester: parseInt(semester),
        academic_year: academicYear,
        status: { in: ['Preparing', 'Open', 'In Progress'] },
      },
    });

    if (existingRound) {
      throw new HttpError(400, 'Đã tồn tại đợt đồ án đang hoạt động trong cùng kỳ học');
    }

    // Create thesis_rounds with status = 'Preparing'
    const thesisRound = await prisma.thesis_rounds.create({
      data: {
        round_code: roundCode,
        round_name: roundName,
        thesis_type_id: parseInt(thesisTypeId),
        department_id: parseInt(departmentId),
        academic_year: academicYear,
        semester: semester ? parseInt(semester) : null,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        topic_proposal_deadline: topicProposalDeadline ? new Date(topicProposalDeadline) : null,
        registration_deadline: registrationDeadline ? new Date(registrationDeadline) : null,
        report_submission_deadline: reportSubmissionDeadline ? new Date(reportSubmissionDeadline) : null,
        notes,
        status: 'Preparing',
      },
    });

    // Create thesis_round_rules with defaults
    await prisma.thesis_round_rules.create({
      data: {
        thesis_round_id: thesisRound.id,
        default_group_mode: 'BOTH',
        default_min_members: 1,
        default_max_members: 4,
      },
    });

    return thesisRound;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in createThesisRound service:', error);
    throw new HttpError(500, 'Lỗi tạo đợt đồ án');
  }
};

const activateThesisRound = async (id) => {
  return await prisma.thesis_rounds.update({
    where: { id: parseInt(id) },
    data: { status: 'ACTIVE' },
  });
};

const startThesisRound = async (id) => {
  return await prisma.thesis_rounds.update({
    where: { id: parseInt(id) },
    data: { status: 'In Progress' },
  });
};

const autoUpdateThesisRoundStatus = async () => {
  const now = new Date();
  console.log('Checking thesis rounds for status update at:', now);

  // Chuyển từ ACTIVE sang In Progress khi qua registration_deadline
  const roundsToStart = await prisma.thesis_rounds.findMany({
    where: {
      status: 'ACTIVE',
      registration_deadline: {
        lte: now,
      },
    },
  });

  for (const round of roundsToStart) {
    await prisma.thesis_rounds.update({
      where: { id: round.id },
      data: { status: 'In Progress' },
    });
    console.log(`Updated thesis round ${round.round_code} to In Progress`);
  }

  return { updated: roundsToStart.length };
};

const assignInstructors = async (id, data, user) => {
  try {
    const { instructorIds, supervisionQuota } = data;

    if (!instructorIds || !Array.isArray(instructorIds)) {
      throw new HttpError(400, 'instructorIds phải là một mảng');
    }

    const round = await prisma.thesis_rounds.findUnique({
      where: { id: parseInt(id) },
    });

    if (!round) {
      throw new HttpError(404, 'Không tìm thấy đợt đồ án');
    }

    if (round.status !== 'ACTIVE') {
      throw new HttpError(400, 'Chỉ có thể phân công giảng viên khi đợt đồ án ở trạng thái ACTIVE');
    }

    // Upsert instructor_assignments for each instructorId
    const assignments = await Promise.all(
      instructorIds.map((instructorId) =>
        prisma.instructor_assignments.upsert({
          where: {
            thesis_round_id_instructor_id: {
              thesis_round_id: parseInt(id),
              instructor_id: parseInt(instructorId),
            },
          },
          update: {
            supervision_quota: supervisionQuota,
          },
          create: {
            thesis_round_id: parseInt(id),
            instructor_id: parseInt(instructorId),
            supervision_quota: supervisionQuota,
            current_load: 0,
          },
          include: {
            instructors: {
              include: { users: true },
            },
          },
        })
      )
    );

    return assignments;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in assignInstructors service:', error);
    throw new HttpError(500, 'Lỗi phân công giảng viên');
  }
};

const assignClasses = async (id, data) => {
  const { class_ids } = data;

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

  return assignments;
};

const addGuidanceProcess = async (id, data) => {
  const { processes } = data;

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

  return guidanceProcesses;
};

const getThesisRounds = async () => {
  return await prisma.thesis_rounds.findMany({
    include: {
      thesis_round_rules: true,
      faculties: true,
      departments: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

const getActiveThesisRounds = async () => {
  return await prisma.thesis_rounds.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      thesis_round_rules: true,
      faculties: true,
      departments: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

const getThesisRoundById = async (id) => {
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
    throw new Error('Không tìm thấy đợt đồ án');
  }

  return thesisRound;
};

const updateRoundStatus = async (roundId, status, user) => {
  try {
    const validStatuses = ['Preparing', 'Open', 'Closed', 'Completed', 'In Progress'];
    if (!validStatuses.includes(status)) {
      throw new HttpError(400, 'Trạng thái không hợp lệ');
    }

    const round = await prisma.thesis_rounds.findUnique({
      where: { id: parseInt(roundId) },
    });

    if (!round) {
      throw new HttpError(404, 'Không tìm thấy đợt đồ án');
    }

    // Validate status transition
    const validTransitions = {
      'Preparing': ['Open'],
      'Open': ['Closed', 'In Progress'],
      'In Progress': ['Completed'],
      'Closed': [],
      'Completed': [],
    };

    if (!validTransitions[round.status].includes(status)) {
      throw new HttpError(400, `Không thể chuyển từ trạng thái ${round.status} sang ${status}`);
    }

    // Update thesis_rounds.status
    const updatedRound = await prisma.thesis_rounds.update({
      where: { id: parseInt(roundId) },
      data: { status },
    });

    return updatedRound;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in updateRoundStatus service:', error);
    throw new HttpError(500, 'Lỗi cập nhật trạng thái đợt đồ án');
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
