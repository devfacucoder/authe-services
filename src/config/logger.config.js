import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  // Nivel de logging: en dev mostramos todo desde 'debug', en prod desde 'info'
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Configuración de formato de salida
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true, // Colores en la consola
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // Formato de fecha humano
          ignore: 'pid,hostname', // Oculta datos redundantes en desarrollo
        },
      }
    : undefined, // En producción se imprime en formato JSON puro para alta velocidad

  // Redactar datos sensibles por seguridad (evita imprimir passwords o tokens por accidente)
  redact: {
    paths: [
      'password',
      'password_hash',
      'passwordHash',
      'req.headers.authorization',
      '*.password',
    ],
    censor: '[REDACTADO]',
  },
});