<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sovereign Skill Hub</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; margin:0; padding:0; }
    .hero { min-height: 100vh; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 3rem; }
    .card { background: #1a1a1a; border-radius: 16px; padding: 30px; margin-bottom: 30px; }
    input, textarea, button { width: 100%; padding: 14px; margin: 10px 0; border-radius: 8px; border: none; }
    button { background: #00ff88; color: #000; font-weight: bold; cursor: pointer; font-size: 1.1rem; }
    .log { max-height: 400px; overflow-y: auto; }
    .event { background: #222; padding: 15px; border-radius: 8px; margin-bottom: 10px; font-size: 0.95rem; }
    .status { color: #00ff88; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>Sovereign Skill Hub</h1>
      <p>Build powerful AI agents & skills in minutes. Earn while others use them.</p>

      <!-- Skill Creator -->
      <div class="card">
        <h2>Try it live — Create a skill</h2>
        <input type="text" id="name" placeholder="Skill name (e.g. Crypto Trader)">
        <textarea id="desc" rows="2" placeholder="What does it do?..."></textarea>
        <button onclick="createSkill()">Create Skill & Test</button>
        <div id="result" class="status"></div>
      </div>

      <!-- Skills List -->
      <div class="card">
        <div>Skills Created: <span id="count">0</span></div>
        <div id="skillsList"></div>
      </div>

      <!-- Live Billing Log (new!) -->
      <div class="card">
        <h2>Recent Billing Events (from Abacus)</h2>
        <div id="billingLog" class="log"></div>
      </div>
    </div>
  </div>

  <script>
    async function createSkill() {
      const name = document.getElementById('name').value.trim();
      const desc = document.getElementById('desc').value.trim();
      if (!name) return alert('Enter a skill name');

      const res = await fetch('/api/create-skill', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, description: desc})
      });
      const data = await res.json();
      document.getElementById('result').innerHTML = `✅ ${data.skill.name} created!`;
      document.getElementById('name').value = '';
      document.getElementById('desc').value = '';
      loadSkills();
    }

    async function loadSkills() {
      const res = await fetch('/api/skills');
      const skills = await res.json();
      document.getElementById('count').textContent = skills.length;
      // (simple list for now)
    }

    async function loadBillingLog() {
      const res = await fetch('/api/billing-events');
      const events = await res.json();
      const div = document.getElementById('billingLog');
      div.innerHTML = events.length === 0 
        ? '<p style="opacity:0.6">No billing events yet. Waiting for Abacus...</p>'
        : events.map(e => `
          <div class="event">
            <strong>${new Date(e.receivedAt).toLocaleTimeString()}</strong><br>
            Client: ${e.client_id || e.clientId || 'Unknown'}<br>
            ${e.result ? 'Forecast complete • ROI ' + (e.result.roi_percentage || '?') + '%' : 'Billing event received'}
          </div>
        `).join('');
    }

    window.onload = () => {
      loadSkills();
      loadBillingLog();
      setInterval(loadBillingLog, 5000); // refresh every 5 seconds
    };
  </script>
</body>
</html>
