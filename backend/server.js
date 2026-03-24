// backend/server.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');


// Route imports (placeholders for now)
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const collegeRoutes = require('./routes/college.routes');
const userRoutes = require('./routes/users.routes');
const resumeRoutes = require('./routes/resumes.routes');
const jobRoutes = require('./routes/jobs.routes');
const applicationRoutes = require('./routes/applications.routes');
const messagingRoutes = require('./routes/messaging.routes');
const dashboardRoutes = require('./routes/dashboards.routes');
const alumniRoutes = require('./routes/alumni.routes');
const notificationRoutes = require('./routes/notifications.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
connectDB();

app.use(helmet());
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(ao => origin === ao || origin === ao.replace(/\/$/, ''));
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: Origin ${origin} not in [${allowedOrigins}]`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', require('./routes/chatbot.routes'));
app.use('/api/tpo', require('./routes/tpo.routes'));
app.use('/api/public', require('./routes/public.routes'));


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
