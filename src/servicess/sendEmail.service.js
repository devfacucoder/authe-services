import { transporter } from "../config/mailer.config.js";
import { logger } from "../config/logger.config.js";
import dotenv from "dotenv";
dotenv.config();

import crypto from 'crypto';
import { UserModel } from "../models/user.model.js"
import { redisClient } from "../config/redis.config.js";
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
        logger.info(savedCode)
        logger.info(code)
        // Si no existe, significa que pasaron más de 15 minutos o ingresó un correo inválido
        if (!savedCode) {
            throw new Error("el codigo expiro")
        }

        if (savedCode != code) {
            throw new Error("codigo incorrecto")
        }

        await UserModel.verifyUser(emailForVeriFy)
        const getUser = await UserModel.findByEmail(emailForVeriFy)
        logger.info(getUser)


        await redisClient.del(redisKey)
        return true;
    } catch (error) {
        logger.error(error)
    }
}
