const HttpError = require('../utils/HttpError');
const prisma = require('../config/database');

const createWeeklyReport = async (thesisId, data) => {
  try {
    const {
      weekNumber,
      workCompleted,
      resultsAchieved,
      difficultiesEncountered,
      nextWeekPlan,
      attachmentFile,
      contributions,
      studentId,
    } = data;

    // Pre-conditions
    const thesis = await prisma.theses.findUnique({
      where: { id: parseInt(thesisId) },
    });

    if (!thesis) {
      throw new HttpError(404, 'Không tìm thấy đồ án');
    }

    if (thesis.status !== 'IN_PROGRESS') {
      throw new HttpError(400, 'Đồ án không ở trạng thái đang thực hiện');
    }

    // Get thesis_round to check deadline
    const thesisRound = await prisma.thesis_rounds.findUnique({
      where: { id: thesis.thesis_round_id },
    });

    if (thesisRound?.report_submission_deadline && new Date() > new Date(thesisRound.report_submission_deadline)) {
      throw new HttpError(400, 'Đã quá hạn nộp báo cáo');
    }


    // No report exists for this weekNumber on this thesis
    const existingReport = await prisma.weekly_reports.findUnique({
      where: {
        thesis_id_week_number: {
          thesis_id: parseInt(thesisId),
          week_number: parseInt(weekNumber),
        },
      },
    });

    if (existingReport) {
      throw new HttpError(400, 'Đã tồn tại báo cáo cho tuần này');
    }

    // $transaction to create report and contributions
    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.weekly_reports.create({
        data: {
          thesis_id: parseInt(thesisId),
          week_number: parseInt(weekNumber),
          report_date: new Date(),
          work_completed: workCompleted,
          results_achieved: resultsAchieved,
          difficulties_encountered: difficultiesEncountered,
          next_week_plan: nextWeekPlan,
          attachment_file: attachmentFile,
          submitted_by: parseInt(studentId),
          student_status: 'SUBMITTED',
          instructor_status: 'PENDING',
        },
      });

      // For each contribution in body
      if (contributions && contributions.length > 0) {
        await tx.weekly_report_individual_contributions.createMany({
          data: contributions.map((c) => ({
            weekly_report_id: report.id,
            student_id: c.studentId,
            individual_work: c.individualWork,
            individual_results: c.individualResults,
            hours_spent: c.hoursSpent,
            self_evaluation: c.selfEvaluation,
          })),
          skipDuplicates: true,
        });
      }

      return report;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in createWeeklyReport service:', error);
    throw new HttpError(500, 'Lỗi tạo báo cáo hàng tuần');
  }
};

const getWeeklyReports = async (thesisId, user) => {
  try {
    const thesis = await prisma.theses.findUnique({
      where: { id: parseInt(thesisId) },
    });

    if (!thesis) {
      throw new HttpError(404, 'Không tìm thấy đồ án');
    }

    const reports = await prisma.weekly_reports.findMany({
      where: {
        thesis_id: parseInt(thesisId),
      },
      include: {
        weekly_report_individual_contributions: {
          include: {
            students: {
              include: { users: true },
            },
          },
        },
      },
      orderBy: { week_number: 'asc' },
    });

    return reports;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in getWeeklyReports service:', error);
    throw new HttpError(500, 'Lỗi lấy danh sách báo cáo hàng tuần');
  }
};

const provideFeedback = async (reportId, data, user) => {
  try {
    const { instructorStatus, instructorFeedback, weeklyScore } = data;

    const report = await prisma.weekly_reports.findUnique({
      where: { id: parseInt(reportId) },
      include: {
        theses: true,
      },
    });

    if (!report) {
      throw new HttpError(404, 'Không tìm thấy báo cáo');
    }

    if (report.instructor_status !== 'PENDING') {
      throw new HttpError(400, 'Báo cáo đã được phản hồi');
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'NEED_CHANGES'];
    if (!validStatuses.includes(instructorStatus)) {
      throw new HttpError(400, 'Trạng thái không hợp lệ');
    }

    if (weeklyScore !== undefined && (weeklyScore < 0 || weeklyScore > 10)) {
      throw new HttpError(400, 'Điểm số phải từ 0 đến 10');
    }

    // Update weekly_reports
    const updatedReport = await prisma.weekly_reports.update({
      where: { id: parseInt(reportId) },
      data: {
        instructor_status,
        instructor_feedback: instructorFeedback,
        weekly_score: weeklyScore,
        feedback_date: new Date(),
      },
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in provideFeedback service:', error);
    throw new HttpError(500, 'Lỗi cung cấp phản hồi');
  }
};

module.exports = {
  createWeeklyReport,
  getWeeklyReports,
  provideFeedback,
};
