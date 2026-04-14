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

module.exports = {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
};
