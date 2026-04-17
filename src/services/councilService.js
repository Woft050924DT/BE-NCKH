const prisma = require('../config/database');

const createCouncil = async (data) => {
  const {
    council_code,
    council_name,
    thesis_round_id,
    chairman_id,
    secretary_id,
    defense_date,
    start_time,
    end_time,
    venue,
    notes,
    members,
  } = data;

  // Validate thesis round exists
  const thesisRound = await prisma.thesis_rounds.findUnique({
    where: { id: parseInt(thesis_round_id) },
  });

  if (!thesisRound) {
    throw new Error('Không tìm thấy đợt đồ án');
  }

  // Validate chairman exists
  const chairman = await prisma.instructors.findUnique({
    where: { id: parseInt(chairman_id) },
  });

  if (!chairman) {
    throw new Error('Không tìm thấy chủ tịch hội đồng');
  }

  // Validate secretary if provided
  if (secretary_id) {
    const secretary = await prisma.instructors.findUnique({
      where: { id: parseInt(secretary_id) },
    });

    if (!secretary) {
      throw new Error('Không tìm thấy thư ký hội đồng');
    }
  }

  // Create council
  const council = await prisma.defense_councils.create({
    data: {
      council_code,
      council_name,
      thesis_round_id: parseInt(thesis_round_id),
      chairman_id: parseInt(chairman_id),
      secretary_id: secretary_id ? parseInt(secretary_id) : null,
      defense_date: defense_date ? new Date(defense_date) : null,
      start_time: start_time ? new Date(`1970-01-01T${start_time}Z`) : null,
      end_time: end_time ? new Date(`1970-01-01T${end_time}Z`) : null,
      venue,
      notes,
      status: 'PREPARING',
    },
  });

  // Create council members if provided
  if (members && Array.isArray(members) && members.length > 0) {
    const memberData = members.map((member) => ({
      defense_council_id: council.id,
      instructor_id: parseInt(member.instructor_id),
      role: member.role || 'MEMBER',
      order_number: member.order_number || 1,
    }));

    await prisma.council_members.createMany({
      data: memberData,
    });
  }

  // Return council with members
  const result = await prisma.defense_councils.findUnique({
    where: { id: council.id },
    include: {
      council_members: {
        include: {
          instructors: {
            include: {
              users: true,
            },
          },
        },
      },
      instructors_defense_councils_chairman_idToinstructors: {
        include: {
          users: true,
        },
      },
      instructors_defense_councils_secretary_idToinstructors: {
        include: {
          users: true,
        },
      },
      thesis_rounds: true,
    },
  });

  return result;
};

const getCouncils = async (filters) => {
  const { thesis_round_id, status, council_code } = filters;
  const whereClause = {};

  if (thesis_round_id) {
    whereClause.thesis_round_id = parseInt(thesis_round_id);
  }

  if (status) {
    whereClause.status = status;
  }

  if (council_code) {
    whereClause.council_code = {
      contains: council_code,
      mode: 'insensitive',
    };
  }

  const councils = await prisma.defense_councils.findMany({
    where: whereClause,
    include: {
      council_members: {
        include: {
          instructors: {
            include: {
              users: true,
            },
          },
        },
      },
      instructors_defense_councils_chairman_idToinstructors: {
        include: {
          users: true,
        },
      },
      instructors_defense_councils_secretary_idToinstructors: {
        include: {
          users: true,
        },
      },
      thesis_rounds: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return councils;
};

const getCouncilById = async (id) => {
  const council = await prisma.defense_councils.findUnique({
    where: { id: parseInt(id) },
    include: {
      council_members: {
        include: {
          instructors: {
            include: {
              users: true,
            },
          },
        },
      },
      instructors_defense_councils_chairman_idToinstructors: {
        include: {
          users: true,
        },
      },
      instructors_defense_councils_secretary_idToinstructors: {
        include: {
          users: true,
        },
      },
      thesis_rounds: true,
      defense_assignments: {
        include: {
          theses: {
            include: {
              thesis_members: {
                include: {
                  students: {
                    include: {
                      users: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!council) {
    throw new Error('Không tìm thấy hội đồng');
  }

  return council;
};

const updateCouncil = async (id, data) => {
  const {
    council_name,
    secretary_id,
    defense_date,
    start_time,
    end_time,
    venue,
    notes,
    status,
  } = data;

  // Validate secretary if provided
  if (secretary_id) {
    const secretary = await prisma.instructors.findUnique({
      where: { id: parseInt(secretary_id) },
    });

    if (!secretary) {
      throw new Error('Không tìm thấy thư ký hội đồng');
    }
  }

  const council = await prisma.defense_councils.update({
    where: { id: parseInt(id) },
    data: {
      council_name,
      secretary_id: secretary_id ? parseInt(secretary_id) : null,
      defense_date: defense_date ? new Date(defense_date) : null,
      start_time: start_time ? new Date(`1970-01-01T${start_time}Z`) : null,
      end_time: end_time ? new Date(`1970-01-01T${end_time}Z`) : null,
      venue,
      notes,
      status,
    },
  });

  return council;
};

const deleteCouncil = async (id) => {
  const council = await prisma.defense_councils.delete({
    where: { id: parseInt(id) },
  });

  return council;
};

module.exports = {
  createCouncil,
  getCouncils,
  getCouncilById,
  updateCouncil,
  deleteCouncil,
};
