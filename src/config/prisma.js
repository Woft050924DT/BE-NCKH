const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:dt2711@localhost:5432/PMstudentsProject',
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

module.exports = prisma;
