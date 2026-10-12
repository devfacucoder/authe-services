import { UserModel } from '../models/user.model.js';
import { generateAccessToken, verifyToken } from "../servicess/token.service.js"
import bcrypt from 'bcrypt';
import { logger } from '../config/logger.config.js';
import { redisClient } from "../config/redis.config.js";

export const registerUser = async (email, password) => {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await UserModel.create({
        email,
        passwordHash
    });

    return newUser;
};

export const login = async (email, password) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateAccessToken(tokenPayload)
    return {
        token: accessToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    };
}

export const istValidToChange = async (userEmail, code) => {
    try {
        const redisKey = `recover-password:${userEmail}`;
        const codeDB = await redisClient.get(redisKey)
        if (codeDB != code) {
            throw new Error("codigo diferente")
        }
        return true
    } catch (error) {
        logger.error(error)
        return false
    }
}
export const changePassword = async (userEmail, newPassword) => {
    try {
        const saltRounds = 10;

        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        const cambio = await UserModel.changePassword(userEmail, passwordHash)
        logger.info(cambio)

        return cambio

    } catch (error) {
        logger.error(error)

    }
}

