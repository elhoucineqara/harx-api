import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config, validateConfig } from './config';
import { corsOptions } from './middleware/corsConfig';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

console.log('🚀 Starting HARX2 Backend Server (Minimal)...\n');

try {
  validateConfig();
  console.log('✅ Configuration validated\n');
} catch (error: any) {
  console.error('❌ Configuration validation failed');
  console.error(error.message);
  console.log('\n📝 Please set MONGODB_URI and JWT_SECRET in environment variables');
  process.exit(1);
}

const app = express();
const PORT = config.PORT;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    message: 'HARX2 Backend is running'
  });
});

app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    message: 'HARX2 Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  logger.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('❌ Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on port ${PORT}`);
  console.log(`📋 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Frontend: ${config.FRONTEND_URL}`);
  console.log(`✨ Server is ready!\n`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

export default app;
