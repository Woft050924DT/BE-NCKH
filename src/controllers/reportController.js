const prisma = require('../config/database');

const createThesisTask = async (req, res) => {
  try {
    const { thesis_id, task_title, task_description, assigned_to, due_date, priority, start_date, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
    }

    const task = await prisma.thesis_tasks.create({
      data: {
        thesis_id,
        task_title,
        task_description,
        assigned_to,
        created_by: student.id,
        due_date: due_date ? new Date(due_date) : null,
        start_date: start_date ? new Date(start_date) : null,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        progress_percentage: 0,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create thesis task error:', error);
    res.status(500).json({ error: 'Lỗi tạo nhiệm vụ' });
  }
};

const updateThesisTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress_percentage, notes } = req.body;

    const task = await prisma.thesis_tasks.update({
      where: { id: parseInt(id) },
      data: {
        status,
        progress_percentage,
        notes,
        end_date: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update thesis task error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật nhiệm vụ' });
  }
};

const getThesisTasks = async (req, res) => {
  try {
    const { thesis_id } = req.query;

    const where = thesis_id ? { thesis_id: parseInt(thesis_id) } : {};

    const tasks = await prisma.thesis_tasks.findMany({
      where,
      include: {
        students_thesis_tasks_assigned_toTostudents: {
          include: { users: true },
        },
        students_thesis_tasks_created_byTostudents: {
          include: { users: true },
        },
      },
      orderBy: { due_date: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get thesis tasks error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách nhiệm vụ' });
  }
};

const createWeeklyReport = async (req, res) => {
  try {
    const { thesis_id, week_number, report_content, progress_percentage, challenges, next_plan, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
    }

    const report = await prisma.weekly_reports.create({
      data: {
        thesis_id,
        week_number,
        report_content,
        progress_percentage,
        challenges,
        next_plan,
        student_status: 'SUBMITTED',
        submission_date: new Date(),
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create weekly report error:', error);
    res.status(500).json({ error: 'Lỗi tạo báo cáo tuần' });
  }
};

const updateWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { report_content, progress_percentage, challenges, next_plan } = req.body;

    const report = await prisma.weekly_reports.update({
      where: { id: parseInt(id) },
      data: {
        report_content,
        progress_percentage,
        challenges,
        next_plan,
      },
    });

    res.json(report);
  } catch (error) {
    console.error('Update weekly report error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật báo cáo tuần' });
  }
};

const getWeeklyReports = async (req, res) => {
  try {
    const { thesis_id } = req.query;

    const where = thesis_id ? { thesis_id: parseInt(thesis_id) } : {};

    const reports = await prisma.weekly_reports.findMany({
      where,
      include: {
        theses: true,
      },
      orderBy: { week_number: 'asc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get weekly reports error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách báo cáo tuần' });
  }
};

const addIndividualContribution = async (req, res) => {
  try {
    const { weekly_report_id, contribution_description, hours_spent, tasks_completed, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
    }

    const contribution = await prisma.weekly_report_individual_contributions.create({
      data: {
        weekly_report_id,
        student_id: student.id,
        contribution_description,
        hours_spent,
        tasks_completed,
      },
    });

    res.status(201).json(contribution);
  } catch (error) {
    console.error('Add individual contribution error:', error);
    res.status(500).json({ error: 'Lỗi thêm đóng góp cá nhân' });
  }
};

const submitFinalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_report_file, outline_file, start_date, end_date } = req.body;

    const thesis = await prisma.theses.update({
      where: { id: parseInt(id) },
      data: {
        final_report_file,
        outline_file,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    res.json(thesis);
  } catch (error) {
    console.error('Submit final report error:', error);
    res.status(500).json({ error: 'Lỗi nộp báo cáo cuối kỳ' });
  }
};

const getThesisProgress = async (req, res) => {
  try {
    const { thesisId } = req.params;

    const tasks = await prisma.thesis_tasks.findMany({
      where: { thesis_id: parseInt(thesisId) },
    });

    const reports = await prisma.weekly_reports.findMany({
      where: { thesis_id: parseInt(thesisId) },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const avgProgress = reports.length > 0 
      ? reports.reduce((sum, r) => sum + parseFloat(r.progress_percentage || 0), 0) / reports.length 
      : 0;

    res.json({
      taskProgress,
      avgProgress,
      totalTasks,
      completedTasks,
      totalReports: reports.length,
      submittedReports: reports.filter(r => r.student_status === 'SUBMITTED').length,
    });
  } catch (error) {
    console.error('Get thesis progress error:', error);
    res.status(500).json({ error: 'Lỗi lấy tiến độ đồ án' });
  }
};

module.exports = {
  createThesisTask,
  updateThesisTask,
  getThesisTasks,
  createWeeklyReport,
  updateWeeklyReport,
  getWeeklyReports,
  addIndividualContribution,
  submitFinalReport,
  getThesisProgress,
};
