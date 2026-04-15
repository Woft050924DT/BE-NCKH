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

module.exports = {
  getInstructors,
  getInstructorById,
  getInstructorByUserId,
  createInstructor,
  getInstructorsByDepartmentHead,
};
