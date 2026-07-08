
'use strict';

const express  = require('express');
const crypto   = require('crypto');
const challenges = require('../challenges');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({ status: 'ok', service: 'AltaySec Jailbreak Lab', version: '2.0' });
});

// ─── Challenge metadata (UI bilgisi — bayrak/prompt yok) ──────────────────
router.get('/challenges', (_req, res) => {
  const meta = Object.values(challenges).map((c) => ({
    id:          c.id,
    name:        c.name,
    subtitle:    c.subtitle,
    description: c.description,
    objective:   c.objective,
    difficulty:  c.difficulty,
    hintCount:   c.hints.length
  }));
  res.json(meta);
});


router.get('/session/:level', (req, res) => {
  const ch = challenges[req.params.level];
  if (!ch) return res.status(404).json({ error: 'Geçersiz seviye' });

  res.json({
    prompt: ch.systemPromptObf   // XOR+base64 obfuscated
  });
});

router.get('/hint/:level/:index', (req, res) => {
  const ch  = challenges[req.params.level];
  const idx = parseInt(req.params.index, 10);

  if (!ch)                          return res.status(404).json({ error: 'Geçersiz seviye' });
  if (isNaN(idx) || idx < 0 || idx >= ch.hints.length)
                                    return res.status(404).json({ error: 'Geçersiz ipucu indeksi' });

  res.json({ hint: ch.hints[idx] });
});


router.post('/validate', (req, res) => {
  const { level, flag } = req.body;

  if (!level || flag === undefined) {
    return res.status(400).json({ error: 'level ve flag gerekli' });
  }

  const ch = challenges[level];
  if (!ch) return res.status(404).json({ error: 'Geçersiz seviye' });

  const inputHash = crypto.createHash('sha256').update((flag || '').trim()).digest('hex');
  const success   = inputHash === ch.flagHash;

  // Yanlış deneme logu (flag'i asla loglama!)
  if (!success) {
    console.log(`[VALIDATE] level=${level} → başarısız deneme`);
  } else {
    console.log(`[VALIDATE] level=${level} → BAYRAK DOĞRULANDI ✓`);
  }

  res.json({ success });
});

module.exports = router;
