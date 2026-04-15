const HttpError = require('../utils/HttpError');
const prisma = require('../config/database');

const createGroup = async (roundId, data, user) => {
  try {
    const { groupName, groupType, studentId } = data;

    // Verify student is eligible in this round
    const studentRound = await prisma.student_thesis_rounds.findUnique({
      where: {
        thesis_round_id_student_id: {
          thesis_round_id: parseInt(roundId),
          student_id: parseInt(studentId),
        },
      },
    });

    if (!studentRound || !studentRound.eligible) {
      throw new HttpError(403, 'Bạn không đủ điều kiện tham gia đợt đồ án này');
    }

    // Check student hasn't joined another active group in same round
    const existingMember = await prisma.thesis_group_members.findFirst({
      where: {
        student_id: parseInt(studentId),
        thesis_round_id: parseInt(roundId),
        is_active: true,
      },
    });

    if (existingMember) {
      throw new HttpError(400, 'Bạn đã tham gia một nhóm khác trong đợt đồ án này');
    }

    // Fetch round rules for min/maxMembers
    const roundRules = await prisma.thesis_round_rules.findUnique({
      where: { thesis_round_id: parseInt(roundId) },
    });

    const minMembers = roundRules?.default_min_members || 1;
    const maxMembers = roundRules?.default_max_members || 4;

    // Generate group code
    const groupCode = `NH-${roundId}-${Date.now()}`;

    // $transaction to create group and member
    const result = await prisma.$transaction(async (tx) => {
      const group = await tx.thesis_groups.create({
        data: {
          group_code: groupCode,
          group_name: groupName,
          thesis_round_id: parseInt(roundId),
          group_type: groupType || 'INDIVIDUAL',
          created_by: parseInt(studentId),
          min_members: minMembers,
          max_members: maxMembers,
          current_members: 1,
          status: 'FORMING',
        },
      });

      await tx.thesis_group_members.create({
        data: {
          thesis_group_id: group.id,
          thesis_round_id: parseInt(roundId),
          student_id: parseInt(studentId),
          role: 'LEADER',
          join_method: 'CREATOR',
          is_active: true,
        },
      });

      return group;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in createGroup service:', error);
    throw new HttpError(500, 'Lỗi tạo nhóm');
  }
};

const inviteToGroup = async (groupId, data, user) => {
  try {
    const { studentId, message, invitedBy } = data;

    const group = await prisma.thesis_groups.findUnique({
      where: { id: parseInt(groupId) },
      include: {
        thesis_group_members: {
          where: { is_active: true },
        },
      },
    });

    if (!group) {
      throw new HttpError(404, 'Không tìm thấy nhóm');
    }

    if (group.status !== 'FORMING') {
      throw new HttpError(400, 'Nhóm không ở trạng thái đang hình thành');
    }

    // Verify target student is in same round, eligible, not in another group
    const targetStudentRound = await prisma.student_thesis_rounds.findUnique({
      where: {
        thesis_round_id_student_id: {
          thesis_round_id: group.thesis_round_id,
          student_id: parseInt(studentId),
        },
      },
    });

    if (!targetStudentRound || !targetStudentRound.eligible) {
      throw new HttpError(400, 'Sinh viên không đủ điều kiện tham gia đợt đồ án này');
    }

    const targetExistingMember = await prisma.thesis_group_members.findFirst({
      where: {
        student_id: parseInt(studentId),
        thesis_round_id: group.thesis_round_id,
        is_active: true,
      },
    });

    if (targetExistingMember) {
      throw new HttpError(400, 'Sinh viên đã tham gia một nhóm khác trong đợt đồ án này');
    }

    // Verify group.currentMembers < group.maxMembers
    if (group.current_members >= group.max_members) {
      throw new HttpError(400, 'Nhóm đã đạt số lượng thành viên tối đa');
    }

    // Check no pending invitation already exists for this student+group
    const existingInvitation = await prisma.thesis_group_invitations.findFirst({
      where: {
        thesis_group_id: parseInt(groupId),
        invited_student_id: parseInt(studentId),
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new HttpError(400, 'Đã có lời mời đang chờ phản hồi cho sinh viên này');
    }

    // Create invitation
    const invitation = await prisma.thesis_group_invitations.create({
      data: {
        thesis_group_id: parseInt(groupId),
        invited_student_id: parseInt(studentId),
        invited_by: parseInt(invitedBy),
        invitation_message: message,
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return invitation;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in inviteToGroup service:', error);
    throw new HttpError(500, 'Lỗi gửi lời mời');
  }
};

const respondToInvitation = async (invitationId, data, user) => {
  try {
    const { action, message, studentId } = data;

    const invitation = await prisma.thesis_group_invitations.findUnique({
      where: { id: parseInt(invitationId) },
      include: {
        thesis_groups: true,
      },
    });

    if (!invitation) {
      throw new HttpError(404, 'Không tìm thấy lời mời');
    }

    if (invitation.invited_student_id !== parseInt(studentId)) {
      throw new HttpError(403, 'Bạn không có quyền phản hồi lời mời này');
    }

    if (invitation.status !== 'PENDING') {
      throw new HttpError(400, 'Lời mời đã được phản hồi');
    }

    if (new Date() > new Date(invitation.expires_at)) {
      throw new HttpError(400, 'Lời mời đã hết hạn');
    }

    if (action === 'ACCEPT') {
      // $transaction for accept
      await prisma.$transaction(async (tx) => {
        await tx.thesis_group_invitations.update({
          where: { id: parseInt(invitationId) },
          data: {
            status: 'ACCEPTED',
            responded_at: new Date(),
            response_message: message,
          },
        });

        await tx.thesis_group_members.create({
          data: {
            thesis_group_id: invitation.thesis_group_id,
            thesis_round_id: invitation.thesis_groups.thesis_round_id,
            student_id: parseInt(studentId),
            role: 'MEMBER',
            join_method: 'INVITED',
            is_active: true,
          },
        });

        const updatedGroup = await tx.thesis_groups.update({
          where: { id: invitation.thesis_group_id },
          data: {
            current_members: { increment: 1 },
          },
        });

        // If currentMembers >= minMembers: update status = 'READY'
        if (updatedGroup.current_members >= updatedGroup.min_members) {
          await tx.thesis_groups.update({
            where: { id: invitation.thesis_group_id },
            data: { status: 'READY' },
          });
        }
      });

      return { message: 'Đã chấp nhận lời mời' };
    } else if (action === 'REJECT') {
      await prisma.thesis_group_invitations.update({
        where: { id: parseInt(invitationId) },
        data: {
          status: 'REJECTED',
          responded_at: new Date(),
          response_message: message,
        },
      });

      return { message: 'Đã từ chối lời mời' };
    } else {
      throw new HttpError(400, 'Hành động không hợp lệ');
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in respondToInvitation service:', error);
    throw new HttpError(500, 'Lỗi phản hồi lời mời');
  }
};

const registerTopic = async (groupId, data, user) => {
  try {
    const {
      instructorId,
      proposedTopicId,
      selfProposedTitle,
      selfProposedDescription,
      selectionReason,
      leaderStudentId,
    } = data;

    // Validation: Either proposedTopicId OR selfProposedTitle must be provided, not both
    if ((!proposedTopicId && !selfProposedTitle) || (proposedTopicId && selfProposedTitle)) {
      throw new HttpError(400, 'Phải chọn đề tài có sẵn hoặc tự đề xuất, không được chọn cả hai');
    }

    const group = await prisma.thesis_groups.findUnique({
      where: { id: parseInt(groupId) },
      include: {
        thesis_group_members: {
          where: { is_active: true },
        },
        thesis_rounds: true,
      },
    });

    if (!group) {
      throw new HttpError(404, 'Không tìm thấy nhóm');
    }

    const leaderMember = group.thesis_group_members.find(
      (m) => m.student_id === parseInt(leaderStudentId) && m.role === 'LEADER'
    );

    if (!leaderMember) {
      throw new HttpError(403, 'Chỉ trưởng nhóm mới có quyền đăng ký đề tài');
    }

    if (!['READY', 'FORMING'].includes(group.status)) {
      throw new HttpError(400, 'Nhóm không ở trạng thái có thể đăng ký đề tài');
    }

    // Verify group hasn't registered a topic yet
    const existingRegistration = await prisma.topic_registrations.findUnique({
      where: {
        thesis_group_id_thesis_round_id: {
          thesis_group_id: parseInt(groupId),
          thesis_round_id: group.thesis_round_id,
        },
      },
    });

    if (existingRegistration) {
      throw new HttpError(400, 'Nhóm đã đăng ký đề tài');
    }

    // Verify current date <= round.registrationDeadline
    if (group.thesis_rounds.registration_deadline && new Date() > new Date(group.thesis_rounds.registration_deadline)) {
      throw new HttpError(400, 'Đã quá hạn đăng ký đề tài');
    }

    let topic = null;
    let appliedGroupMode = group.group_type;
    let appliedMinMembers = group.min_members;
    let appliedMaxMembers = group.max_members;

    if (proposedTopicId) {
      // Verify topic exists, isTaken = false, belongs to same round
      topic = await prisma.proposed_topics.findUnique({
        where: { id: parseInt(proposedTopicId) },
        include: { proposed_topic_rules: true },
      });

      if (!topic) {
        throw new HttpError(404, 'Không tìm thấy đề tài');
      }

      if (topic.thesis_round_id !== group.thesis_round_id) {
        throw new HttpError(400, 'Đề tài không thuộc đợt đồ án này');
      }

      if (topic.is_taken) {
        throw new HttpError(400, 'Đề tài đã được đăng ký');
      }

      // Verify topic.rule allows group's size & type
      const topicRule = topic.proposed_topic_rules;
      if (topicRule) {
        if (topicRule.group_mode === 'INDIVIDUAL_ONLY' && group.group_type !== 'INDIVIDUAL') {
          throw new HttpError(400, 'Đề tài chỉ dành cho cá nhân');
        }
        if (topicRule.group_mode === 'GROUP_ONLY' && group.group_type !== 'GROUP') {
          throw new HttpError(400, 'Đề tài chỉ dành cho nhóm');
        }
        if (group.current_members < topicRule.min_members || group.current_members > topicRule.max_members) {
          throw new HttpError(400, 'Số lượng thành viên không phù hợp với yêu cầu đề tài');
        }
        appliedGroupMode = topicRule.group_mode;
        appliedMinMembers = topicRule.min_members;
        appliedMaxMembers = topicRule.max_members;
      }

      // Verify instructorId === topic.instructorId (must match)
      if (parseInt(instructorId) !== topic.instructor_id) {
        throw new HttpError(400, 'Giảng viên không khớp với đề tài');
      }
    } else {
      // Self-proposed topic
      // Verify instructorId is assigned to round
      const assignment = await prisma.instructor_assignments.findFirst({
        where: {
          instructor_id: parseInt(instructorId),
          thesis_round_id: group.thesis_round_id,
        },
      });

      if (!assignment) {
        throw new HttpError(400, 'Giảng viên chưa được phân công cho đợt đồ án này');
      }

      // Verify instructor hasn't exceeded supervisionQuota
      if (assignment.current_load >= assignment.supervision_quota) {
        throw new HttpError(400, 'Giảng viên đã đạt số lượng hướng dẫn tối đa');
      }
    }

    // Validate applied_group_mode
    const validGroupModes = ['BOTH', 'GROUP', 'INDIVIDUAL'];
    if (!appliedGroupMode || !validGroupModes.includes(appliedGroupMode)) {
      throw new Error(`applied_group_mode là bắt buộc và phải là một trong các giá trị: ${validGroupModes.join(', ')}`);
    }

    // $transaction to create registration
    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.topic_registrations.create({
        data: {
          thesis_group_id: parseInt(groupId),
          thesis_round_id: group.thesis_round_id,
          instructor_id: parseInt(instructorId),
          proposed_topic_id: proposedTopicId ? parseInt(proposedTopicId) : null,
          self_proposed_title: selfProposedTitle || null,
          self_proposed_description: selfProposedDescription || null,
          selection_reason: selectionReason || null,
          applied_group_mode: appliedGroupMode,
          applied_min_members: appliedMinMembers,
          applied_max_members: appliedMaxMembers,
          instructor_status: 'PENDING',
          head_status: 'PENDING',
        },
      });

      if (proposedTopicId) {
        await tx.proposed_topics.update({
          where: { id: parseInt(proposedTopicId) },
          data: { is_taken: true },
        });
      }

      await tx.thesis_groups.update({
        where: { id: parseInt(groupId) },
        data: { status: 'REGISTERED' },
      });

      return registration;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in registerTopic service:', error);
    throw new HttpError(500, 'Lỗi đăng ký đề tài');
  }
};

module.exports = {
  createGroup,
  inviteToGroup,
  respondToInvitation,
  registerTopic,
};
