/**
 * AltaySec Jailbreak CTF Lab — Express Server
 */

const express = require('express');
const cors    = require('cors');
const apiRouter = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Rate Limiter (brute-force koruması) ───────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60 * 1000; // 1 dakika
const RATE_MAX       = 30;         // 1 dakikada en fazla 30 istek

function rateLimit(req, res, next) {
  const ip  = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(ip, entry);

  if (entry.count > RATE_MAX) {
    return res.status(429).json({ error: 'Çok fazla istek. Lütfen bekleyin.' });
  }
  next();
}

// ─── CORS — yalnızca kendi origin'imize izin ver ──────────────────────────
const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:80',
  'https://labs.altaysec.com.tr'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Aynı sunucu üzerindeki istekler (origin yok) veya izin verilenler
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: İzin verilmeyen kaynak'));
    }
  }
};

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // 2mb'den 10kb'ye düşürüldü
app.use(rateLimit);

// ─── Request logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   AltaySec LLM Jailbreak Lab v1.0    ║
  ║   Backend API → http://0.0.0.0:${PORT}  ║
  ╚═══════════════════════════════════════╝
  `);
});
