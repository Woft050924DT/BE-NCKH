const prisma = require('../config/database');

const createProposedTopic = async (data) => {
  const {
    topic_code,
    topic_title,
    topic_description,
    objectives,
    student_requirements,
    technologies_used,
    topic_references,
    thesis_round_id,
    group_mode,
    min_members,
    max_members,
    reason,
    instructor_id,
  } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const proposedTopic = await prisma.proposed_topics.create({
    data: {
      topic_code,
      topic_title,
      instructor_id: instructor.id,
      thesis_round_id,
      topic_description,
      objectives,
      student_requirements,
      technologies_used,
      topic_references,
    },
  });

  await prisma.proposed_topic_rules.create({
    data: {
      proposed_topic_id: proposedTopic.id,
      group_mode: group_mode || 'BOTH',
      min_members: min_members || 1,
      max_members: max_members || 4,
      reason,
    },
  });

  return proposedTopic;
};

const getProposedTopics = async (filters) => {
  const { thesis_round_id } = filters;

  const where = thesis_round_id ? { thesis_round_id: parseInt(thesis_round_id) } : {};

  const proposedTopics = await prisma.proposed_topics.findMany({
    where: {
      ...where,
      status: true,
      is_taken: false,
    },
    include: {
      proposed_topic_rules: true,
      instructors: {
        include: { users: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return proposedTopics;
};

const createTopicRegistration = async (data) => {
  const {
    thesis_group_id,
    thesis_round_id,
    instructor_id,
    proposed_topic_id,
    self_proposed_title,
    self_proposed_description,
    selection_reason,
    applied_group_mode,
    applied_min_members,
    applied_max_members,
    student_id,
  } = data;

  const student = await prisma.students.findUnique({
    where: { id: parseInt(student_id) },
  });

  if (!student) {
    throw new Error('Không tìm thấy sinh viên');
  }

  const topicRegistration = await prisma.topic_registrations.create({
    data: {
      thesis_group_id,
      thesis_round_id,
      instructor_id,
      proposed_topic_id,
      self_proposed_title,
      self_proposed_description,
      selection_reason,
      applied_group_mode,
      applied_min_members,
      applied_max_members,
      instructor_status: 'PENDING',
      head_status: 'PENDING',
    },
  });

  return topicRegistration;
};

const getTopicRegistrations = async (filters) => {
  const { status, student_id } = filters;

  let where = {};

  if (student_id) {
    const student = await prisma.students.findUnique({
      where: { id: parseInt(student_id) },
    });

    if (!student) {
      throw new Error('Không tìm thấy sinh viên');
    }

    where = {
      thesis_groups: {
        thesis_group_members: {
          some: { student_id: student.id },
        },
      },
    };
  }

  if (status) {
    where.instructor_status = status;
  }

  const registrations = await prisma.topic_registrations.findMany({
    where,
    include: {
      proposed_topics: {
        include: { instructors: { include: { users: true } } },
      },
      thesis_groups: true,
      instructors: true,
    },
    orderBy: { registration_date: 'desc' },
  });

  return registrations;
};

const getPendingRegistrations = async (filters) => {
  const { instructor_id } = filters;

  const parsedInstructorId = parseInt(instructor_id);
  if (isNaN(parsedInstructorId)) {
    throw new Error('instructor_id không hợp lệ');
  }

  const instructor = await prisma.instructors.findUnique({
    where: { id: parsedInstructorId },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const registrations = await prisma.topic_registrations.findMany({
    where: {
      instructor_id: instructor.id,
      instructor_status: 'PENDING',
    },
    include: {
      thesis_groups: {
        include: {
          thesis_group_members: {
            include: {
              students: {
                include: { users: true, classes: true },
              },
            },
          },
        },
      },
      proposed_topics: true,
      thesis_rounds: true,
    },
    orderBy: { registration_date: 'desc' },
  });

  return registrations;
};

const approveRegistration = async (id, data) => {
  const { status, rejection_reason, instructor_id } = data;

  const instructor = await prisma.instructors.findUnique({
    where: { id: parseInt(instructor_id) },
  });

  if (!instructor) {
    throw new Error('Không tìm thấy giảng viên');
  }

  const registration = await prisma.topic_registrations.update({
    where: { id: parseInt(id) },
    data: {
      instructor_status: status,
      instructor_rejection_reason: rejection_reason,
      instructor_approval_date: status === 'APPROVED' ? new Date() : null,
    },
  });

  return registration;
};

const headApproveRegistration = async (id, data) => {
  const {
    status,
    rejection_reason,
    head_override_group_mode,
    head_override_min_members,
    head_override_max_members,
    head_override_reason,
  } = data;

  const registration = await prisma.topic_registrations.update({
    where: { id: parseInt(id) },
    data: {
      head_status: status,
      head_rejection_reason: rejection_reason,
      head_approval_date: status === 'APPROVED' ? new Date() : null,
      head_override_group_mode,
      head_override_min_members,
      head_override_max_members,
      head_override_reason,
    },
  });

  if (status === 'APPROVED' && registration.instructor_status === 'APPROVED') {
    const thesisCode = `THESIS-${registration.thesis_round_id}-${Date.now()}`;

    const thesis = await prisma.theses.create({
      data: {
        thesis_code: thesisCode,
        topic_title: registration.proposed_topic_id ? registration.proposed_topics.topic_title : registration.self_proposed_title,
        thesis_group_id: registration.thesis_group_id,
        thesis_round_id: registration.thesis_round_id,
        supervisor_id: registration.instructor_id,
        topic_registration_id: registration.id,
        topic_description: registration.proposed_topic_id ? registration.proposed_topics.topic_description : registration.self_proposed_description,
        status: 'IN_PROGRESS',
        defense_eligible: false,
      },
    });

    if (registration.proposed_topic_id) {
      await prisma.proposed_topics.update({
        where: { id: registration.proposed_topic_id },
        data: { is_taken: true },
      });
    }

    const groupMembers = await prisma.thesis_group_members.findMany({
      where: { thesis_group_id: registration.thesis_group_id },
    });

    await Promise.all(
      groupMembers.map((member) =>
        prisma.thesis_members.create({
          data: {
            thesis_id: thesis.id,
            student_id: member.student_id,
            role: member.role,
            join_date: new Date(),
          },
        })
      )
    );
  }

  return registration;
};

module.exports = {
  createProposedTopic,
  getProposedTopics,
  createTopicRegistration,
  getTopicRegistrations,
  getPendingRegistrations,
  approveRegistration,
  headApproveRegistration,
};
