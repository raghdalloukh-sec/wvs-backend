import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use('/api', routes);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);

  return app;
}
