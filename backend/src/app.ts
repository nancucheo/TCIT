import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { requestLogger } from '@middleware/requestLogger';
import { errorHandler } from '@middleware/errorHandler';
import routes from '@routes/index';

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' } },
});

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' } },
});

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(helmet());
app.use(compression());
app.use(globalLimiter);
app.use(express.json());
app.use(requestLogger);

// Stricter rate limit for mutation endpoints
app.use('/api/v1/posts', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'DELETE') {
    return mutationLimiter(req, _res, next);
  }
  next();
});

// Routes
app.use('/api/v1', routes);

// Error handler (must be registered last)
app.use(errorHandler);

export default app;
