import { body, validationResult } from 'express-validator';

// Reglas de validación para el Registro/Login
export const validateRegister = [
  // Validar Email
  body('email')
    .trim()
    .isEmail().withMessage('El formato del email no es válido')
    .normalizeEmail(),

  // Validar Contraseña fuerte
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial'),

  // Middleware que revisa si hubo errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
      });
    }
    next();
  }
];