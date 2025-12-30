const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway auto-assigns domain, but use env var for flexibility
const ROBLOX_SECRET = process.env.ROBLOX_SECRET || 'your-super-secret-key-change-this';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Validate Roblox server origin using JobId + secret
function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  const jobId = req.body.jobId;
  
  // Must have secret header AND valid jobId format (starts with "rbx-"
  if (authToken !== ROBLOX_SECRET || !jobId || !jobId.startsWith('rbx-')) {
    return false;
  }
  return true;
}

app.post('/api/survival', async (req, res) => {
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Unauthorized - Roblox servers only' });
  }

  const { scenario, response, jobId } = req.body;

  if (!scenario || !response) {
    return res.status(400).json({ error: 'Missing scenario or response' });
  }

  const prompt = `You are a survival game narrator. Scenario: ${scenario}. Player action: ${response}.

Write 4-6 sentences continuing the story dramatically.
End with exactly one of these lines: "SURVIVED" or "DIED".
Keep it immersive, no AI mentions.`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200 }
        })
      }
    );

    const data = await apiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error generating story.';

    const survived = text.toUpperCase().includes('SURVIVED');
    const story = text.replace(/SURVIVED|DIED/gi, '').trim();

    res.json({
      story,
      survived,
      jobId
    });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Story generation failed' });
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
