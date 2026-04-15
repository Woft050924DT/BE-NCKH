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

async function createDepartmentHead() {
  console.log('🚀 Creating Department Head account...');

  // Get department (default to first department if not specified)
  const department = await prisma.departments.findFirst();
  
  if (!department) {
    console.error('❌ No department found. Please create a department first.');
    process.exit(1);
  }

  console.log(`📋 Using department: ${department.department_name} (ID: ${department.id})`);

  // Check if username already exists
  const existingUser = await prisma.users.findUnique({
    where: { username: 'truongkhoa_moi' },
  });

  if (existingUser) {
    console.error('❌ Username "truongkhoa_moi" already exists');
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create user
  const user = await prisma.users.create({
    data: {
      username: 'truongkhoa_moi',
      password: hashedPassword,
      email: 'truongkhoa_moi@dlu.edu.vn',
      full_name: 'Trưởng Bộ Môn Mới',
      gender: 'Male',
      phone: '0901234567',
      status: true,
    },
  });

  console.log(`✅ User created: ${user.username}`);

  // Create instructor
  const instructor = await prisma.instructors.create({
    data: {
      user_id: user.id,
      instructor_code: 'GV_TBM_NEW',
      department_id: department.id,
      degree: 'Tiến Sĩ',
      academic_title: 'Trưởng Bộ Môn',
      specialization: 'Quản lý đào tạo',
      years_of_experience: 15,
      status: true,
    },
  });

  console.log(`✅ Instructor created: ${instructor.instructor_code}`);

  // Get DEPARTMENT_HEAD role
  const role = await prisma.user_roles.findUnique({
    where: { role_code: 'DEPARTMENT_HEAD' },
  });

  if (!role) {
    console.error('❌ DEPARTMENT_HEAD role not found. Creating it...');
    await prisma.user_roles.create({
      data: {
        role_code: 'DEPARTMENT_HEAD',
        role_name: 'Department Head',
        description: 'Department head with approval permissions',
        status: true,
      },
    });
    console.log('✅ DEPARTMENT_HEAD role created');
  }

  // Assign role
  const roleToAssign = role || await prisma.user_roles.findUnique({
    where: { role_code: 'DEPARTMENT_HEAD' },
  });

  await prisma.user_role_assignments.create({
    data: {
      user_id: user.id,
      role_id: roleToAssign.id,
      status: true,
    },
  });

  console.log(`✅ Role DEPARTMENT_HEAD assigned to user`);

  // Update department head
  await prisma.departments.update({
    where: { id: department.id },
    data: { head_id: instructor.id },
  });

  console.log(`✅ Department head updated`);

  console.log('\n🎉 Department Head account created successfully!');
  console.log('\n📋 Account Details:');
  console.log('  Username: truongkhoa_moi');
  console.log('  Password: 123456');
  console.log('  Email: truongkhoa_moi@dlu.edu.vn');
  console.log('  Full Name: Trưởng Bộ Môn Mới');
  console.log('  Department:', department.department_name);
}

createDepartmentHead()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
