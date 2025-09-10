import express, { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './db';
import clientRoutes from './routes/clients';
import appointmentRoutes from './routes/appointments';
import conversationRoutes from './routes/conversations';
import aiConfigRoutes from './routes/aiConfig';
import channelRoutes from './routes/channels';
import identifierRoutes from './routes/identifiers';
import knowledgeFileRoutes from './routes/knowledgeFiles';
import twilioWebhookRoutes from './routes/twilioWebhook';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
// Twilio sends webhook data as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


// Serve uploaded files
// Fix: Resolve path from current working directory to avoid issues with __dirname not being defined in some environments.
app.use('/uploads', express.static(path.resolve('uploads')));

// API Routes
app.use('/api/clients', clientRoutes as Router);
app.use('/api/appointments', appointmentRoutes as Router);
app.use('/api/conversations', conversationRoutes as Router);
app.use('/api/ai-config', aiConfigRoutes as Router);
app.use('/api/channels', channelRoutes as Router);
app.use('/api/identifiers', identifierRoutes as Router);
app.use('/api/knowledge-files', knowledgeFileRoutes as Router);

// Webhook Routes
// Fix: Explicitly cast router to express.Router to resolve type conflicts.
app.use('/webhook-test/twilio-webhook', twilioWebhookRoutes as Router);


app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});