require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// In-memory storage for skills
let skills = [];

// Health check (only /health now — Render is happy with this)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Middleware
app.use(cors());
app.use(express.json());

// Abacus billing webhook
app.post('/api/webhook/billing', (req, res) => {
  const secret = req.headers['x-sovereign-secret'];
  if (secret !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('✅ Billing webhook received:', req.body);
  res.json({ status: 'verified', message: 'Billing event processed' });
});

// Create skill
app.post('/api/create-skill', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const skill = {
    id: Date.now(),
    name: name.trim(),
    description: (description || '').trim(),
    createdAt: new Date().toISOString()
  };
  skills.push(skill);
  res.json({ success: true, skill });
});

// Get all skills
app.get('/api/skills', (req, res) => res.json(skills));

// Serve the beautiful frontend
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sovereign Skill Hub running on port ${PORT}`);
});
