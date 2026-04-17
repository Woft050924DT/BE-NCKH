const bcrypt = require('bcrypt');
const prisma = require('../config/database');

// ==================== FACULTY MANAGEMENT ====================

const getFaculties = async () => {
  return await prisma.faculties.findMany({
    where: {
      status: true,
    },
    include: {
      departments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
    orderBy: {
      faculty_name: 'asc',
    },
  });
};

const getFacultyById = async (id) => {
  const faculty = await prisma.faculties.findUnique({
    where: { id: parseInt(id) },
    include: {
      departments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });

  if (!faculty) {
    throw new Error('Không tìm thấy khoa');
  }

  return faculty;
};

const createFaculty = async (data) => {
  const { faculty_code, faculty_name, description, address, phone, email, dean_id } = data;

  const existingFaculty = await prisma.faculties.findUnique({
    where: { faculty_code },
  });

  if (existingFaculty) {
    throw new Error('Mã khoa đã tồn tại');
  }

  if (dean_id) {
    const dean = await prisma.instructors.findUnique({
      where: { id: parseInt(dean_id) },
    });
    if (!dean) {
      throw new Error('Không tìm thấy trưởng khoa');
    }
  }

  return await prisma.faculties.create({
    data: {
      faculty_code,
      faculty_name,
      address,
      phone,
      email,
      dean_id: dean_id ? parseInt(dean_id) : null,
      status: true,
    },
    include: {
      departments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });
};

const updateFaculty = async (id, data) => {
  const { faculty_name, address, phone, email, dean_id, status } = data;

  const faculty = await prisma.faculties.findUnique({
    where: { id: parseInt(id) },
  });

  if (!faculty) {
    throw new Error('Không tìm thấy khoa');
  }

  if (dean_id) {
    const dean = await prisma.instructors.findUnique({
      where: { id: parseInt(dean_id) },
    });
    if (!dean) {
      throw new Error('Không tìm thấy trưởng khoa');
    }
  }

  return await prisma.faculties.update({
    where: { id: parseInt(id) },
    data: {
      faculty_name,
      address,
      phone,
      email,
      dean_id: dean_id ? parseInt(dean_id) : null,
      status: status !== undefined ? status : faculty.status,
    },
    include: {
      departments: {
        select: {
          id: true,
          department_code: true,
          department_name: true,
        },
      },
    },
  });
};

const deleteFaculty = async (id) => {
  const faculty = await prisma.faculties.findUnique({
    where: { id: parseInt(id) },
    include: {
      departments: true,
    },
  });

  if (!faculty) {
    throw new Error('Không tìm thấy khoa');
  }

  if (faculty.departments.length > 0) {
    throw new Error('Khoa đang có bộ môn, không thể xóa');
  }

  await prisma.faculties.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Đã xóa khoa thành công' };
};

// ==================== DEPARTMENT MANAGEMENT ====================

const getDepartments = async (filters) => {
  const { faculty_id } = filters;

  const where = {
    status: true,
  };

  if (faculty_id) {
    where.faculty_id = parseInt(faculty_id);
  }

  return await prisma.departments.findMany({
    where,
    include: {
      faculties: {
        select: {
          id: true,
          faculty_code: true,
          faculty_name: true,
        },
      },
      instructors_departments_head_idToinstructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
        take: 5,
      },
    },
    orderBy: {
      department_name: 'asc',
    },
  });
};

const getDepartmentById = async (id) => {
  const department = await prisma.departments.findUnique({
    where: { id: parseInt(id) },
    include: {
      faculties: {
        select: {
          id: true,
          faculty_code: true,
          faculty_name: true,
        },
      },
      instructors_departments_head_idToinstructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      majors: {
        include: {
          classes: {
            select: {
              id: true,
              class_code: true,
              class_name: true,
            },
            take: 5,
          },
        },
      },
    },
  });

  if (!department) {
    throw new Error('Không tìm thấy bộ môn');
  }

  return department;
};

const createDepartment = async (data) => {
  const { department_code, department_name, description, faculty_id, head_id } = data;

  const existingDepartment = await prisma.departments.findUnique({
    where: { department_code },
  });

  if (existingDepartment) {
    throw new Error('Mã bộ môn đã tồn tại');
  }

  const faculty = await prisma.faculties.findUnique({
    where: { id: parseInt(faculty_id) },
  });

  if (!faculty) {
    throw new Error('Không tìm thấy khoa');
  }

  if (head_id) {
    const head = await prisma.instructors.findUnique({
      where: { id: parseInt(head_id) },
    });
    if (!head) {
      throw new Error('Không tìm thấy trưởng bộ môn');
    }
  }

  return await prisma.departments.create({
    data: {
      department_code,
      department_name,
      description,
      faculty_id: parseInt(faculty_id),
      head_id: head_id ? parseInt(head_id) : null,
      status: true,
    },
    include: {
      faculties: {
        select: {
          id: true,
          faculty_code: true,
          faculty_name: true,
        },
      },
    },
  });
};

const updateDepartment = async (id, data) => {
  const { department_name, description, head_id, status } = data;

  const department = await prisma.departments.findUnique({
    where: { id: parseInt(id) },
  });

  if (!department) {
    throw new Error('Không tìm thấy bộ môn');
  }

  if (head_id) {
    const head = await prisma.instructors.findUnique({
      where: { id: parseInt(head_id) },
    });
    if (!head) {
      throw new Error('Không tìm thấy trưởng bộ môn');
    }
  }

  return await prisma.departments.update({
    where: { id: parseInt(id) },
    data: {
      department_name,
      description,
      head_id: head_id ? parseInt(head_id) : null,
      status: status !== undefined ? status : department.status,
    },
    include: {
      faculties: {
        select: {
          id: true,
          faculty_code: true,
          faculty_name: true,
        },
      },
    },
  });
};

const deleteDepartment = async (id) => {
  const department = await prisma.departments.findUnique({
    where: { id: parseInt(id) },
    include: {
      instructors: true,
      majors: {
        include: {
          classes: true,
        },
      },
    },
  });

  if (!department) {
    throw new Error('Không tìm thấy bộ môn');
  }

  const hasInstructors = department.instructors.length > 0;
  const hasStudents = department.majors.some(m => m.classes.length > 0);

  if (hasInstructors || hasStudents) {
    throw new Error('Bộ môn đang có giảng viên hoặc sinh viên, không thể xóa');
  }

  await prisma.departments.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Đã xóa bộ môn thành công' };
};

// ==================== CLASS MANAGEMENT ====================

const getClasses = async (filters) => {
  const { department_id, major_id } = filters;

  const where = {
    status: true,
  };

  if (major_id) {
    where.major_id = parseInt(major_id);
  }

  if (department_id) {
    const majors = await prisma.majors.findMany({
      where: { department_id: parseInt(department_id) },
      select: { id: true },
    });
    where.major_id = {
      in: majors.map(m => m.id),
    };
  }

  return await prisma.classes.findMany({
    where,
    include: {
      majors: {
        select: {
          id: true,
          major_code: true,
          major_name: true,
          departments: {
            select: {
              id: true,
              department_code: true,
              department_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      students: {
        select: {
          id: true,
          student_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
        take: 5,
      },
    },
    orderBy: {
      class_name: 'asc',
    },
  });
};

const getClassById = async (id) => {
  const classData = await prisma.classes.findUnique({
    where: { id: parseInt(id) },
    include: {
      majors: {
        select: {
          id: true,
          major_code: true,
          major_name: true,
          departments: {
            select: {
              id: true,
              department_code: true,
              department_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      students: {
        select: {
          id: true,
          student_code: true,
          users: {
            select: {
              full_name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!classData) {
    throw new Error('Không tìm thấy lớp học');
  }

  return classData;
};

const createClass = async (data) => {
  const { class_code, class_name, major_id, academic_year, advisor_id } = data;

  const existingClass = await prisma.classes.findUnique({
    where: { class_code },
  });

  if (existingClass) {
    throw new Error('Mã lớp học đã tồn tại');
  }

  const major = await prisma.majors.findUnique({
    where: { id: parseInt(major_id) },
  });

  if (!major) {
    throw new Error('Không tìm thấy chuyên ngành');
  }

  if (advisor_id) {
    const advisor = await prisma.instructors.findUnique({
      where: { id: parseInt(advisor_id) },
    });
    if (!advisor) {
      throw new Error('Không tìm thấy cố vấn học tập');
    }
  }

  return await prisma.classes.create({
    data: {
      class_code,
      class_name,
      major_id: parseInt(major_id),
      academic_year,
      advisor_id: advisor_id ? parseInt(advisor_id) : null,
      status: true,
    },
    include: {
      majors: {
        select: {
          id: true,
          major_code: true,
          major_name: true,
        },
      },
    },
  });
};

const updateClass = async (id, data) => {
  const { class_name, advisor_id, status } = data;

  const classData = await prisma.classes.findUnique({
    where: { id: parseInt(id) },
  });

  if (!classData) {
    throw new Error('Không tìm thấy lớp học');
  }

  if (advisor_id) {
    const advisor = await prisma.instructors.findUnique({
      where: { id: parseInt(advisor_id) },
    });
    if (!advisor) {
      throw new Error('Không tìm thấy cố vấn học tập');
    }
  }

  return await prisma.classes.update({
    where: { id: parseInt(id) },
    data: {
      class_name,
      advisor_id: advisor_id ? parseInt(advisor_id) : null,
      status: status !== undefined ? status : classData.status,
    },
    include: {
      majors: {
        select: {
          id: true,
          major_code: true,
          major_name: true,
        },
      },
    },
  });
};

const deleteClass = async (id) => {
  const classData = await prisma.classes.findUnique({
    where: { id: parseInt(id) },
    include: {
      students: true,
    },
  });

  if (!classData) {
    throw new Error('Không tìm thấy lớp học');
  }

  if (classData.students.length > 0) {
    throw new Error('Lớp học đang có sinh viên, không thể xóa');
  }

  await prisma.classes.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Đã xóa lớp học thành công' };
};

// ==================== USER MANAGEMENT ====================

const getUsers = async (filters) => {
  const { role, status, search } = filters;

  const where = {};

  if (status !== undefined) {
    where.status = status === 'ACTIVE' ? true : status === 'INACTIVE' ? false : true;
  }

  if (search) {
    where.OR = [
      {
        full_name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  let users = await prisma.users.findMany({
    where,
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      status: true,
      created_at: true,
      updated_at: true,
      last_login: true,
      students: {
        select: {
          id: true,
          student_code: true,
          classes: {
            select: {
              class_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          degree: true,
          academic_title: true,
          departments_instructors_department_idTodepartments: {
            select: {
              department_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      full_name: 'asc',
    },
  });

  // Filter by role if specified
  if (role) {
    users = users.filter(user => {
      if (role === 'student') return user.students;
      if (role === 'instructor') return user.instructors;
      if (role === 'admin') {
        // Check if user has admin role in user_role_assignments
        return true; // Will need to check role assignments
      }
      return true;
    });
  }

  return users;
};

const getUserById = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      full_name: true,
      gender: true,
      date_of_birth: true,
      phone: true,
      address: true,
      avatar: true,
      status: true,
      created_at: true,
      updated_at: true,
      last_login: true,
      students: {
        select: {
          id: true,
          student_code: true,
          admission_year: true,
          gpa: true,
          credits_earned: true,
          academic_status: true,
          classes: {
            select: {
              class_name: true,
            },
          },
        },
      },
      instructors: {
        select: {
          id: true,
          instructor_code: true,
          degree: true,
          academic_title: true,
          specialization: true,
          years_of_experience: true,
          departments_instructors_department_idTodepartments: {
            select: {
              department_name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  return user;
};

const createUser = async (data) => {
  const { email, username, password, full_name, role, phone, gender, date_of_birth, address } = data;

  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  const existingEmail = await prisma.users.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error('Email đã tồn tại');
  }

  if (password.length < 8) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      gender,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      address,
      status: true,
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
};

const updateUser = async (id, data) => {
  const { full_name, email, phone, role, status, gender, date_of_birth, address } = data;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  if (email && email !== user.email) {
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new Error('Email đã tồn tại');
    }
  }

  return await prisma.users.update({
    where: { id: parseInt(id) },
    data: {
      full_name,
      email,
      phone,
      gender,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
      address,
      status: status !== undefined ? (status === 'ACTIVE' ? true : status === 'INACTIVE' ? false : user.status) : user.status,
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const deleteUser = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id: parseInt(id) },
    include: {
      students: true,
      instructors: true,
    },
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  if (user.students || user.instructors) {
    throw new Error('Người dùng đang có dữ liệu liên quan, không thể xóa');
  }

  await prisma.users.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Đã xóa người dùng thành công' };
};

// ==================== CREATE STUDENT ====================

const createStudent = async (data) => {
  const { student_code, class_id, department_id, user } = data;

  const existingStudent = await prisma.students.findUnique({
    where: { student_code },
  });

  if (existingStudent) {
    throw new Error('Mã sinh viên đã tồn tại');
  }

  const classData = await prisma.classes.findUnique({
    where: { id: parseInt(class_id) },
  });

  if (!classData) {
    throw new Error('Không tìm thấy lớp học');
  }

  const department = await prisma.departments.findUnique({
    where: { id: parseInt(department_id) },
  });

  if (!department) {
    throw new Error('Không tìm thấy bộ môn');
  }

  // Create user
  const { email, username, password, full_name, phone } = user;

  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  const existingEmail = await prisma.users.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error('Email đã tồn tại');
  }

  if (password.length < 8) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      status: true,
    },
  });

  // Create student
  const student = await prisma.students.create({
    data: {
      student_code,
      class_id: parseInt(class_id),
      user_id: createdUser.id,
      admission_year: new Date().getFullYear(),
      status: true,
    },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  return student;
};

// ==================== CREATE INSTRUCTOR ====================

const createInstructorAdmin = async (data) => {
  const { instructor_code, department_id, degree, academic_title, specialization, years_of_experience, user } = data;

  const existingInstructor = await prisma.instructors.findUnique({
    where: { instructor_code },
  });

  if (existingInstructor) {
    throw new Error('Mã giảng viên đã tồn tại');
  }

  const department = await prisma.departments.findUnique({
    where: { id: parseInt(department_id) },
  });

  if (!department) {
    throw new Error('Không tìm thấy bộ môn');
  }

  // Create user
  const { email, username, password, full_name, phone } = user;

  const existingUser = await prisma.users.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  const existingEmail = await prisma.users.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error('Email đã tồn tại');
  }

  if (password.length < 8) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      status: true,
    },
  });

  // Create instructor
  const instructor = await prisma.instructors.create({
    data: {
      instructor_code,
      department_id: parseInt(department_id),
      user_id: createdUser.id,
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
        },
      },
    },
  });

  return instructor;
};

// ==================== SYSTEM STATISTICS ====================

const getStatistics = async () => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalFaculties,
    totalDepartments,
    totalClasses,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.students.count(),
    prisma.instructors.count(),
    prisma.faculties.count(),
    prisma.departments.count(),
    prisma.classes.count(),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalFaculties,
    totalDepartments,
    totalClasses,
  };
};

module.exports = {
  // Faculty Management
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,

  // Department Management
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  // Class Management
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,

  // User Management
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  // Create Student
  createStudent,

  // Create Instructor
  createInstructorAdmin,

  // Statistics
  getStatistics,
};
