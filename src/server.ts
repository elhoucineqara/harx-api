import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dbConnect from './lib/dbConnect';
import { config, validateConfig } from './config';
import { corsOptions } from './middleware/corsConfig';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

console.log('🚀 Starting HARX2 Backend Server...\n');

try {
  validateConfig();
  console.log('✅ Configuration validated\n');
} catch (error: any) {
  console.error('❌ Configuration validation failed');
  console.error(error.message);
  console.log('\n📝 Please create a .env file based on .env.example');
  process.exit(1);
}

const app = express();
const PORT = config.PORT;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection - attempt to connect but don't crash if it fails
// Routes will handle connection errors individually
dbConnect()
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((error) => {
    console.error('⚠️ MongoDB connection failed:', error.message);
    console.error('⚠️ Server will continue running, but database operations will fail.');
    console.error('⚠️ Please check your MongoDB connection and restart the server.');
    // Don't exit - let the server run so we can see other errors
    // process.exit(1);
  });

// API Routes
import activitiesRoutes from './routes/activities';
import addressRoutes from './routes/address';
import agentsRoutes from './routes/agents';
import aiRoutes from './routes/ai';
import aiMessagesRoutes from './routes/ai-messages';
import authRoutes from './routes/authRoutes';
import callsRoutes from './routes/calls';
import companiesRoutes from './routes/companies';
import countriesRoutes from './routes/countries';
import currenciesRoutes from './routes/currencies';
import cvRoutes from './routes/cvRoutes';
import dashboardRoutes from './routes/dashboard';
import documentsRoutes from './routes/documents';
import fileProcessingRoutes from './routes/file-processing';
import filesRoutes from './routes/files';
import gigsRoutes from './routes/gigs';
import googleRoutes from './routes/google';
import healthRoutes from './routes/health';
import industriesRoutes from './routes/industries';
import languagesRoutes from './routes/languages';
import leadsRoutes from './routes/leads';
import matchesRoutes from './routes/matches';
import matchingRoutes from './routes/matching';
import onboardingRoutes from './routes/onboarding';
import openaiRoutes from './routes/openai';
import phoneNumbersRoutes from './routes/phone-numbers';
import profilesRoutes from './routes/profiles';
import requirementGroupsRoutes from './routes/requirement-groups';
import requirementsRoutes from './routes/requirements';
import sectorsRoutes from './routes/sectors';
import skillsRoutes from './routes/skillRoutes';
import timezonesRoutes from './routes/timezones';
import userRoutes from './routes/userRoutes';
import zohoRoutes from './routes/zoho';
import knowledgeBaseDocumentsRoutes from './routes/knowledge-base-documents';
import callRecordingRoutes from './routes/callRecordingRoutes';
import scriptRoutes from './routes/scriptRoutes';
import ragRoutes from './routes/ragRoutes';
import gigAgentRoutes from './routes/gigAgentRoutes';
// Dashboard routes
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import integrationsRoutes from './routes/integrations';
import speechToTextRoutes from './routes/speech-to-text';
import vertexRoutes from './routes/vertex';

app.use('/api/activities', activitiesRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-messages', aiMessagesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/currencies', currenciesRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/file-processing', fileProcessingRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/industries', industriesRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/phone-numbers', phoneNumbersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/requirement-groups', requirementGroupsRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/sectors', sectorsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/timezones', timezonesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zoho', zohoRoutes);
app.use('/api/knowledge-base/documents', knowledgeBaseDocumentsRoutes);
app.use('/api/call-recordings', callRecordingRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/gig-agents', gigAgentRoutes);
// Dashboard routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/speechToText', speechToTextRoutes);
app.use('/api/vertex', vertexRoutes);

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

// Import Zoho schedulers
(async () => {
  try {
    const { startZohoTokenScheduler } = await import('./schedulers/zohoTokenScheduler');
    const { startZohoLeadsScheduler } = await import('./schedulers/zohoLeadsScheduler');

    startZohoTokenScheduler();
    startZohoLeadsScheduler();
    console.log('✅ Zoho schedulers started');
  } catch (error: any) {
    console.warn('⚠️  Could not start Zoho schedulers:', error?.message || 'Unknown error');
  }
})();

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${config.NODE_ENV}`);
  console.log(`📊 MongoDB: ${config.MONGODB_URI.includes('localhost') ? 'Local' : 'Remote'}`);
  console.log(`🌐 Frontend: ${config.FRONTEND_URL}`);
  console.log(`✨ Server is ready to accept requests!\n`);
});

export default app;
