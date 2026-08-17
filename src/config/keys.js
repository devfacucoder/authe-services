import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper para obtener __dirname en proyectos con módulos ES (import/export)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leemos las claves de la carpeta /keys que creaste
export const PRIVATE_KEY = fs.readFileSync(
    path.join(__dirname, '../../keys/private.pem'),
    'utf8'
);

export const PUBLIC_KEY = fs.readFileSync(
    path.join(__dirname, '../../keys/public.pem'),
    'utf8'
);