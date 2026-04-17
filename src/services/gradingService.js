const prisma = require('../config/database');

const createReviewAssignment = async (data) => {
  const { thesis_id, reviewer_id, review_order, review_deadline } = data;

  return await prisma.review_assignments.create({
    data: {
      thesis_id,
      reviewer_id,
      review_order: review_order || 1,
      review_deadline: review_deadline ? new Date(review_deadline) : null,
      status: 'PENDING_REVIEW',
    },
  });
};

const submitReviewResult = async (data) => {
  const {
    review_assignment_id,
    review_content,
    topic_evaluation,
    result_evaluation,
    improvement_suggestions,
    review_score,
    defense_approval,
    rejection_reason,
    review_file,
    instructor_id,
  } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const reviewResult = await prisma.review_results.create({
    data: {
      review_assignment_id,
      review_content,
      topic_evaluation,
      result_evaluation,
      improvement_suggestions,
      review_score,
      defense_approval,
      rejection_reason,
      review_file,
      review_date: new Date(),
    },
  });

  await prisma.review_assignments.update({
    where: { id: review_assignment_id },
    data: { status: 'COMPLETED' },
  });

  const assignment = await prisma.review_assignments.findUnique({
    where: { id: review_assignment_id },
    include: { theses: true },
  });

  const allReviews = await prisma.review_results.findMany({
    where: { review_assignments: { thesis_id: assignment.thesis_id } },
  });

  const avgScore = allReviews.reduce((sum, r) => sum + parseFloat(r.review_score || 0), 0) / allReviews.length;

  await prisma.theses.update({
    where: { id: assignment.thesis_id },
    data: { review_score: avgScore },
  });

  return reviewResult;
};

const submitSupervisionComment = async (data) => {
  const {
    thesis_id,
    comment_content,
    attitude_evaluation,
    capability_evaluation,
    result_evaluation,
    supervision_score,
    defense_approval,
    rejection_reason,
    instructor_id,
  } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const comment = await prisma.supervision_comments.create({
    data: {
      thesis_id,
      instructor_id: instructor.id,
      comment_content,
      attitude_evaluation,
      capability_evaluation,
      result_evaluation,
      supervision_score,
      defense_approval,
      rejection_reason,
      comment_date: new Date(),
    },
  });

  await prisma.theses.update({
    where: { id: thesis_id },
    data: { supervision_score },
  });

  return comment;
};

const submitPeerEvaluation = async (data) => {
  const {
    thesis_id,
    evaluated_id,
    evaluation_round,
    teamwork_score,
    responsibility_score,
    technical_skill_score,
    communication_score,
    contribution_score,
    strengths,
    weaknesses,
    suggestions,
    is_anonymous,
    student_id,
  } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const averageScore = (teamwork_score + responsibility_score + technical_skill_score + communication_score + contribution_score) / 5;

  const evaluation = await prisma.peer_evaluations.create({
    data: {
      thesis_id,
      evaluator_id: student.id,
      evaluated_id,
      evaluation_round: evaluation_round || 1,
      teamwork_score,
      responsibility_score,
      technical_skill_score,
      communication_score,
      contribution_score,
      average_score,
      strengths,
      weaknesses,
      suggestions,
      is_anonymous: is_anonymous !== false,
      evaluation_date: new Date(),
    },
  });

  return evaluation;
};

const reviewWeeklyReport = async (id, data) => {
  const { instructor_comments, instructor_score, instructor_status, rejection_reason, instructor_id } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const report = await prisma.weekly_reports.update({
    where: { id: parseInt(id) },
    data: {
      instructor_comments,
      instructor_score,
      instructor_status,
      rejection_reason,
      review_date: new Date(),
    },
  });

  return report;
};

const getThesisScores = async (thesisId) => {
  const thesis = await prisma.theses.findUnique({
    where: { id: parseInt(thesisId) },
    include: {
      review_assignments: {
        include: {
          review_results: true,
          instructors: { include: { users: true } },
        },
      },
      supervision_comments: {
        include: { instructors: { include: { users: true } } },
      },
    },
  });

  if (!thesis) {
    throw new Error('Không tìm thấy đồ án');
  }

  return thesis;
};

const getSupervisionStudents = async (instructorId, thesisRoundId, roundCode) => {
  const whereClause = {};

  if (instructorId) {
    whereClause.supervisor_id = parseInt(instructorId);
  }

  if (roundCode) {
    const thesisRound = await prisma.thesis_rounds.findUnique({
      where: { round_code: roundCode },
      select: { id: true },
    });
    if (thesisRound) {
      whereClause.thesis_round_id = thesisRound.id;
    }
  } else if (thesisRoundId) {
    whereClause.thesis_round_id = parseInt(thesisRoundId);
  }

  const theses = await prisma.theses.findMany({
    where: whereClause,
    include: {
      thesis_members: {
        include: {
          students: {
            include: {
              users: true,
              classes: true,
            },
          },
        },
      },
      supervision_comments: true,
    },
  });

  const result = theses.map((thesis) => {
    const isGraded = thesis.supervision_comments.length > 0;
    const members = thesis.thesis_members.map((member) => ({
      student_id: member.students.id,
      student_code: member.students.student_code,
      full_name: member.students.users.full_name,
      email: member.students.users.email,
      class_name: member.students.classes.class_name,
      role: member.role,
    }));

    return {
      thesis_id: thesis.id,
      thesis_code: thesis.thesis_code,
      topic_title: thesis.topic_title,
      thesis_round_id: thesis.thesis_round_id,
      status: thesis.status,
      is_graded: isGraded,
      graded_date: isGraded ? thesis.supervision_comments[0].comment_date : null,
      supervision_score: isGraded ? thesis.supervision_comments[0].supervision_score : null,
      members: members,
    };
  });

  return result;
};

const getReviewStudents = async (instructorId, thesisRoundId, roundCode) => {
  const whereClause = {};

  if (instructorId) {
    whereClause.reviewer_id = parseInt(instructorId);
  }

  if (roundCode) {
    const thesisRound = await prisma.thesis_rounds.findUnique({
      where: { round_code: roundCode },
      select: { id: true },
    });
    if (thesisRound) {
      whereClause.theses = {
        thesis_round_id: thesisRound.id,
      };
    }
  } else if (thesisRoundId) {
    whereClause.theses = {
      thesis_round_id: parseInt(thesisRoundId),
    };
  }

  const reviewAssignments = await prisma.review_assignments.findMany({
    where: whereClause,
    include: {
      theses: {
        include: {
          thesis_members: {
            include: {
              students: {
                include: {
                  users: true,
                  classes: true,
                },
              },
            },
          },
          instructors: {
            include: {
              users: true,
            },
          },
        },
      },
      review_results: true,
    },
  });

  const result = reviewAssignments.map((assignment) => {
    const isGraded = assignment.review_results.length > 0;
    const members = assignment.theses.thesis_members.map((member) => ({
      student_id: member.students.id,
      student_code: member.students.student_code,
      full_name: member.students.users.full_name,
      email: member.students.users.email,
      class_name: member.students.classes.class_name,
      role: member.role,
    }));

    return {
      thesis_id: assignment.theses.id,
      thesis_code: assignment.theses.thesis_code,
      topic_title: assignment.theses.topic_title,
      thesis_round_id: assignment.theses.thesis_round_id,
      status: assignment.theses.status,
      supervisor: {
        instructor_id: assignment.theses.instructors.id,
        instructor_code: assignment.theses.instructors.instructor_code,
        full_name: assignment.theses.instructors.users.full_name,
      },
      review_assignment_id: assignment.id,
      review_order: assignment.review_order,
      review_deadline: assignment.review_deadline,
      is_graded: isGraded,
      graded_date: isGraded ? assignment.review_results[0].review_date : null,
      review_score: isGraded ? assignment.review_results[0].review_score : null,
      members: members,
    };
  });

  return result;
};

module.exports = {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
  getSupervisionStudents,
  getReviewStudents,
};
