import jwt from 'jsonwebtoken';
import { PRIVATE_KEY, PUBLIC_KEY } from "../config/keys.js";



export const generateAccessToken = (payload) => {
    return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '50m' });
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
        return decoded;
    }
    catch (error) {
        throw new Error('Token inválido');
    }
}