import { CorsOptions } from 'cors';
import { config } from '../config';

const getAllowedOrigins = (): string[] => {
  const frontendUrl = config.FRONTEND_URL;
  const origins = frontendUrl
    ? frontendUrl.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:5173','https://harxv26front.netlify.app'];

  return origins;
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      return callback(null, true);
    }

    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
};
