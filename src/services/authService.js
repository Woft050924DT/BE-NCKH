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

  const student = await prisma.students.findUnique({
    where: { user_id: user.id },
    include: { classes: true },
  });

  if (student) {
    role = 'student';
    userInfo = {
      studentId: student.id,
      studentCode: student.student_code,
      className: student.classes.class_name,
    };
  }

  const instructor = await prisma.instructors.findUnique({
    where: { user_id: user.id },
    include: { departments_instructors_department_idTodepartments: true },
  });

  if (instructor) {
    role = 'instructor';
    userInfo = {
      instructorId: instructor.id,
      instructorCode: instructor.instructor_code,
      departmentName: instructor.departments_instructors_department_idTodepartments.department_name,
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

const getProfile = async (user_id, role) => {
  if (!user_id) {
    throw new Error('Thiếu user_id');
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(user_id) },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone: true,
      avatar: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  let additionalInfo = {};

  if (role === 'student') {
    const student = await prisma.students.findUnique({
      where: { user_id: parseInt(user_id) },
      include: { classes: true, majors: true },
    });
    additionalInfo = {
      studentCode: student.student_code,
      className: student.classes.class_name,
      majorName: student.majors.major_name,
      gpa: student.gpa,
      creditsEarned: student.credits_earned,
    };
  } else if (role === 'instructor') {
    const instructor = await prisma.instructors.findUnique({
      where: { user_id: parseInt(user_id) },
      include: { departments_instructors_department_idTodepartments: true },
    });
    additionalInfo = {
      instructorCode: instructor.instructor_code,
      departmentName: instructor.departments_instructors_department_idTodepartments.department_name,
      degree: instructor.degree,
      academicTitle: instructor.academic_title,
    };
  }

  return {
    ...user,
    ...additionalInfo,
    role,
  };
};

module.exports = {
  login,
  logout,
  getProfile,
};
