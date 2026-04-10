import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from '@middleware/requestLogger';
import { errorHandler } from '@middleware/errorHandler';
import routes from '@routes/index';

const app = express();
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

export default app;
