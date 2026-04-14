const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://postgres:dt2711@localhost:5432/PMstudentsProject',
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  adapter: adapter,
});

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles
  const roles = await Promise.all([
    prisma.user_roles.upsert({
      where: { role_code: 'ADMIN' },
      update: {},
      create: {
        role_code: 'ADMIN',
        role_name: 'Administrator',
        description: 'System administrator with full access',
        status: true,
      },
    }),
    prisma.user_roles.upsert({
      where: { role_code: 'INSTRUCTOR' },
      update: {},
      create: {
        role_code: 'INSTRUCTOR',
        role_name: 'Instructor',
        description: 'Instructor/Teacher role',
        status: true,
      },
    }),
    prisma.user_roles.upsert({
      where: { role_code: 'STUDENT' },
      update: {},
      create: {
        role_code: 'STUDENT',
        role_name: 'Student',
        description: 'Student role',
        status: true,
      },
    }),
    prisma.user_roles.upsert({
      where: { role_code: 'DEPARTMENT_HEAD' },
      update: {},
      create: {
        role_code: 'DEPARTMENT_HEAD',
        role_name: 'Department Head',
        description: 'Department head with approval permissions',
        status: true,
      },
    }),
  ]);

  console.log('✅ Roles created:', roles.map(r => r.role_code));

  // Hash passwords
  const defaultPassword = await bcrypt.hash('123456', 10);

  // Create faculty
  const faculty = await prisma.faculties.upsert({
    where: { faculty_code: 'CNTT' },
    update: {},
    create: {
      faculty_code: 'CNTT',
      faculty_name: 'Khoa Công Nghệ Thông Tin',
      address: 'Đại học Đà Lạt',
      phone: '02633835214',
      email: 'cntt@dlu.edu.vn',
      status: true,
    },
  });

  console.log('✅ Faculty created:', faculty.faculty_code);

  // Create department
  const department = await prisma.departments.upsert({
    where: { department_code: 'KT' },
    update: {},
    create: {
      department_code: 'KT',
      department_name: 'Bộ môn Kỹ Thuật',
      faculty_id: faculty.id,
      status: true,
    },
  });

  console.log('✅ Department created:', department.department_code);

  // Create major
  const major = await prisma.majors.upsert({
    where: { major_code: 'CNTT' },
    update: {},
    create: {
      major_code: 'CNTT',
      major_name: 'Công Nghệ Thông Tin',
      department_id: department.id,
      description: 'Chuyên ngành Công Nghệ Thông Tin',
      status: true,
    },
  });

  console.log('✅ Major created:', major.major_code);

  // Create class
  const classData = await prisma.classes.upsert({
    where: { class_code: 'CNTT-K15' },
    update: {},
    create: {
      class_code: 'CNTT-K15',
      class_name: 'Lớp CNTT Khóa 15',
      major_id: major.id,
      academic_year: '2023',
      student_count: 0,
      status: true,
    },
  });

  console.log('✅ Class created:', classData.class_code);

  // 1. Create Admin account
  const adminUser = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: defaultPassword,
      email: 'admin@dlu.edu.vn',
      full_name: 'System Administrator',
      gender: 'Male',
      phone: '0901234567',
      status: true,
    },
  });

  // Assign admin role
  await prisma.user_role_assignments.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: roles[0].id, // ADMIN
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: roles[0].id,
      status: true,
    },
  });

  console.log('✅ Admin account created - Username: admin, Password: 123456');

  // 2. Create Instructor account
  const instructorUser = await prisma.users.upsert({
    where: { username: 'giangvien' },
    update: {},
    create: {
      username: 'giangvien',
      password: defaultPassword,
      email: 'giangvien@dlu.edu.vn',
      full_name: 'Nguyễn Văn A',
      gender: 'Male',
      phone: '0901234568',
      status: true,
    },
  });

  const instructor = await prisma.instructors.upsert({
    where: { user_id: instructorUser.id },
    update: {},
    create: {
      user_id: instructorUser.id,
      instructor_code: 'GV001',
      department_id: department.id,
      degree: 'Tiến Sĩ',
      academic_title: 'Giảng Viên Chính',
      specialization: 'Trí Tuệ Nhân Tạo',
      years_of_experience: 5,
      status: true,
    },
  });

  // Assign instructor role
  await prisma.user_role_assignments.upsert({
    where: {
      user_id_role_id: {
        user_id: instructorUser.id,
        role_id: roles[1].id, // INSTRUCTOR
      },
    },
    update: {},
    create: {
      user_id: instructorUser.id,
      role_id: roles[1].id,
      status: true,
    },
  });

  console.log('✅ Instructor account created - Username: giangvien, Password: 123456');

  // 3. Create Department Head account
  const deptHeadUser = await prisma.users.upsert({
    where: { username: 'truongkhoa' },
    update: {},
    create: {
      username: 'truongkhoa',
      password: defaultPassword,
      email: 'truongkhoa@dlu.edu.vn',
      full_name: 'Trần Văn B',
      gender: 'Male',
      phone: '0901234569',
      status: true,
    },
  });

  const deptHead = await prisma.instructors.upsert({
    where: { user_id: deptHeadUser.id },
    update: {},
    create: {
      user_id: deptHeadUser.id,
      instructor_code: 'GV002',
      department_id: department.id,
      degree: 'Phó Giáo Sư',
      academic_title: 'Trưởng Bộ Môn',
      specialization: 'Khoa Học Máy Tính',
      years_of_experience: 10,
      status: true,
    },
  });

  // Update department head
  await prisma.departments.update({
    where: { id: department.id },
    data: { head_id: deptHead.id },
  });

  // Assign department head role
  await prisma.user_role_assignments.upsert({
    where: {
      user_id_role_id: {
        user_id: deptHeadUser.id,
        role_id: roles[3].id, // DEPARTMENT_HEAD
      },
    },
    update: {},
    create: {
      user_id: deptHeadUser.id,
      role_id: roles[3].id,
      status: true,
    },
  });

  console.log('✅ Department Head account created - Username: truongkhoa, Password: 123456');

  // 4. Create Student account
  const studentUser = await prisma.users.upsert({
    where: { username: 'sinhvien' },
    update: {},
    create: {
      username: 'sinhvien',
      password: defaultPassword,
      email: 'sinhvien@dlu.edu.vn',
      full_name: 'Lê Thị C',
      gender: 'Female',
      phone: '0901234570',
      status: true,
    },
  });

  const student = await prisma.students.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      user_id: studentUser.id,
      student_code: 'SV2023001',
      class_id: classData.id,
      admission_year: 2023,
      gpa: 3.5,
      credits_earned: 0,
      academic_status: 'Active',
      status: true,
    },
  });

  // Assign student role
  await prisma.user_role_assignments.upsert({
    where: {
      user_id_role_id: {
        user_id: studentUser.id,
        role_id: roles[2].id, // STUDENT
      },
    },
    update: {},
    create: {
      user_id: studentUser.id,
      role_id: roles[2].id,
      status: true,
    },
  });

  console.log('✅ Student account created - Username: sinhvien, Password: 123456');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Default accounts:');
  console.log('  1. Admin - Username: admin, Password: 123456');
  console.log('  2. Instructor - Username: giangvien, Password: 123456');
  console.log('  3. Department Head - Username: truongkhoa, Password: 123456');
  console.log('  4. Student - Username: sinhvien, Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
