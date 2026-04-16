const prisma = require('../config/database');
const thesisGroupService = require('./thesisGroupService');

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

  console.log('Received group_mode:', group_mode, 'Type:', typeof group_mode);

  // Check existing group_mode values in database
  const existingRules = await prisma.proposed_topic_rules.findMany({
    select: { group_mode: true },
    distinct: ['group_mode'],
  });
  console.log('Existing group_mode values in DB:', existingRules.map(r => r.group_mode));

  const validGroupModes = ['BOTH', 'GROUP_ONLY', 'INDIVIDUAL_ONLY'];
  
  let normalizedGroupMode = 'BOTH';
  if (group_mode) {
    normalizedGroupMode = String(group_mode).trim().toUpperCase();
  }

  console.log('Normalized group_mode:', normalizedGroupMode);

  if (!validGroupModes.includes(normalizedGroupMode)) {
    throw new Error(`group_mode phải là BOTH, GROUP_ONLY hoặc INDIVIDUAL_ONLY. Nhận được: "${normalizedGroupMode}"`);
  }

  const existingTopic = await prisma.proposed_topics.findFirst({
    where: {
      topic_code,
      thesis_round_id: parseInt(thesis_round_id),
    },
  });

  if (existingTopic) {
    throw new Error('Mã đề tài đã tồn tại trong đợt đồ án này');
  }

  // Try to find instructor by user_id first, then by instructor_id
  let finalInstructorId = parseInt(instructor_id);
  const instructorByUserId = await prisma.instructors.findUnique({
    where: { user_id: finalInstructorId },
  });

  if (instructorByUserId) {
    finalInstructorId = instructorByUserId.id;
  } else {
    // Try to find by instructor_id directly
    const instructorById = await prisma.instructors.findUnique({
      where: { id: finalInstructorId },
    });
    if (!instructorById) {
      // If neither exists, create instructor record
      const department = await prisma.departments.findFirst();
      if (!department) {
        throw new Error('Không tìm thấy bộ môn để tạo giảng viên');
      }

      const newInstructor = await prisma.instructors.create({
        data: {
          user_id: finalInstructorId,
          instructor_code: `GV${finalInstructorId}`,
          department_id: department.id,
          degree: 'N/A',
          academic_title: 'Giảng Viên',
          status: true,
        },
      });
      finalInstructorId = newInstructor.id;
      console.log(`Created new instructor record with id: ${finalInstructorId}`);
    }
  }

  const proposedTopic = await prisma.proposed_topics.create({
    data: {
      topic_code,
      topic_title,
      instructor_id: finalInstructorId,
      thesis_round_id,
      topic_description,
      objectives,
      student_requirements,
      technologies_used,
      topic_references,
    },
  });

  console.log('Creating proposed_topic_rules with group_mode:', normalizedGroupMode);

  await prisma.proposed_topic_rules.create({
    data: {
      proposed_topic_id: proposedTopic.id,
      group_mode: normalizedGroupMode,
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

  // Validate applied_group_mode
  const validGroupModes = ['BOTH', 'GROUP_ONLY', 'INDIVIDUAL_ONLY'];
  if (!applied_group_mode || !validGroupModes.includes(applied_group_mode)) {
    throw new Error(`applied_group_mode là bắt buộc và phải là một trong các giá trị: ${validGroupModes.join(', ')}`);
  }

  let finalThesisGroupId = thesis_group_id;

  // For individual mode, automatically create an individual group if not provided
  if (applied_group_mode === 'INDIVIDUAL_ONLY' && !thesis_group_id) {
    // Check if student is eligible in this thesis round, auto-create if not exists
    let studentRound = await prisma.student_thesis_rounds.findUnique({
      where: {
        thesis_round_id_student_id: {
          thesis_round_id: parseInt(thesis_round_id),
          student_id: student.id,
        },
      },
    });

    if (!studentRound) {
      // Auto-create student_thesis_rounds record
      studentRound = await prisma.student_thesis_rounds.create({
        data: {
          thesis_round_id: parseInt(thesis_round_id),
          student_id: student.id,
          eligible: true,
        },
      });
    }

    if (!studentRound.eligible) {
      throw new Error('Bạn không đủ điều kiện tham gia đợt đồ án này');
    }

    const individualGroup = await thesisGroupService.createThesisGroup({
      group_name: `Cá nhân - ${student.student_code}`,
      thesis_round_id: parseInt(thesis_round_id),
      group_type: 'INDIVIDUAL',
      min_members: 1,
      max_members: 1,
      student_id: parseInt(student_id),
    });
    finalThesisGroupId = individualGroup.id;
  } else if (applied_group_mode !== 'INDIVIDUAL_ONLY') {
    // Validate thesis_group_id for non-individual modes
    if (!thesis_group_id) {
      throw new Error('thesis_group_id là bắt buộc cho chế độ nhóm');
    }

    const thesisGroup = await prisma.thesis_groups.findFirst({
      where: {
        id: parseInt(thesis_group_id),
        thesis_round_id: parseInt(thesis_round_id),
      },
    });

    if (!thesisGroup) {
      throw new Error('Không tìm thấy nhóm đồ án trong đợt đồ án này');
    }
  }

  const topicRegistration = await prisma.topic_registrations.create({
    data: {
      thesis_group_id: parseInt(finalThesisGroupId),
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
  if (isNaN(parsedInstructorId) || parsedInstructorId === 0) {
    return [];
  }

  const instructor = await prisma.instructors.findUnique({
    where: { id: parsedInstructorId },
  });

  if (!instructor) {
    return [];
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
    },
    orderBy: { registration_date: 'desc' },
  });

  return registrations;
};

const getPendingRegistrationsForHead = async (filters) => {
  const { department_id } = filters;

  const parsedDepartmentId = parseInt(department_id);
  if (isNaN(parsedDepartmentId) || parsedDepartmentId === 0) {
    return [];
  }

  const department = await prisma.departments.findUnique({
    where: { id: parsedDepartmentId },
  });

  if (!department) {
    return [];
  }

  const registrations = await prisma.topic_registrations.findMany({
    where: {
      head_status: 'PENDING',
      instructors: {
        department_id: department.id,
      },
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
      instructors: {
        include: {
          users: true,
          departments: true,
        },
      },
    },
    orderBy: { registration_date: 'desc' },
  });

  return registrations;
};

const approveRegistration = async (id, data) => {
  const { status, rejection_reason, instructor_id } = data;

  const updateData = {
    instructor_status: status,
    instructor_rejection_reason: rejection_reason,
    instructor_approval_date: status === 'APPROVED' ? new Date() : null,
  };

  // Nếu giảng viên approve, chuyển tiếp cho trưởng bộ môn duyệt
  if (status === 'APPROVED') {
    updateData.head_status = 'PENDING';
  } else if (status === 'REJECTED') {
    // Nếu giảng viên reject, không cần trưởng bộ môn duyệt
    updateData.head_status = null;
  }

  const registration = await prisma.topic_registrations.update({
    where: { id: parseInt(id) },
    data: updateData,
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
    include: {
      proposed_topics: true,
    },
  });

  if (status === 'APPROVED' && registration.instructor_status === 'APPROVED') {
    // Check if thesis already exists for this registration
    const existingThesis = await prisma.theses.findUnique({
      where: { topic_registration_id: registration.id },
    });

    if (existingThesis) {
      // Thesis already exists, skip creation
      return registration;
    }

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
  getPendingRegistrationsForHead,
  approveRegistration,
  headApproveRegistration,
};
