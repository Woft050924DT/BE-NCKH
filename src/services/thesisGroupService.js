const prisma = require('../config/database');

const createThesisGroup = async (data) => {
  const { group_name, thesis_round_id, group_type, min_members, max_members, student_id } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  // Check if student already has an active group in this thesis round
  const existingMember = await prisma.thesis_group_members.findFirst({
    where: {
      student_id: student.id,
      thesis_round_id: parseInt(thesis_round_id),
      is_active: true,
    },
  });

  if (existingMember) {
    throw new Error('Sinh viên đã có nhóm trong đợt đồ án này. Vui lòng rời nhóm hiện tại trước khi tạo nhóm mới.');
  }

  // Generate unique group_code
  const group_code = `GRP-${thesis_round_id}-${Date.now().toString().slice(-6)}`;

  const thesisGroup = await prisma.thesis_groups.create({
    data: {
      group_code,
      group_name,
      thesis_round_id,
      group_type: group_type || 'GROUP',
      status: 'FORMING',
      min_members: min_members || 1,
      max_members: max_members || 4,
      created_by: student.id,
    },
  });

  await prisma.thesis_group_members.create({
    data: {
      thesis_group_id: thesisGroup.id,
      thesis_round_id: parseInt(thesis_round_id),
      student_id: student.id,
      role: 'LEADER',
      join_method: 'CREATOR',
      joined_at: new Date(),
    },
  });

  return thesisGroup;
};

const getThesisGroups = async (filters) => {
  const { thesis_round_id, student_id } = filters;

  const where = {};
  
  if (thesis_round_id) {
    where.thesis_round_id = parseInt(thesis_round_id);
  }

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

  // Check if invitation already exists
  const existingInvitation = await prisma.thesis_group_invitations.findFirst({
    where: {
      thesis_group_id,
      invited_student_id,
    },
  });

  if (existingInvitation) {
    throw new Error('Sinh viên đã được mời vào nhóm này rồi.');
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

  if (!student_id) {
    return [];
  }

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    return [];
  }

  const invitations = await prisma.thesis_group_invitations.findMany({
    where: {
      invited_student_id: student.id,
      status: 'PENDING',
    },
    include: {
      thesis_groups: true,
      students_thesis_group_invitations_invited_byTostudents: {
        include: { users: true },
      },
    },
    orderBy: { sent_at: 'desc' },
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
