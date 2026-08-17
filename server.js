import app from './src/app.js';

const PORT = process.env.PORT || 3000;
import { logger } from './src/config/logger.config.js';


app.listen(PORT, () => {
  logger.info(`Server open to port: ${PORT} http://localhost:${PORT}`)
});
