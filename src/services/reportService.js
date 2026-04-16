const prisma = require('../config/database');

const createThesisTask = async (data) => {
  const {
    thesis_id,
    task_title,
    task_description,
    assigned_to,
    due_date,
    priority,
    start_date,
    student_id,
  } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
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

  return task;
};

const updateThesisTask = async (id, data) => {
  const { status, progress_percentage, notes } = data;

  const task = await prisma.thesis_tasks.update({
    where: { id: parseInt(id) },
    data: {
      status,
      progress_percentage,
      notes,
      end_date: status === 'COMPLETED' ? new Date() : null,
    },
  });

  return task;
};

const getThesisTasks = async (filters) => {
  const { thesis_id } = filters;

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

  return tasks;
};

const createWeeklyReport = async (data, user) => {
  const {
    thesis_id,
    week_number,
    report_content,
    progress_percentage,
    challenges,
    next_plan,
  } = data;

  const studentId = user?.studentId;

  if (!studentId) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const student = await prisma.students.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
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

  return report;
};

const updateWeeklyReport = async (id, data) => {
  const { report_content, progress_percentage, challenges, next_plan } = data;

  const report = await prisma.weekly_reports.update({
    where: { id: parseInt(id) },
    data: {
      report_content,
      progress_percentage,
      challenges,
      next_plan,
    },
  });

  return report;
};

const getWeeklyReports = async (filters) => {
  const { thesis_id } = filters;

  const where = thesis_id ? { thesis_id: parseInt(thesis_id) } : {};

  const reports = await prisma.weekly_reports.findMany({
    where,
    include: {
      theses: true,
    },
    orderBy: { week_number: 'asc' },
  });

  return reports;
};

const addIndividualContribution = async (data) => {
  const {
    weekly_report_id,
    contribution_description,
    hours_spent,
    tasks_completed,
    student_id,
  } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
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

  return contribution;
};

const submitFinalReport = async (id, data) => {
  const { final_report_file, outline_file, start_date, end_date } = data;

  const thesis = await prisma.theses.update({
    where: { id: parseInt(id) },
    data: {
      final_report_file,
      outline_file,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
    },
  });

  return thesis;
};

const getThesisProgress = async (thesisId) => {
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

  return {
    taskProgress,
    avgProgress,
    totalTasks,
    completedTasks,
    totalReports: reports.length,
    submittedReports: reports.filter(r => r.student_status === 'SUBMITTED').length,
  };
};

const getIndividualThesisReports = async (filters) => {
  const { student_id } = filters;

  // Get individual theses for the student
  const individualTheses = await prisma.theses.findMany({
    where: {
      thesis_groups: {
        group_type: 'INDIVIDUAL',
      },
      ...(student_id ? {
        thesis_members: {
          some: {
            student_id: parseInt(student_id),
            is_active: true,
          },
        },
      } : {}),
    },
    include: {
      thesis_groups: {
        include: {
          thesis_group_members: {
            include: {
              students: {
                include: { users: true },
              },
            },
          },
        },
      },
      thesis_members: {
        where: { is_active: true },
        include: {
          students: {
            include: { users: true },
          },
        },
      },
      weekly_reports: {
        include: {
          weekly_report_individual_contributions: {
            include: {
              students: {
                include: { users: true },
              },
            },
          },
          students: {
            include: { users: true },
          },
        },
        orderBy: { week_number: 'asc' },
      },
      thesis_rounds: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return individualTheses;
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
  getIndividualThesisReports,
};
