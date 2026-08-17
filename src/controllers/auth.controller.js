import { registerUser, login } from "../servicess/auth.service.js"
import { logger } from "../config/logger.config.js";


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