const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');

const login = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username và mật khẩu là bắt buộc');
  }

  const user = await prisma.users.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('Username hoặc mật khẩu không đúng');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Username hoặc mật khẩu không đúng');
  }

  if (!user.status) {
    throw new Error('Tài khoản đã bị khóa');
  }

  let role = null;
  let userInfo = null;

  // Check user role assignments first
  const roleAssignments = await prisma.user_role_assignments.findMany({
    where: { 
      user_id: user.id,
      status: true,
    },
    include: {
      user_roles: true,
    },
  });

  if (roleAssignments.length > 0) {
    // Get the highest priority role (ADMIN > DEPARTMENT_HEAD > INSTRUCTOR > STUDENT)
    const rolePriority = ['ADMIN', 'DEPARTMENT_HEAD', 'INSTRUCTOR', 'STUDENT'];
    for (const roleCode of rolePriority) {
      const assignment = roleAssignments.find(ra => ra.user_roles.role_code === roleCode);
      if (assignment) {
        role = roleCode.toLowerCase();
        break;
      }
    }
  }

  // Get additional info based on role
  const student = await prisma.students.findUnique({
    where: { user_id: user.id },
    include: { 
      classes: { 
        include: { majors: true } 
      } 
    },
  });

  if (student) {
    userInfo = {
      studentId: student.id,
      studentCode: student.student_code,
      className: student.classes?.class_name,
      majorName: student.classes?.majors?.major_name,
      gpa: student.gpa,
      creditsEarned: student.credits_earned,
    };
  }

  const instructor = await prisma.instructors.findUnique({
    where: { user_id: user.id },
    include: { departments_instructors_department_idTodepartments: true },
  });

  if (instructor) {
    userInfo = {
      ...userInfo,
      instructorId: instructor.id,
      instructorCode: instructor.instructor_code,
      departmentName: instructor.departments_instructors_department_idTodepartments?.department_name,
      degree: instructor.degree,
      academicTitle: instructor.academic_title,
    };
  } else if (role === 'instructor' || role === 'department_head') {
    // Fallback: use user.id if instructor record doesn't exist
    userInfo = {
      ...userInfo,
      instructorId: user.id,
    };
  }

  const token = generateToken({
    userId: user.id,
    role,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role,
      ...userInfo,
    },
  };
};

const logout = () => {
  return { message: 'Đăng xuất thành công' };
};

const getProfile = async (user) => {
  if (!user || !user.id) {
    throw new Error('Thiếu thông tin người dùng');
  }

  const parsedUserId = parseInt(user.id);
  if (isNaN(parsedUserId)) {
    throw new Error('user_id không hợp lệ');
  }

  const dbUser = await prisma.users.findUnique({
    where: { id: parsedUserId },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      avatar: true,
      created_at: true,
    },
  });

  if (!dbUser) {
    throw new Error('Không tìm thấy người dùng');
  }

  let additionalInfo = {};
  const role = user.role;

  if (role === 'student') {
    const student = await prisma.students.findUnique({
      where: { user_id: parsedUserId },
      include: { classes: true, majors: true },
    });
    if (student) {
      additionalInfo = {
        studentId: student.id,
        studentCode: student.student_code,
        className: student.classes?.class_name,
        majorName: student.majors?.major_name,
        gpa: student.gpa,
        creditsEarned: student.credits_earned,
      };
    }
  } else if (role === 'instructor') {
    const instructor = await prisma.instructors.findUnique({
      where: { user_id: parsedUserId },
      include: { departments_instructors_department_idTodepartments: true },
    });
    if (instructor) {
      additionalInfo = {
        instructorId: instructor.id,
        instructorCode: instructor.instructor_code,
        departmentName: instructor.departments_instructors_department_idTodepartments?.department_name,
        degree: instructor.degree,
        academicTitle: instructor.academic_title,
      };
    }
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.full_name,
    phone: dbUser.phone,
    avatar: dbUser.avatar,
    createdAt: dbUser.created_at,
    ...additionalInfo,
    role,
  };
};

module.exports = {
  login,
  logout,
  getProfile,
};
