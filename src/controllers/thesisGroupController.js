const prisma = require('../config/database');

const createThesisGroup = async (req, res) => {
  try {
    const { group_name, thesis_round_id, group_type, min_members, max_members, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.status(201).json(thesisGroup);
  } catch (error) {
    console.error('Create thesis group error:', error);
    res.status(500).json({ error: 'Lỗi tạo nhóm đồ án' });
  }
};

const getThesisGroups = async (req, res) => {
  try {
    const { thesis_round_id, student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.json(groups);
  } catch (error) {
    console.error('Get thesis groups error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách nhóm' });
  }
};

const createGroupInvitation = async (req, res) => {
  try {
    const { thesis_group_id, invited_student_id, invitation_message, student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Create group invitation error:', error);
    res.status(500).json({ error: 'Lỗi tạo lời mời' });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.json(invitation);
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Lỗi chấp nhận lời mời' });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
    }

    const invitation = await prisma.thesis_group_invitations.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
      },
    });

    res.json(invitation);
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ error: 'Lỗi từ chối lời mời' });
  }
};

const getInvitations = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'Thiếu student_id' });
    }

    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      return res.status(403).json({ error: 'Không tìm thấy sinh viên' });
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

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách lời mời' });
  }
};

module.exports = {
  createThesisGroup,
  getThesisGroups,
  createGroupInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
};
