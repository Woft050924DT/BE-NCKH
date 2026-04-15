const { verifyToken } = require('../config/jwt');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.status) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc người dùng không tồn tại' });
    }

    const roleAssignments = await prisma.user_role_assignments.findMany({
      where: {
        user_id: user.id,
        status: true,
      },
      include: {
        user_roles: true,
      },
    });

    let role = null;
    const rolePriority = ['ADMIN', 'DEPARTMENT_HEAD', 'INSTRUCTOR', 'STUDENT'];
    for (const roleCode of rolePriority) {
      const assignment = roleAssignments.find(ra => ra.user_roles.role_code === roleCode);
      if (assignment) {
        role = roleCode.toLowerCase();
        break;
      }
    }

    let instructorId = null;
    let studentId = null;

    const student = await prisma.students.findUnique({
      where: { user_id: user.id },
    });
    if (student) {
      studentId = student.id;
    }

    const instructor = await prisma.instructors.findUnique({
      where: { user_id: user.id },
    });
    if (instructor) {
      instructorId = instructor.id;
    }

    let departmentId = null;
    if (role === 'department_head') {
      const department = await prisma.departments.findFirst({
        where: { head_id: instructorId },
      });
      if (department) {
        departmentId = department.id;
      }
    }

    req.user = {
      id: user.id,
      role,
      instructorId,
      studentId,
      departmentId,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
