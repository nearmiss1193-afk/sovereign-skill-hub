require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Load data from JSON files (or start empty)
const DATA_DIR = './data';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

let skills = [];
let billingEvents = [];

const skillsFile = `${DATA_DIR}/skills.json`;
const billingFile = `${DATA_DIR}/billing.json`;

if (fs.existsSync(skillsFile)) skills = JSON.parse(fs.readFileSync(skillsFile));
if (fs.existsSync(billingFile)) billingEvents = JSON.parse(fs.readFileSync(billingFile));

// Save helper
const saveData = () => {
  fs.writeFileSync(skillsFile, JSON.stringify(skills, null, 2));
  fs.writeFileSync(billingFile, JSON.stringify(billingEvents, null, 2));
};

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(cors());
app.use(express.json());

// Abacus webhook - saves permanently
app.post('/api/webhook/billing', (req, res) => {
  const secret = req.headers['x-sovereign-secret'];
  if (secret !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const event = { id: Date.now(), ...req.body, receivedAt: new Date().toISOString() };
  billingEvents.unshift(event);
  saveData();
  console.log('✅ Billing event SAVED permanently:', event);
  res.json({ status: 'verified', message: 'Billing event processed' });
});

app.get('/api/billing-events', (req, res) => res.json(billingEvents));

// Create skill - saves permanently
app.post('/api/create-skill', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const skill = { id: Date.now(), name: name.trim(), description: (description || '').trim(), createdAt: new Date().toISOString() };
  skills.push(skill);
  saveData();
  res.json({ success: true, skill });
});

app.get('/api/skills', (req, res) => res.json(skills));

// Serve dashboard
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sovereign Skill Hub running on port ${PORT} (persistent mode)`);
});