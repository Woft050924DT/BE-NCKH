const prisma = require('../config/database');

const createDefenseCouncil = async (data) => {
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
  } = data;

  return await prisma.defense_councils.create({
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
};

const addCouncilMember = async (data) => {
  const { defense_council_id, instructor_id, role, order_number } = data;

  return await prisma.council_members.create({
    data: {
      defense_council_id,
      instructor_id,
      role,
      order_number: order_number || 1,
    },
  });
};

const createDefenseAssignment = async (data) => {
  const { defense_council_id, thesis_id, defense_order, defense_time } = data;

  return await prisma.defense_assignments.create({
    data: {
      defense_council_id,
      thesis_id,
      defense_order,
      defense_time: defense_time ? new Date(defense_time) : null,
      status: 'PENDING_DEFENSE',
    },
  });
};

const submitDefenseResult = async (data) => {
  const { defense_assignment_id, instructor_id, defense_score, comments, suggestions } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
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

  return defenseResult;
};

const completeDefenseCouncil = async (id) => {
  return await prisma.defense_councils.update({
    where: { id: parseInt(id) },
    data: { status: 'COMPLETED' },
  });
};

const getDefenseSchedule = async (thesisId) => {
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
    throw new Error('Không tìm thấy lịch bảo vệ');
  }

  return assignment;
};

const getDefenseResults = async (thesisId) => {
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
    throw new Error('Không tìm thấy kết quả bảo vệ');
  }

  return assignment;
};

const finalizeThesis = async (id) => {
  const thesis = await prisma.theses.findUnique({
    where: { id: parseInt(id) },
  });

  if (!thesis) {
    throw new Error('Không tìm thấy đồ án');
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

  return {
    ...updatedThesis,
    finalScore: finalScore.toFixed(2),
  };
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
