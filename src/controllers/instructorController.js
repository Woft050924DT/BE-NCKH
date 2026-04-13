const prisma = require('../config/database');

const getInstructors = async (req, res) => {
  try {
    const { thesis_round_id, search, department_id } = req.query;

    // Build where clause
    const where = {
      status: true,
    };

    // Filter by thesis round if provided
    if (thesis_round_id) {
      where.instructor_assignments = {
        some: {
          thesis_round_id: parseInt(thesis_round_id),
          status: true,
        },
      };
    }

    // Filter by department if provided
    if (department_id) {
      where.department_id = parseInt(department_id);
    }

    // Search by instructor code or name
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

    const instructors = await prisma.instructors.findMany({
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

    res.json(instructors);
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách giảng viên' });
  }
};

const getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    res.json(instructor);
  } catch (error) {
    console.error('Get instructor by ID error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin giảng viên' });
  }
};

const createInstructor = async (req, res) => {
  try {
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
    } = req.body;

    // Check if instructor_code already exists
    const existingInstructor = await prisma.instructors.findUnique({
      where: { instructor_code },
    });

    if (existingInstructor) {
      return res.status(400).json({ error: 'Mã giảng viên đã tồn tại' });
    }

    // Check if username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username đã tồn tại' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    // Create instructor
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

    res.status(201).json(instructor);
  } catch (error) {
    console.error('Create instructor error:', error);
    res.status(500).json({ error: 'Lỗi tạo giảng viên' });
  }
};

module.exports = {
  getInstructors,
  getInstructorById,
  createInstructor,
};
