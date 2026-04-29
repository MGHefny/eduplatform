require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');
const { runStartupSeeds } = require('./seeds');

const app = express();

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const isProduction = process.env.NODE_ENV === 'production';

const productionOrigins = [
  'https://sustainabilityambassadorseg.com',
  'https://www.sustainabilityambassadorseg.com'
];

const developmentOrigins = ['http://localhost:3000'];

const allowedOrigins = isProduction
  ? productionOrigins
  : (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || developmentOrigins.join(','))
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', require('./routes/index'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

async function checkDatabaseConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

async function startServer() {
  try {
    await checkDatabaseConnection();
    await runStartupSeeds();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
