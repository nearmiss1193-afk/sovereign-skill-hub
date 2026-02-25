require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Storage
let skills = [];
let billingEvents = [];

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(cors());
app.use(express.json());

// Abacus webhook - saves events
app.post('/api/webhook/billing', (req, res) => {
  const secret = req.headers['x-sovereign-secret'];
  if (secret !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const event = { id: Date.now(), ...req.body, receivedAt: new Date().toISOString() };
  billingEvents.unshift(event);
  console.log('✅ Billing event saved:', event);
  res.json({ status: 'verified', message: 'Billing event processed' });
});

app.get('/api/billing-events', (req, res) => res.json(billingEvents));

// Skill routes
app.post('/api/create-skill', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const skill = { id: Date.now(), name: name.trim(), description: (description || '').trim(), createdAt: new Date().toISOString() };
  skills.push(skill);
  res.json({ success: true, skill });
});
app.get('/api/skills', (req, res) => res.json(skills));

// Dashboard stats
app.get('/api/stats', (req, res) => res.json({
  totalSkills: skills.length,
  totalBillingEvents: billingEvents.length,
  latestEvent: billingEvents[0] || null
}));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sovereign Skill Hub running on port ${PORT}`);
});