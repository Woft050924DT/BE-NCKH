const prisma = require('../config/database');

const createThesisGroup = async (data) => {
  const { group_name, thesis_round_id, group_type, min_members, max_members, student_id } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const thesisGroup = await prisma.thesis_groups.create({
    data: {
      group_name,
      thesis_round_id,
      group_type: group_type || 'GROUP',
      status: 'FORMING',
      min_members: min_members || 1,
      max_members: max_members || 4,
    },
  });

  await prisma.thesis_group_members.create({
    data: {
      thesis_group_id: thesisGroup.id,
      student_id: student.id,
      role: 'LEADER',
      join_method: 'CREATE',
      joined_at: new Date(),
    },
  });

  return thesisGroup;
};

const getThesisGroups = async (filters) => {
  const { thesis_round_id, student_id } = filters;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const where = thesis_round_id 
    ? { thesis_round_id: parseInt(thesis_round_id) }
    : {};

  const groups = await prisma.thesis_groups.findMany({
    where,
    include: {
      thesis_group_members: {
        include: {
          students: {
            include: { users: true },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return groups;
};

const createGroupInvitation = async (data) => {
  const { thesis_group_id, invited_student_id, invitation_message, student_id } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const invitation = await prisma.thesis_group_invitations.create({
    data: {
      thesis_group_id,
      invited_student_id,
      invited_by: student.id,
      invitation_message,
      status: 'PENDING',
    },
  });

  return invitation;
};

const acceptInvitation = async (id, data) => {
  const { student_id } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const invitation = await prisma.thesis_group_invitations.update({
    where: { id: parseInt(id) },
    data: {
      status: 'ACCEPTED',
    },
  });

  await prisma.thesis_group_members.create({
    data: {
      thesis_group_id: invitation.thesis_group_id,
      student_id: student.id,
      role: 'MEMBER',
      join_method: 'INVITE',
      joined_at: new Date(),
    },
  });

  return invitation;
};

const rejectInvitation = async (id, data) => {
  const { student_id } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const invitation = await prisma.thesis_group_invitations.update({
    where: { id: parseInt(id) },
    data: {
      status: 'REJECTED',
    },
  });

  return invitation;
};

const getInvitations = async (filters) => {
  const { student_id } = filters;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const invitations = await prisma.thesis_group_invitations.findMany({
    where: {
      invited_student_id: student.id,
      status: 'PENDING',
    },
    include: {
      thesis_groups: true,
      students_invited_by: {
        include: { users: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return invitations;
};

module.exports = {
  createThesisGroup,
  getThesisGroups,
  createGroupInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
};
