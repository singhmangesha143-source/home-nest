require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// ── Startup env validation ──────────────────────────────────────────────────
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET === 'predictnest_jwt_secret_key_change_in_production') {
  console.warn('[WARN] JWT_SECRET is using default value. Change it before deploying to production!');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const landlordRoutes = require('./routes/landlordRoutes');

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Body parsing (1mb cap to prevent large payload attacks) ─────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // strict: max 20 login/register attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', globalLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);
app.use('/api', landlordRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Predictnest API is running', status: 'ok' });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Don't leak internal error details in production
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Predictnest server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
