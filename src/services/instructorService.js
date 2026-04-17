const bcrypt = require('bcrypt');
const prisma = require('../config/database');

const getInstructors = async (filters) => {
  const { thesis_round_id, search, department_id } = filters;

  const where = {
    status: true,
  };

  if (thesis_round_id) {
    where.instructor_assignments = {
      some: {
        thesis_round_id: parseInt(thesis_round_id),
        status: true,
      },
    };
  }

  if (department_id) {
    where.department_id = parseInt(department_id);
  }

  if (search) {
    where.OR = [
      {
        instructor_code: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        users: {
          full_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  return await prisma.instructors.findMany({
    where,
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      departments_instructors_department_idTodepartments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
      instructor_assignments: thesis_round_id
        ? {
            where: {
              thesis_round_id: parseInt(thesis_round_id),
              status: true,
            },
            select: {
              supervision_quota: true,
              current_load: true,
              notes: true,
            },
          }
        : false,
    },
    orderBy: {
      users: {
        full_name: 'asc',
      },
    },
  });
};

const getInstructorById = async (id) => {
  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(id) },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      departments_instructors_department_idTodepartments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  return instructor;
};

const getInstructorByUserId = async (user_id) => {
  const instructor = await prisma.instructors.findUnique({
    where: { user_id: parseInt(user_id) },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      departments_instructors_department_idTodepartments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  return instructor;
};

const createInstructor = async (data) => {
  const {
    instructor_code,
    department_id,
    degree,
    academic_title,
    specialization,
    years_of_experience,
    user_id,
    email,
    full_name,
    phone,
    username,
    password,
  } = data;

  const existingInstructor = await prisma.instructors.findUnique({
    where: { instructor_code },
  });

  if (existingInstructor) {
    throw new Error('Mã giảng viên đã tồn tại');
  }

  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      status: true,
    },
  });

  const instructor = await prisma.instructors.create({
    data: {
      user_id: user.id,
      instructor_code,
      department_id,
      degree,
      academic_title,
      specialization,
      years_of_experience: years_of_experience || 0,
      status: true,
    },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      departments_instructors_department_idTodepartments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });

  return instructor;
};

const getInstructorsByDepartmentHead = async (department_id, filters) => {
  const { thesis_round_id, search } = filters;

  const where = {
    department_id: parseInt(department_id),
    status: true,
  };

  if (thesis_round_id) {
    where.instructor_assignments = {
      some: {
        thesis_round_id: parseInt(thesis_round_id),
        status: true,
      },
    };
  }

  if (search) {
    where.OR = [
      {
        instructor_code: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        users: {
          full_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ];
  }

  return await prisma.instructors.findMany({
    where,
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      departments_instructors_department_idTodepartments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
      instructor_assignments: thesis_round_id
        ? {
            where: {
              thesis_round_id: parseInt(thesis_round_id),
              status: true,
            },
            select: {
              id: true,
              thesis_round_id: true,
              supervision_quota: true,
              current_load: true,
              notes: true,
            },
          }
        : false,
    },
    orderBy: {
      users: {
        full_name: 'asc',
      },
    },
  });
};

const getSupervisedStudents = async (instructorId, filters) => {
  const { thesis_round_id, status } = filters;

  const where = {
    supervisor_id: parseInt(instructorId),
  };

  if (thesis_round_id) {
    where.thesis_round_id = parseInt(thesis_round_id);
  }

  if (status) {
    where.status = status;
  }

  const theses = await prisma.theses.findMany({
    where,
    include: {
      thesis_members: {
        where: {
          is_active: true,
        },
        include: {
          students: {
            include: {
              users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
              classes: {
                select: {
                  id: true,
                  class_code: true,
                  class_name: true,
                },
              },
            },
          },
        },
      },
      thesis_groups: {
        select: {
          id: true,
          group_code: true,
          group_name: true,
        },
      },
      thesis_rounds: {
        select: {
          id: true,
          round_name: true,
          academic_year: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  // Flatten the result to return students with their thesis information
  const students = [];
  theses.forEach((thesis) => {
    thesis.thesis_members.forEach((member) => {
      students.push({
        student: member.students,
        thesis: {
          id: thesis.id,
          thesis_code: thesis.thesis_code,
          topic_title: thesis.topic_title,
          status: thesis.status,
          supervision_score: thesis.supervision_score,
          review_score: thesis.review_score,
          defense_score: thesis.defense_score,
          role: member.role,
          contribution_description: member.contribution_description,
          individual_contribution_score: member.individual_contribution_score,
          peer_evaluation_score: member.peer_evaluation_score,
          supervisor_individual_score: member.supervisor_individual_score,
          final_score: member.final_score,
          grade: member.grade,
        },
        thesis_group: thesis.thesis_groups,
        thesis_round: thesis.thesis_rounds,
      });
    });
  });

  return students;
};

module.exports = {
  getInstructors,
  getInstructorById,
  getInstructorByUserId,
  createInstructor,
  getInstructorsByDepartmentHead,
  getSupervisedStudents,
};
