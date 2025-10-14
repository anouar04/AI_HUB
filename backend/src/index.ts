import express from 'express';
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
import notificationsRoutes from './routes/notifications';

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
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/identifiers', identifierRoutes);
app.use('/api/knowledge-files', knowledgeFileRoutes);
app.use('/api/notifications', notificationsRoutes);

// Webhook Routes
app.use('/webhook-test/twilio-webhook', twilioWebhookRoutes);


app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});