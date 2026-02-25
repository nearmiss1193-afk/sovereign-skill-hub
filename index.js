require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// In-memory storage for skills (resets on restart - fine for demo)
let skills = [];

// ────── INSTANT HEALTH CHECKS ──────
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('OK'));

// ────── MIDDLEWARE ──────
app.use(cors());
app.use(express.json());

// ────── ABACUS WEBHOOK (unchanged) ──────
app.post('/api/webhook/billing', (req, res) => {
  const secret = req.headers['x-sovereign-secret'];
  if (secret !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('✅ Billing webhook received:', req.body);
  res.status(200).json({ status: 'verified', message: 'Billing event processed' });
});

// ────── CREATE SKILL (now actually saves) ──────
app.post('/api/create-skill', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const skill = {
    id: Date.now(),
    name,
    description: description || '',
    createdAt: new Date().toISOString()
  };
  skills.push(skill);
  res.json({ success: true, skill });
});

// ────── GET ALL SKILLS ──────
app.get('/api/skills', (req, res) => {
  res.json(skills);
});

// ────── SERVE LANDING PAGE ──────
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sovereign Skill Hub live on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   Skills: http://localhost:${PORT}/api/skills`);
});ere
  res.status(200).json({ status: 'verified', message: 'Billing event processed' });
});

// ────── SIMPLE SKILL / AGENT MAKER API ──────
app.post('/api/create-skill', (req, res) => {
  const { name, description } = req.body;
  // Fake DB for now — replace with real DB later
  const skill = {
    id: Date.now(),
    name,
    description,
    createdAt: new Date().toISOString()
  };
  res.json({ success: true, skill });
});

// ────── SERVE BEAUTIFUL LANDING PAGE + APP ──────
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ────── START SERVER IMMEDIATELY ──────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sovereign Skill Hub live on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/`);
  console.log(`   Webhook:     /api/webhook/billing`);
});

// ────── BACKGROUND INIT (DB, Stripe, etc.) ──────
setTimeout(async () => {
  console.log('🌟 Running background initialization...');
  // Put Stripe, DB connect, skill seeding, etc. here
  console.log('✅ All systems ready for users');
}, 200);
