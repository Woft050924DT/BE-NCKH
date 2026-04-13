const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username và mật khẩu là bắt buộc' });
    }

    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng' });
    }

    if (!user.status) {
      return res.status(401).json({ error: 'Tài khoản đã bị khóa' });
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

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role,
        ...userInfo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Đăng xuất thành công' });
};

const getProfile = async (req, res) => {
  try {
    const { user_id, role } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Thiếu user_id' });
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
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
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

    res.json({
      ...user,
      ...additionalInfo,
      role,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin người dùng' });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
};
