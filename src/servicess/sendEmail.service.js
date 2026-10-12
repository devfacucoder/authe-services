import { transporter } from "../config/mailer.config.js";
import { logger } from "../config/logger.config.js";
import dotenv from "dotenv";
dotenv.config();

import crypto from 'crypto';
import { UserModel } from "../models/user.model.js"
import { redisClient } from "../config/redis.config.js";
import RedisStore from "rate-limit-redis";
export const verifyEmail = async (emailForVeriFy) => {
    try {
        const cod = crypto.randomInt(100000, 999999).toString();
        const userForVerify = await UserModel.findByEmail(emailForVeriFy)
        if (!userForVerify) {
            throw new Error("el email no existe");
        }
        const redisKey = `verify:${emailForVeriFy}`

        await redisClient.set(redisKey, cod, { EX: 900 })
        const emailResult = await transporter.sendMail({
            from: "services auth",
            to: emailForVeriFy,
            subject: "Verifique su email",
            html: `<p>Tu código de verificación es: <strong>${cod}</strong></p>`
        })
        return emailResult.info;
    } catch (error) {
        logger.error(error)
    }


}
export const verifyCode = async (emailForVeriFy, code) => {
    try {

        const redisKey = `verify:${emailForVeriFy}`
        const savedCode = await redisClient.get(redisKey);
        const userForVerify = await UserModel.findByEmail(emailForVeriFy)

        // Si no existe, significa que pasaron más de 15 minutos o ingresó un correo inválido
        if (!savedCode) {
            throw new Error("el codigo expiro")
        }

        if (savedCode != code) {
            throw new Error("codigo incorrecto")
        }

        await UserModel.verifyUser(emailForVeriFy)
        const getUser = await UserModel.findByEmail(emailForVeriFy)



        await redisClient.del(redisKey)
        return true;
    } catch (error) {
        logger.error(error)
    }
}


export const sendUrlRecoverPassword = async (userEmail) => {
    try {
        const cod = crypto.randomInt(100000, 999999).toString();

        const userForVerify = await UserModel.findByEmail(userEmail)
        if (!userForVerify) {
            throw new Error("el email no existe");
        }
        const redisKey = `recover-password:${userEmail}`;
        await redisClient.set(redisKey, cod, { EX: 900 })
        const emailResult = await transporter.sendMail({
            from: "services auth",
            to: userEmail,
            subject: "Cambiar la contraseña",
            html: `<p>ingresa a este link para cambiar la contraseña: <strong>${`http://localhost:3000/api/auth/recover-password/${cod}`}</strong></p>`
        })
        return emailResult.messageId
    } catch (error) {
        logger.error(error)
        return null
    }
}


