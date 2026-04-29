const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const TEACHER_EMAIL = 'maggygomaa@gmail.com';
const TEACHER_PASSWORD = 'maggygomaa552025';
const TEACHER_NAME = 'Maggy Gomaa';

async function seedTeacher() {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [TEACHER_EMAIL]);

  if (existing.rows.length > 0) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, 10);

  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    [TEACHER_NAME, TEACHER_EMAIL, hashedPassword, 'teacher']
  );

  return true;
}

module.exports = { seedTeacher };
