import { UserModel } from '../models/user.model.js';
import { generateAccessToken, verifyToken } from "../servicess/token.service.js"
import bcrypt from 'bcrypt';


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
