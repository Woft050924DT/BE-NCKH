const HttpError = require('../utils/HttpError');
const prisma = require('../config/database');

const getInstructorRegistrations = async (user, filters) => {
  try {
    const { status, roundId, instructorId } = filters;

    const where = {};

    if (instructorId) {
      where.instructor_id = parseInt(instructorId);
    }

    if (status) {
      where.instructor_status = status;
    }

    if (roundId) {
      where.thesis_round_id = parseInt(roundId);
    }

    const registrations = await prisma.topic_registrations.findMany({
      where,
      include: {
        thesis_groups: {
          include: {
            thesis_group_members: {
              where: { is_active: true },
              include: {
                students: {
                  include: { users: true },
                },
              },
            },
          },
        },
        proposed_topics: true,
        instructors: {
          include: { users: true },
        },
      },
      orderBy: { registration_date: 'desc' },
    });

    return registrations;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in getInstructorRegistrations service:', error);
    throw new HttpError(500, 'Lỗi lấy danh sách đăng ký');
  }
};

const instructorReview = async (registrationId, data, user) => {
  try {
    const { action, rejectionReason, instructorId } = data;

    const registration = await prisma.topic_registrations.findUnique({
      where: { id: parseInt(registrationId) },
      include: {
        thesis_groups: true,
        thesis_rounds: true,
      },
    });

    if (!registration) {
      throw new HttpError(404, 'Không tìm thấy đăng ký');
    }

    if (registration.instructor_status !== 'PENDING') {
      throw new HttpError(400, 'Đăng ký đã được phê duyệt hoặc từ chối');
    }

    if (action === 'APPROVE') {
      // $transaction for approve
      await prisma.$transaction(async (tx) => {
        await tx.topic_registrations.update({
          where: { id: parseInt(registrationId) },
          data: {
            instructor_status: 'APPROVED',
            instructor_approval_date: new Date(),
          },
        });

        await tx.instructor_assignments.update({
          where: {
            thesis_round_id_instructor_id: {
              thesis_round_id: registration.thesis_round_id,
              instructor_id: parseInt(instructorId),
            },
          },
          data: {
            current_load: { increment: 1 },
          },
        });
      });

      return { message: 'Đã phê duyệt đăng ký' };
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        throw new HttpError(400, 'Phải cung cấp lý do từ chối');
      }

      await prisma.$transaction(async (tx) => {
        await tx.topic_registrations.update({
          where: { id: parseInt(registrationId) },
          data: {
            instructor_status: 'REJECTED',
            instructor_rejection_reason: rejectionReason,
          },
        });

        if (registration.proposed_topic_id) {
          await tx.proposed_topics.update({
            where: { id: registration.proposed_topic_id },
            data: { is_taken: false },
          });
        }

        await tx.thesis_groups.update({
          where: { id: registration.thesis_group_id },
          data: { status: 'READY' },
        });

        await tx.instructor_assignments.update({
          where: {
            thesis_round_id_instructor_id: {
              thesis_round_id: registration.thesis_round_id,
              instructor_id: parseInt(instructorId),
            },
          },
          data: {
            current_load: { decrement: 1 },
          },
        });
      });

      return { message: 'Đã từ chối đăng ký' };
    } else {
      throw new HttpError(400, 'Hành động không hợp lệ');
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in instructorReview service:', error);
    throw new HttpError(500, 'Lỗi phản hồi đăng ký');
  }
};

const getHeadRegistrations = async (user, filters) => {
  try {
    const { roundId, instructorStatus, headStatus, departmentId } = filters;

    const where = {};

    if (roundId) {
      where.thesis_round_id = parseInt(roundId);
    }

    if (instructorStatus) {
      where.instructor_status = instructorStatus;
    }

    if (headStatus) {
      where.head_status = headStatus;
    }

    const registrations = await prisma.topic_registrations.findMany({
      where,
      include: {
        thesis_groups: {
          include: {
            thesis_group_members: {
              where: { is_active: true },
              include: {
                students: {
                  include: { users: true },
                },
              },
            },
          },
        },
        proposed_topics: true,
        instructors: {
          include: { users: true },
        },
        thesis_rounds: {
          include: {
            departments: true,
          },
        },
      },
      orderBy: { registration_date: 'desc' },
    });

    // Filter by department if provided
    if (departmentId) {
      return registrations.filter(
        (r) => r.thesis_rounds.department_id === parseInt(departmentId)
      );
    }

    return registrations;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in getHeadRegistrations service:', error);
    throw new HttpError(500, 'Lỗi lấy danh sách đăng ký');
  }
};

const headReview = async (registrationId, data, user) => {
  try {
    const { action, rejectionReason, overrideGroupMode, overrideMinMembers, overrideMaxMembers, overrideReason } = data;

    // Verify registration
    const registration = await prisma.topic_registrations.findUnique({
      where: { id: parseInt(registrationId) },
      include: {
        thesis_groups: {
          include: {
            thesis_group_members: {
              where: { is_active: true },
            },
          },
        },
        thesis_rounds: {
          include: {
            departments: true,
          },
        },
        proposed_topics: true,
      },
    });

    if (!registration) {
      throw new HttpError(404, 'Không tìm thấy đăng ký');
    }

    // Pre-conditions
    if (registration.instructor_status !== 'APPROVED') {
      throw new HttpError(400, 'Giảng viên chưa phê duyệt đăng ký này');
    }

    if (registration.head_status !== 'PENDING') {
      throw new HttpError(400, 'Đăng ký đã được phê duyệt hoặc từ chối bởi trưởng bộ môn');
    }

    // Verify round.departmentId === head's department
    const instructor = await prisma.instructors.findUnique({
      where: { id: user.instructorId },
    });

    if (!instructor || instructor.department_id !== registration.thesis_rounds.department_id) {
      throw new HttpError(403, 'Bạn không có quyền phê duyệt đăng ký của bộ môn khác');
    }

    if (action === 'APPROVE') {
      const topicTitle = registration.proposed_topic?.topic_title || registration.self_proposed_title;
      const topicDescription = registration.proposed_topic?.topic_description || registration.self_proposed_description;
      const objectives = registration.proposed_topic?.objectives;
      const technologiesUsed = registration.proposed_topic?.technologies_used;

      // Generate thesis code
      const year = new Date().getFullYear();
      const round = await prisma.thesis_rounds.findUnique({
        where: { id: registration.thesis_round_id },
      });
      const thesisCode = `LV-${year}-${round?.round_code}-${registration.thesis_groups.group_code}`;

      // Get active members
      const activeMembers = await prisma.thesis_group_members.findMany({
        where: {
          thesis_group_id: registration.thesis_group_id,
          is_active: true,
        },
      });

      // $transaction for approve
      await prisma.$transaction(async (tx) => {
        await tx.topic_registrations.update({
          where: { id: parseInt(registrationId) },
          data: {
            head_status: 'APPROVED',
            head_approval_date: new Date(),
          },
        });

        await tx.thesis_groups.update({
          where: { id: registration.thesis_group_id },
          data: { status: 'APPROVED' },
        });

        const thesis = await tx.theses.create({
          data: {
            thesis_code: thesisCode,
            topic_title: topicTitle || '',
            thesis_group_id: registration.thesis_group_id,
            thesis_round_id: registration.thesis_round_id,
            supervisor_id: registration.instructor_id,
            topic_registration_id: parseInt(registrationId),
            topic_description: topicDescription,
            objectives,
            technologies_used: technologiesUsed,
            start_date: registration.thesis_rounds.start_date,
            end_date: registration.thesis_rounds.end_date,
            status: 'IN_PROGRESS',
          },
        });

        // Create thesis_members for each active group member
        await tx.thesis_member.createMany({
          data: activeMembers.map((m) => ({
            thesis_id: thesis.id,
            student_id: m.student_id,
            role: m.role,
          })),
        });

        await tx.thesis_groups.update({
          where: { id: registration.thesis_group_id },
          data: {
            status: 'LOCKED',
            locked_at: new Date(),
          },
        });

        await tx.status_history.create({
          data: {
            table_name: 'topic_registrations',
            record_id: parseInt(registrationId),
            old_status: 'PENDING',
            new_status: 'APPROVED',
            changed_by_id: user.id,
            change_reason: 'Trưởng bộ môn phê duyệt',
          },
        });
      });

      return { message: 'Đã phê duyệt đăng ký và tạo đồ án' };
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        throw new HttpError(400, 'Phải cung cấp lý do từ chối');
      }

      await prisma.$transaction(async (tx) => {
        await tx.topic_registrations.update({
          where: { id: parseInt(registrationId) },
          data: {
            head_status: 'REJECTED',
            head_rejection_reason: rejectionReason,
          },
        });

        if (registration.proposed_topic_id) {
          await tx.proposed_topics.update({
            where: { id: registration.proposed_topic_id },
            data: { is_taken: false },
          });
        }

        await tx.thesis_groups.update({
          where: { id: registration.thesis_group_id },
          data: { status: 'READY' },
        });

        await tx.instructor_assignments.update({
          where: {
            thesis_round_id_instructor_id: {
              thesis_round_id: registration.thesis_round_id,
              instructor_id: registration.instructor_id,
            },
          },
          data: {
            current_load: { decrement: 1 },
          },
        });

        await tx.status_history.create({
          data: {
            table_name: 'topic_registrations',
            record_id: parseInt(registrationId),
            old_status: 'PENDING',
            new_status: 'REJECTED',
            changed_by_id: user.id,
            change_reason: rejectionReason,
          },
        });
      });

      return { message: 'Đã từ chối đăng ký' };
    } else if (action === 'OVERRIDE') {
      if (!overrideReason) {
        throw new HttpError(400, 'Phải cung cấp lý do override');
      }

      await prisma.topic_registrations.update({
        where: { id: parseInt(registrationId) },
        data: {
          head_status: 'OVERRIDDEN',
          head_override_group_mode: overrideGroupMode,
          head_override_min_members: overrideMinMembers,
          head_override_max_members: overrideMaxMembers,
          head_override_reason: overrideReason,
        },
      });

      // Then re-run APPROVE flow
      return headReview(registrationId, { action: 'APPROVE' }, user);
    } else {
      throw new HttpError(400, 'Hành động không hợp lệ');
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in headReview service:', error);
    throw new HttpError(500, 'Lỗi phản hồi đăng ký');
  }
};

module.exports = {
  getInstructorRegistrations,
  instructorReview,
  getHeadRegistrations,
  headReview,
};
