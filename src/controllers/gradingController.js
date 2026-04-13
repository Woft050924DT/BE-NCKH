const prisma = require('../config/database');

const createReviewAssignment = async (req, res) => {
  try {
    const { thesis_id, reviewer_id, review_order, review_deadline } = req.body;

    const assignment = await prisma.review_assignments.create({
      data: {
        thesis_id,
        reviewer_id,
        review_order: review_order || 1,
        review_deadline: review_deadline ? new Date(review_deadline) : null,
        status: 'PENDING_REVIEW',
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create review assignment error:', error);
    res.status(500).json({ error: 'Lỗi tạo phân công chấm bài' });
  }
};

const submitReviewResult = async (req, res) => {
  try {
    const { review_assignment_id, review_content, topic_evaluation, result_evaluation, improvement_suggestions, review_score, defense_approval, rejection_reason, review_file, instructor_id } = req.body;

    if (!instructor_id) {
      return res.status(400).json({ error: 'Thiếu instructor_id' });
    }

    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(instructor_id) },
    });

    if (!instructor) {
      return res.status(403).json({ error: 'Không tìm thấy giảng viên' });
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

    res.status(201).json(reviewResult);
  } catch (error) {
    console.error('Submit review result error:', error);
    res.status(500).json({ error: 'Lỗi nộp kết quả chấm bài' });
  }
};

const submitSupervisionComment = async (req, res) => {
  try {
    const { thesis_id, comment_content, attitude_evaluation, capability_evaluation, result_evaluation, supervision_score, defense_approval, rejection_reason, instructor_id } = req.body;

    if (!instructor_id) {
      return res.status(400).json({ error: 'Thiếu instructor_id' });
    }

    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(instructor_id) },
    });

    if (!instructor) {
      return res.status(403).json({ error: 'Không tìm thấy giảng viên' });
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

    res.status(201).json(comment);
  } catch (error) {
    console.error('Submit supervision comment error:', error);
    res.status(500).json({ error: 'Lỗi nộp nhận xét hướng dẫn' });
  }
};

const submitPeerEvaluation = async (req, res) => {
  try {
    const { thesis_id, evaluated_id, evaluation_round, teamwork_score, responsibility_score, technical_skill_score, communication_score, contribution_score, strengths, weaknesses, suggestions, is_anonymous, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Submit peer evaluation error:', error);
    res.status(500).json({ error: 'Lỗi nộp đánh giá đồng đẳng' });
  }
};

const reviewWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructor_comments, instructor_score, instructor_status, rejection_reason, instructor_id } = req.body;

    if (!instructor_id) {
      return res.status(400).json({ error: 'Thiếu instructor_id' });
    }

    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(instructor_id) },
    });

    if (!instructor) {
      return res.status(403).json({ error: 'Không tìm thấy giảng viên' });
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

    res.json(report);
  } catch (error) {
    console.error('Review weekly report error:', error);
    res.status(500).json({ error: 'Lỗi đánh giá báo cáo tuần' });
  }
};

const getThesisScores = async (req, res) => {
  try {
    const { thesisId } = req.params;

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
      return res.status(404).json({ error: 'Không tìm thấy đồ án' });
    }

    res.json(thesis);
  } catch (error) {
    console.error('Get thesis scores error:', error);
    res.status(500).json({ error: 'Lỗi lấy điểm số đồ án' });
  }
};

module.exports = {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
};
