import pg from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger.config.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'auth_service',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  logger.info('connect to PostgreSQL succesfully');
});

pool.on('error', (err) => {
  logger.error('error inespered in pool postgresql', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
