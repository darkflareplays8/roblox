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

console.log('Server starting...');
console.log('ROBLOX_SECRET set:', !!ROBLOX_SECRET);
console.log('GEMINI_API_KEY set:', !!GEMINI_API_KEY);

// ✅ FIXED: Accept Studio (empty jobId) + Live servers
function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  const jobId = req.body.jobId;
  
  // Studio = empty jobId, Live = rbx-xxx
  const validJobId = !jobId || jobId === 'rbx-test-job' || jobId.startsWith('rbx-');
  
  const isValid = authToken === ROBLOX_SECRET && validJobId;
  
  console.log('Auth check:', {
    authToken: authToken ? 'PRESENT' : 'MISSING',
    matchesSecret: authToken === ROBLOX_SECRET,
    jobId,
    validJobId,
    isValid
  });
  
  return isValid;
}

app.post('/survival', async (req, res) => {
  console.log('POST /survival received');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  if (!isValidRobloxRequest(req)) {
    console.log('❌ AUTH FAILED');
    return res.status(403).json({ error: 'Roblox servers only (check secret)' });
  }

  const { scenario, response } = req.body;
  console.log('Valid request - scenario:', scenario, 'response:', response);
  
  if (!scenario || !response) {
    console.log('❌ Missing scenario/response');
    return res.status(400).json({ error: 'Missing scenario/response' });
  }

  const prompt = `Survival game narrator. Scenario: ${scenario}. Player action: ${response}.

Continue story in 4-6 dramatic sentences. End with EXACTLY: "SURVIVED" or "DIED". Immersive only, no AI mentions.`;

  console.log('Calling Gemini...');
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

    console.log('Gemini status:', apiRes.status);
    const data = await apiRes.json();
    console.log('Gemini response:', data);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Story generation failed.';
    const survived = text.toUpperCase().includes('SURVIVED');
    const story = text.replace(/SURVIVED|DIED/gi, '').trim();

    console.log('✅ Story generated:', { survived, storyLength: story.length });
    
    res.json({ story, survived });
  } catch (error) {
    console.error('❌ Gemini error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

app.get('/health', (req, res) => {
  console.log('Health check OK');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
