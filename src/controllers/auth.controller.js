import { registerUser, login, istValidToChange, changePassword } from "../servicess/auth.service.js"
import { logger } from "../config/logger.config.js";
import { verifyEmail, verifyCode, sendUrlRecoverPassword } from "../servicess/sendEmail.service.js"
import { body } from "express-validator";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'no exist email &/or password'
      });
    }
    const newUser = await registerUser(email, password)
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser
    });
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    logger.error('Error en register controller:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'El email y la contraseña son requeridos'
      });
    }

    const result = await login(email, password);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      ...result
    });

  } catch (error) {
    logger.error({ err: error.message }, 'Error durante el proceso de login');

    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};


export const veryFyEmail = async (req, res) => {
  try {

    const { emailForVerificar } = req.body
    if (!emailForVerificar) {
      return res.status(404).json({ message: "debe enviar el correo a verificar" })
    }

    const email = await verifyEmail(emailForVerificar);

    if (!email) {
      return res.status(404).json({ message: "el email no existe" })
    }


    res.status(200).json({ message: "email enviado con exito", email })
  } catch (error) {
    res.status(500).json({ message: "error en el envio del correo" })
    logger.error(error)
  }
}
export const verifyCodeCtrl = async (req, res) => {
  try {
    const { emailForVerificar, code } = req.body
    const verify = await verifyCode(emailForVerificar, code)

    if (!verify) {
      return res.status(400).json({ message: "codigo incorrecto" })
    }
    res.status(200).json({ message: "codigo verificado", emailForVerificar })

  } catch (error) {
    res.status(500).json({ message: "error en el envio del correo" })
    logger.error(error)

  }
}



//! ENviar el correo de creacion del codigo que indica que se a empeza el cambio de contraseña
export const passwrodChangeStart = async (req, res) => {
  try {
    const { emailForChange } = req.body;
    const envio = await sendUrlRecoverPassword(emailForChange)
    if (!envio) {
      return res.status(404).json({ message: "el email no existe" })
    }

    res.status(200).json({ message: "se envio un correo a la direccion" })


  } catch (error) {
    res.status(504).json({ message: "error" })
  }
}


export const recoverPassword = async (req, res) => {
  try {
    const { userEmail, newPassword, code } = req.body;

    const pass = istValidToChange(userEmail, code)
    if (!pass) {
      return res.status(403).json({ message: "el codigo expiro o es incorrecto" })
    }
    const cambio = await changePassword(userEmail, newPassword)

    res.status(200).json({ message: "la contraseña a sido cambiada" })
  } catch (error) {
    logger.info(error)
    res.status(504).json({ message: "error" })

  }
}