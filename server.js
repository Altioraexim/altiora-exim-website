const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://translate.google.com", "https://www.gstatic.com"],
      // Allow inline scripts so the small inline asset loader scripts can run (safe for this static site)
      scriptSrc: ["'self'", "'unsafe-inline'", "https://translate.google.com", "https://translate.googleapis.com", "https://translate-pa.googleapis.com", "https://cdn.emailjs.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://translate.googleapis.com", "https://translate.google.com", "https://translate-pa.googleapis.com", "https://api.emailjs.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.google.com", "https://translate.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting (apply only to API endpoints so static assets aren't blocked)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 contact form submissions per hour
  message: 'Too many contact submissions, please try again later.',
});

// Apply limiter only to API routes (images and other static assets should not hit this)
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
  credentials: true
}));

// Compression
app.use(compression());

// Rewrite requests that accidentally include an HTML filename in the path
// e.g. requests like /index.html/assets/... -> /assets/... so static files resolve
app.use((req, res, next) => {
  try {
    const match = req.path.match(/^\/[^\/]+\.html\/(.*)$/);
    if (match && match[1]) {
      req.url = '/' + match[1] + (req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '');
    }
  } catch (e) {
    // ignore and continue
  }
  next();
});

// Logging
app.use(morgan('combined'));

// Body parsing
// Explicit static mounts so localhost:3000 resolves /assets exactly like Live Server.
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve main static files from repo root (so /, /gallery.html, /certificate.html load correctly)
app.use(express.static(__dirname));
app.use(express.static(__dirname));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/api/slider-images', (req, res) => {
  const sliderPath = path.join(__dirname, 'assets', 'slider');
  fs.readdir(sliderPath, (err, files) => {
    if (err) {
      console.error('Failed to read slider folder:', err);
      return res.status(500).json({ message: 'Unable to load slider images' });
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];

    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map(file => `assets/slider/${file}`);

    res.json({ images });
  });
});

app.post('/api/contact', contactLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, message } = req.body;

  // Sanitize inputs
  const sanitizedName = name.replace(/[<>\"'&]/g, '');
  const sanitizedEmail = email.toLowerCase();
  const sanitizedMessage = message.replace(/[<>\"'&]/g, '');

  console.log('New contact request received:', {
    name: sanitizedName,
    email: sanitizedEmail,
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress
  });

  return res.json({
    message: 'Thank you! Your message has been received. We will contact you soon.'
  });
});

// Explicit routes so client-side/route fallback doesn't interfere with assets/pages.
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/gallery.html', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/certificate.html', (req, res) => res.sendFile(path.join(__dirname, 'certificate.html')));


// Safer fallback for unknown routes.
// Important: never return index.html for asset URLs; that can break image loading.
app.get('*', (req, res, next) => {
  const urlPath = req.path || req.originalUrl || '';
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(urlPath);

  // If it looks like a static file request (images/css/js/etc.), return 404.
  if (hasFileExtension) {
    return res.status(404).end();
  }

  // Otherwise serve the main page.
  return res.sendFile(path.join(__dirname, 'index.html'));
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Altiora Exim website server running securely at http://localhost:${PORT}`);
  console.log(`🔒 Security features enabled: Helmet, Rate Limiting, CORS, Input Validation`);
});
