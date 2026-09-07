// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');

// اگر Bonto یا Docker از ریشه پروژه اجرا کند، این باعث می‌شود backend/.env هم خوانده شود
dotenv.config({ path: path.resolve(__dirname, '.env') });

// اگر متغیرها از پنل Bonto / Docker env آمده باشند، همین‌ها استفاده می‌شوند
dotenv.config();

const app = express();
const prisma = new PrismaClient();

const APP_VERSION = 'poll-enabled-v6-pi-browser-guard';

// اگر پشت reverse-proxy یا Bonto proxy هستی
app.set('trust proxy', 1);

// -------------------------
// Pi Browser Guard Config
// -------------------------

const REQUIRED_PI_BROWSER_DOMAIN = 'nightdotpi.github.io';
const REQUIRED_PI_BROWSER_APP_URL = `https://${REQUIRED_PI_BROWSER_DOMAIN}`;

const PI_BROWSER_DEEP_LINK = `pi://browser?url=${encodeURIComponent(
  REQUIRED_PI_BROWSER_APP_URL
)}`;

function isPiBrowserRequest(req) {
  const userAgent = req.headers['user-agent'] || '';

  return /PiBrowser|Pi Browser|MinePi/i.test(userAgent);
}

function getRequestSourceHost(req) {
  const origin = req.headers.origin;
  const referer = req.headers.referer || req.headers.referrer;

  try {
    if (origin) {
      return new URL(origin).hostname;
    }

    if (referer) {
      return new URL(referer).hostname;
    }
  } catch {
    return null;
  }

  return req.hostname || null;
}

function isFromRequiredGithubDomain(req) {
  const sourceHost = getRequestSourceHost(req);

  return sourceHost === REQUIRED_PI_BROWSER_DOMAIN;
}

function sendPiBrowserGuide(req, res) {
  const accept = req.headers.accept || '';
  const wantsHtml = accept.includes('text/html');

  if (!wantsHtml || req.path.startsWith('/api')) {
    return res.status(426).json({
      success: false,
      code: 'PI_BROWSER_REQUIRED',
      message: 'Please open this app inside Pi Browser.',
      messageFa: 'لطفاً این برنامه را داخل Pi Browser باز کنید.',
      appUrl: REQUIRED_PI_BROWSER_APP_URL,
      piBrowserDeepLink: PI_BROWSER_DEEP_LINK,
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  }

  return res.status(426).send(`
<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Open in Pi Browser</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #111827;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .box {
      max-width: 520px;
      background: #1f2937;
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0,0,0,.35);
    }
    h1 {
      margin-top: 0;
      font-size: 24px;
    }
    p {
      line-height: 1.8;
      color: #d1d5db;
    }
    a {
      display: block;
      margin-top: 14px;
      padding: 14px 18px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: bold;
    }
    .primary {
      background: #fbbf24;
      color: #111827;
    }
    .secondary {
      background: #374151;
      color: #fff;
    }
    .note {
      margin-top: 16px;
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>To continue, open the app in Pi Browser.</h1>

    <p>
      This app is built for Pi Network and must be opened inside
      <strong>Pi Browser</strong>
      to use Pi login, payments, and Pi features.
    </p>

    <a class="primary" href="${PI_BROWSER_DEEP_LINK}">
      Open in Pi Browser
    </a>

    <a class="secondary" href="${REQUIRED_PI_BROWSER_APP_URL}">
      Open the app address
    </a>

    <p class="note">
      If the button does not open Pi Browser, please open Pi Browser manually and open this app from there.
    </p>
  </div>
</body>
</html>
  `);
}

function requirePiBrowserForGithubDomain(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (!isFromRequiredGithubDomain(req)) {
    return next();
  }

  if (isPiBrowserRequest(req)) {
    return next();
  }

  return sendPiBrowserGuide(req, res);
}

// -------------------------
// Security & Parsers
// -------------------------

app.use(helmet());

app.use(express.json({ limit: '1mb' }));

// لاگ سبک برای اینکه در Bonto ببینی دقیقاً چه routeهایی صدا زده می‌شوند
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// -------------------------
// CORS
// -------------------------

const defaultAllowedOrigins = [
  'https://nightdotpi.github.io',
  'https://nightez2278.pinet.com',
  'https://night.bonto.run',
  'https://sandbox.minepi.com',
  'https://minepi.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins,
    ...envAllowedOrigins,
    process.env.FRONTEND_URL,
  ].filter(Boolean))
);

console.log('✅ Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // اجازه به درخواست‌های بدون origin مثل Postman، health check، curl
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`⚠️ CORS blocked origin: ${origin}`);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// -------------------------
// Pi Browser Check Route
// -------------------------

app.get('/api/pi-browser-check', (req, res) => {
  const sourceHost = getRequestSourceHost(req);
  const isRequiredDomain = sourceHost === REQUIRED_PI_BROWSER_DOMAIN;
  const isPiBrowser = isPiBrowserRequest(req);

  return res.status(200).json({
    success: true,
    requiredDomain: REQUIRED_PI_BROWSER_DOMAIN,
    sourceHost,
    isRequiredDomain,
    isPiBrowser,
    mustOpenInPiBrowser: isRequiredDomain && !isPiBrowser,
    appUrl: REQUIRED_PI_BROWSER_APP_URL,
    piBrowserDeepLink: PI_BROWSER_DEEP_LINK,
    message:
      isRequiredDomain && !isPiBrowser
        ? 'Please open this app inside Pi Browser.'
        : 'OK',
    messageFa:
      isRequiredDomain && !isPiBrowser
        ? 'لطفاً برنامه را داخل Pi Browser باز کنید.'
        : 'OK',
    version: APP_VERSION,
    time: new Date().toISOString(),
  });
});

// این middleware بعد از CORS و بعد از check route قرار می‌گیرد
// تا درخواست‌های API از دامنه GitHub خارج از Pi Browser محدود شوند.
app.use(requirePiBrowserForGithubDomain);

// -------------------------
// Routes
// -------------------------

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);

// مسیر اصلی پرداخت‌های پروژه
app.use('/api/payment', paymentRoutes);

// Alias برای فرانت‌اندی که /api/pi/approve و /api/pi/complete صدا می‌زند
app.use('/api/pi', paymentRoutes);

// Alias برای حالت /api/payments
app.use('/api/payments', paymentRoutes);

// Admin routes اگر وجود داشته باشد
try {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.warn('⚠️ Admin routes not loaded:', error.message);
}

// -------------------------
// Root Check
// -------------------------

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Night backend is running',
    version: APP_VERSION,
    api: process.env.PUBLIC_API_URL || null,
    appUrl: REQUIRED_PI_BROWSER_APP_URL,
    piBrowserDeepLink: PI_BROWSER_DEEP_LINK,
    time: new Date().toISOString(),
  });
});

// -------------------------
// Health Checks
// -------------------------

const healthHandler = (req, res) => {
  return res.status(200).json({
    status: 'OK',
    success: true,
    message: req.originalUrl.startsWith('/api')
      ? 'API is running'
      : 'Server is running',
    service: 'Night Backend',
    version: APP_VERSION,
    time: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// -------------------------
// Database Health Check
// -------------------------

const dbHealthHandler = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Server is connected to PostgreSQL via Prisma',
      database: 'PostgreSQL',
      orm: 'Prisma',
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Database Connection Error:', error);

    return res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Database connection failed.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  }
};

// هر دو مسیر فعال هستند
app.get('/db-health', dbHealthHandler);
app.get('/api/db-health', dbHealthHandler);

// -------------------------
// Debug Env Check
// -------------------------

const envCheckHandler = (req, res) => {
  return res.status(200).json({
    success: true,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    PUBLIC_API_URL: process.env.PUBLIC_API_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

    HAS_PI_API_KEY: Boolean(process.env.PI_API_KEY),
    HAS_JWT_SECRET: Boolean(process.env.JWT_SECRET),
    HAS_DATABASE_URL: Boolean(process.env.DATABASE_URL),
    HAS_ADMIN_SECRET_KEY: Boolean(process.env.ADMIN_SECRET_KEY),

    PI_REQUIRE_ACCESS_TOKEN: process.env.PI_REQUIRE_ACCESS_TOKEN || null,

    allowedOrigins,
    requiredPiBrowserDomain: REQUIRED_PI_BROWSER_DOMAIN,
    piBrowserAppUrl: REQUIRED_PI_BROWSER_APP_URL,
    piBrowserDeepLink: PI_BROWSER_DEEP_LINK,
    version: APP_VERSION,
    time: new Date().toISOString(),
  });
};

app.get('/env-check', envCheckHandler);
app.get('/api/env-check', envCheckHandler);

// -------------------------
// 404 Handler
// -------------------------

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    version: APP_VERSION,
    time: new Date().toISOString(),
  });
});

// -------------------------
// Global Error Handler
// -------------------------

app.use((err, req, res, next) => {
  console.error('⚠️ Unhandled Error:', err.stack || err);

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server!',
    version: APP_VERSION,
    time: new Date().toISOString(),
  });
});

// -------------------------
// Start Server
// -------------------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  const publicApiUrl =
    process.env.PUBLIC_API_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${PORT}`;

  console.log('==========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Public API URL: ${publicApiUrl}/api`);
  console.log(`🧩 Version: ${APP_VERSION}`);
  console.log('✅ Routes:');
  console.log('   - GET  /');
  console.log('   - GET  /health');
  console.log('   - GET  /api/health');
  console.log('   - GET  /db-health');
  console.log('   - GET  /api/db-health');
  console.log('   - GET  /env-check');
  console.log('   - GET  /api/env-check');
  console.log('   - GET  /api/pi-browser-check');
  console.log('   - POST /api/auth/pi-login');
  console.log('   - GET  /api/auth/me');
  console.log('   - POST /api/pi/approve');
  console.log('   - POST /api/pi/complete');
  console.log('   - POST /api/payment/approve');
  console.log('   - POST /api/payment/complete');
  console.log('==========================================');
});

// -------------------------
// Graceful Shutdown
// -------------------------

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Stopping server...`);

  try {
    await prisma.$disconnect();

    server.close(() => {
      console.log('Server closed and Prisma disconnected.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Force shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  } catch (error) {
    console.error('❌ Shutdown Error:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
