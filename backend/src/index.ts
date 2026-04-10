import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import logger from '@infrastructure/logger';
import { requestLogger } from '@middleware/requestLogger';
import { errorHandler } from '@middleware/errorHandler';
import routes from '@routes/index';

const app = express();
const PORT = process.env.PORT ?? 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/v1', routes);

// Error handler (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server started');
});

export default app;
