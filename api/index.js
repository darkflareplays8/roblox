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

// ✅ FIXED: Studio + Live servers
function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  const jobId = req.body.jobId;
  
  const validJobId = !jobId || jobId === 'rbx-studio-test' || jobId.startsWith('rbx-');
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
  console.log('Body:', req.body);
  
  if (!isValidRobloxRequest(req)) {
    console.log('❌ AUTH FAILED');
    return res.status(403).json({ error: 'Roblox servers only' });
  }

  const { scenario, response } = req.body;
  console.log('Valid request - scenario:', scenario, 'response:', response);
  
  if (!scenario || !response) {
    return res.status(400).json({ error: 'Missing scenario/response' });
  }

  const prompt = `Survival game narrator. Scenario: ${scenario}. Player action: ${response}.

Continue story in 4-6 dramatic sentences. End with EXACTLY ONE LINE: "SURVIVED" or "DIED". Immersive only, no AI mentions.`;

  console.log('Calling Gemini...');
  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );

    const data = await apiRes.json();
    console.log('Gemini raw response:', JSON.stringify(data).substring(0, 200));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // ✅ FIXED: Better story parsing
    const upperText = text.toUpperCase();
    const survived = upperText.includes('SURVIVED');
    let story = text;
    
    // Clean up outcome markers
    story = story.replace(/\*\*(.*?)\*\*/g, '$1');  // Remove bold
    story = story.replace(/SURVIVED|DIED/gi, '').trim();
    
    // Ensure story has content
    if (story.length < 10) {
      story = `The ${scenario.toLowerCase()} unfolds dramatically as you attempt "${response}". Your fate hangs in the balance...`;
    }

    console.log('✅ Story generated:', { 
      survived, 
      storyPreview: story.substring(0, 50) + '...',
      storyLength: story.length 
    });
    
    res.json({ story, survived });
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    res.status(500).json({ 
      story: 'AI service temporarily unavailable. Try again!',
      survived: false 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    geminiKey: !!GEMINI_API_KEY,
    robloxSecret: !!ROBLOX_SECRET
  });
});

module.exports = app;
