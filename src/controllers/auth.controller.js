import { registerUser, login } from "../servicess/auth.service.js"
import { logger } from "../config/logger.config.js";
import { verifyEmail, verifyCode} from "../servicess/sendEmail.service.js"

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
    const { emailForVerificar,code } = req.body
    const verify = await verifyCode(emailForVerificar,code)

    if(!verify){
      return res.status(400).json({ message: "codigo incorrecto" })
    }
    res.status(200).json({ message: "codigo verificado", emailForVerificar })

  } catch (error) {
    res.status(500).json({ message: "error en el envio del correo" })
    logger.error(error)

  }
}
