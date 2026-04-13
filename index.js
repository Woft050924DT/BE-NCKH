require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');
const prisma = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const thesisRoundRoutes = require('./src/routes/thesisRoundRoutes');
const topicRegistrationRoutes = require('./src/routes/topicRegistrationRoutes');
const thesisGroupRoutes = require('./src/routes/thesisGroupRoutes');
const gradingRoutes = require('./src/routes/gradingRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const defenseRoutes = require('./src/routes/defenseRoutes');
const instructorRoutes = require('./src/routes/instructorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin/thesis-rounds', thesisRoundRoutes);
app.use('/api/topic-registrations', topicRegistrationRoutes);
app.use('/api/thesis-groups', thesisGroupRoutes);
app.use('/api', gradingRoutes);
app.use('/api', reportRoutes);
app.use('/api', defenseRoutes);
app.use('/api/instructors', instructorRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API quản lý đồ án',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      thesisRounds: '/api/admin/thesis-rounds',
      topicRegistrations: '/api/topic-registrations',
      thesisGroups: '/api/thesis-groups',
      grading: '/api/review-assignments, /api/weekly-reports',
      reports: '/api/thesis-tasks, /api/weekly-reports',
      defense: '/api/defense-councils, /api/defense-assignments',
    },
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('Đã kết nối thành công đến database');
  } catch (error) {
    console.error('Lỗi kết nối database:', error);
  }
});
