const HttpError = require('../utils/HttpError');
const prisma = require('../config/database');

const createTopic = async (roundId, data, user) => {
  try {
    const {
      topicCode,
      topicTitle,
      topicDescription,
      objectives,
      studentRequirements,
      technologiesUsed,
      topicReferences,
      rule,
      instructorId,
    } = data;

    const round = await prisma.thesis_rounds.findUnique({
      where: { id: parseInt(roundId) },
    });

    if (!round) {
      throw new HttpError(404, 'Không tìm thấy đợt đồ án');
    }

    if (round.status !== 'Open') {
      throw new HttpError(400, 'Đợt đồ án chưa mở để nộp đề tài');
    }

    if (round.topic_proposal_deadline && new Date() > new Date(round.topic_proposal_deadline)) {
      throw new HttpError(400, 'Đã quá hạn nộp đề tài');
    }

    // Check topicCode unique within round
    const existingTopic = await prisma.proposed_topics.findFirst({
      where: {
        topic_code: topicCode,
        thesis_round_id: parseInt(roundId),
      },
    });

    if (existingTopic) {
      throw new HttpError(400, 'Mã đề tài đã tồn tại trong đợt đồ án này');
    }

    // $transaction to create topic and rule
    const result = await prisma.$transaction(async (tx) => {
      const topic = await tx.proposed_topics.create({
        data: {
          topic_code: topicCode,
          topic_title: topicTitle,
          instructor_id: parseInt(instructorId),
          thesis_round_id: parseInt(roundId),
          topic_description: topicDescription,
          objectives,
          student_requirements: studentRequirements,
          technologies_used: technologiesUsed,
          topic_references: topicReferences,
          is_taken: false,
        },
      });

      await tx.proposed_topic_rules.create({
        data: {
          proposed_topic_id: topic.id,
          group_mode: rule?.groupMode || 'BOTH',
          min_members: rule?.minMembers || 1,
          max_members: rule?.maxMembers || 4,
          reason: rule?.reason,
        },
      });

      return topic;
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error in createTopic service:', error);
    throw new HttpError(500, 'Lỗi tạo đề tài');
  }
};

const getTopics = async (roundId, filters) => {
  try {
    const { isTaken, instructorId } = filters;

    const where = {
      thesis_round_id: parseInt(roundId),
    };

    if (isTaken !== undefined) {
      where.is_taken = isTaken === 'true';
    }

    if (instructorId) {
      where.instructor_id = parseInt(instructorId);
    }

    const topics = await prisma.proposed_topics.findMany({
      where,
      include: {
        instructors: {
          include: { users: true },
        },
        proposed_topic_rules: true,
        thesis_rounds: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return topics;
  } catch (error) {
    console.error('Error in getTopics service:', error);
    throw new HttpError(500, 'Lỗi lấy danh sách đề tài');
  }
};

module.exports = {
  createTopic,
  getTopics,
};
