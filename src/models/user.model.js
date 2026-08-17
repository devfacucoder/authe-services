import { query } from '../config/db.js';

export const UserModel = {
    async create({ email, passwordHash, role = 'user' }) {
        const text = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at;
    `;
        const values = [email, passwordHash, role];
        const { rows } = await query(text, values);
        return rows[0];
    },
    async findByEmail(email) {
        const text = `
      SELECT id, email, password_hash, role, created_at 
      FROM users 
      WHERE email = $1;
    `;
        const { rows } = await query(text, [email]);
        return rows[0]; 
    },
    async findById(id) {
        const text = `
      SELECT id, email, role, created_at 
      FROM users 
      WHERE id = $1;
    `;
        const { rows } = await query(text, [id]);
        return rows[0];
    }

}

