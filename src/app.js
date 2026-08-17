import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import {initDb} from './models/initDb.js';
import pool from './config/db.js';
dotenv.config();

const app = express();
initDb(); // incia la db si no existe antes

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'API de autenticación funcionando',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);

export default app;
