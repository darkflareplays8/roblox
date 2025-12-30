const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ROBLOX_SECRET = process.env.ROBLOX_SECRET || 'mySuperSecretKey123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  return authToken === ROBLOX_SECRET;
}

app.post('/survival', async (req, res) => {
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { scenario, response, generateScenario } = req.body;

  if (generateScenario) {
    // AI SCENARIO
    const scenarioPrompt = `Generate ONE dramatic 12-word survival scenario. Examples:
- "Zombie horde attacks hospital at midnight"
- "Volcano erupts burying city in 400°C ash"
- "Sharks circle sinking yacht in blood-red sea"
Return ONLY scenario text, no explanations.`;
    
    try {
      const data = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: scenarioPrompt }] }],
            generationConfig: { maxOutputTokens: 50, temperature: 0.8 }
          })
        }
      ).then(r => r.json());
      
      const scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Zombie outbreak in abandoned hospital";
      res.json({ scenario: scenarioText });
    } catch {
      res.json({ scenario: "Volcanic eruption engulfs city in ash and lava" });
    }
  } else {
    // AI STORY
    const prompt = `Expert survival narrator writing 5 cinematic sentences:

SCENARIO: ${scenario}
ACTION: "${response}"

2nd person, sensory details, tension building. End EXACTLY:
**SURVIVED** or **DIED** on new line.`;

    try {
      const data = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
          })
        }
      ).then(r => r.json());
      
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const survived = text.toUpperCase().includes('SURVIVED');
      text = text.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();
      
      res.json({ story: text || 'Your fate unfolds dramatically...', survived });
    } catch {
      res.json({ 
        story: `In the ${scenario.toLowerCase()}, your "${response}" leads to a dramatic conclusion.`,
        survived: false 
      });
    }
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

module.exports = app;
