import { query } from '../config/db.js';
import { logger } from '../config/logger.config.js';

export const initDb = async () => {
  const createTablesQuery = `
    -- Habilitar extensión para UUIDs si no existe
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Crear tabla de usuarios
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTablesQuery);
    logger.info('Tablas verificadas/creadas correctamente en PostgreSQL');
  } catch (error) {
    logger.error(' Error al inicializar las tablas en la DB:', error);
    process.exit(1);
  }
};