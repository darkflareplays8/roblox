import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ROBLOX_SECRET = process.env.ROBLOX_SECRET || 'mySuperSecretKey123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  const jobId = req.body.jobId;
  return authToken === ROBLOX_SECRET && jobId && jobId.startsWith('rbx-');
}

app.post('/survival', async (req, res) => {
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Roblox servers only' });
  }

  const { scenario, response } = req.body;
  if (!scenario || !response) {
    return res.status(400).json({ error: 'Missing scenario/response' });
  }

  const prompt = `Survival game narrator. Scenario: ${scenario}. Player action: ${response}.

Continue story in 4-6 dramatic sentences. End with EXACTLY: "SURVIVED" or "DIED". Immersive only.`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 250 }
        })
      }
    );

    const data = await apiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Story failed.';
    
    const survived = text.toUpperCase().includes('SURVIVED');
    const story = text.replace(/SURVIVED|DIED/gi, '').trim();

    res.json({ story, survived });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'AI service down' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on port ${port}`));

export default app;
