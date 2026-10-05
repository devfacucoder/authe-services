import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.config.js';

// Limitador estricto para rutas sensibles como /login y /register
export const authRateLimiter = rateLimit({

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rate_limit:auth:', // Prefijo de las claves en Redis
  }),

  windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
  max: 5, // Máximo 5 intentos por IP dentro de los 15 minutos

  // Respuesta cuando se excede el límite
  message: {
    error: 'Demasiados intentos de inicio de sesión desde esta IP. Por favor, reintente en 15 minutos.',
  },
  
  statusCode: 429, // HTTP status 429 Too Many Requests
  standardHeaders: true, // Devuelve headers estándar (RateLimit-Limit, RateLimit-Remaining)
  legacyHeaders: false, // Desactiva los headers antiguos (X-RateLimit-*)
});