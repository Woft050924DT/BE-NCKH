const prisma = require('../config/database');

const createThesisRound = async (data) => {
  try {
    console.log('Creating thesis round with data:', data);
    const {
      round_code,
      round_name,
      thesis_type_id,
      semester,
      academic_year,
      start_date,
      end_date,
      registration_deadline,
      faculty_id,
      department_id,
      default_group_mode,
      default_min_members,
      default_max_members,
    } = data;

    const thesisRound = await prisma.thesis_rounds.create({
      data: {
        round_code,
        round_name,
        thesis_type_id,
        semester: semester ? parseInt(semester) : null,
        academic_year,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        registration_deadline: registration_deadline ? new Date(registration_deadline) : null,
        faculty_id,
        department_id,
        status: 'Preparing',
      },
    });

    console.log('Thesis round created:', thesisRound);

    await prisma.thesis_round_rules.create({
      data: {
        thesis_round_id: thesisRound.id,
        default_group_mode: default_group_mode || 'BOTH',
        default_min_members: default_min_members || 1,
        default_max_members: default_max_members || 4,
      },
    });

    console.log('Thesis round rules created');
    return thesisRound;
  } catch (error) {
    console.error('Error in createThesisRound service:', error);
    throw error;
  }
};

const activateThesisRound = async (id) => {
  return await prisma.thesis_rounds.update({
    where: { id: parseInt(id) },
    data: { status: 'Active' },
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

  // Chuyển từ Active sang In Progress khi qua registration_deadline
  const roundsToStart = await prisma.thesis_rounds.findMany({
    where: {
      status: 'Active',
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

const assignInstructors = async (id, data) => {
  const { instructors } = data;

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

  return assignments;
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
      status: {
        in: ['Active', 'ACTIVE'],
      },
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
};
