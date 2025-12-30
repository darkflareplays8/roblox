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

console.log('🤖 AI Survival Server starting...');
console.log('ROBLOX_SECRET:', !!ROBLOX_SECRET);
console.log('GEMINI_API_KEY:', !!GEMINI_API_KEY);

function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  const isValid = authToken === ROBLOX_SECRET;
  console.log('🔐 Auth:', isValid ? 'PASS' : 'FAIL');
  return isValid;
}

app.post('/survival', async (req, res) => {
  console.log('📨 Request:', req.body);
  
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Roblox servers only' });
  }

  const { scenario, response, generateScenario } = req.body;

  if (generateScenario) {
    // 🎲 AI GENERATE SCENARIO
    const scenarioPrompt = `Generate ONE dramatic 12-word survival scenario. Examples:
"Zombies overrun hospital during midnight blackout"
"Volcano buries city under 400°C ash flows" 
"Sharks circle blood-filled sinking yacht wreck"
"Trapped in collapsing cave with rising flood"
"Alien mothership beams up city blocks"

Return ONLY the scenario text:`;

    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: scenarioPrompt }] }],
            generationConfig: { maxOutputTokens: 60, temperature: 0.9 }
          })
        }
      );

      const data = await apiRes.json();
      let scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      // Clean scenario
      scenarioText = scenarioText.replace(/["\n\r]/g, '').substring(0, 80);
      
      if (scenarioText.length < 10) {
        const fallbacks = [
          "Zombie horde attacks hospital during blackout",
          "Volcano eruption buries city in ash flows", 
          "Sharks circle sinking yacht in blood sea",
          "Trapped in collapsing cave flood rising",
          "Alien invasion beams up city skyscrapers"
        ];
        scenarioText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
      
      console.log('🎲 Scenario:', scenarioText);
      res.json({ scenario: scenarioText });
      
    } catch (error) {
      console.log('❌ Scenario fallback');
      const fallbacks = ["Zombie outbreak hospital", "Volcano city ash", "Shark yacht sinking"];
      res.json({ scenario: fallbacks[Math.floor(Math.random() * 3)] });
    }

  } else {
    // 📖 AI GENERATE EPIC STORY
    const prompt = `Expert survival game narrator - 5 dramatic sentences:

SCENARIO: ${scenario}
PLAYER: "${response}"

2nd person perspective. Sensory details, tension, consequences. 
End EXACTLY: "**SURVIVED**" or "**DIED**"

EXAMPLE:
Ash chokes your lungs as 400°C pyroclastic flow roars closer. 
You sprint for ocean but ground splits beneath. 
Lava catches your legs in molten grip. 
Screaming, you collapse into fiery death. 
**DIED**`;

    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              maxOutputTokens: 280, 
              temperature: 0.7,
              topP: 0.9 
            }
          })
        }
      );

      const data = await apiRes.json();
      let fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const survived = fullText.toUpperCase().includes('SURVIVED');
      let story = fullText.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();
      
      // GUARANTEE minimum story quality
      if (story.length < 100 || !story.includes('.') || story.includes('failed')) {
        const survived50 = Math.random() > 0.45;
        const fallbackStories = survived50 ? [
          `Heart pounding, you execute your desperate plan perfectly. Danger surrounds but your instincts prevail. Every close call tests your limits. Against all odds, you survive this round. Adrenaline surges - you're alive.`,
          `Your survival instincts kick into overdrive. Split-second decisions save your life repeatedly. The environment fights back viciously. You emerge battered but breathing. Victory snatched from catastrophe's jaws.`
        ] : [
          `Despite your clever strategy, disaster proves overwhelming. Timing betrays you at critical moment. One fatal error cascades into tragedy. Nature's fury consumes everything. Survival slips through your fingers.`,
          `You fight valiantly but the odds overwhelm. Environmental hazards compound relentlessly. Every escape route closes simultaneously. In the end, survival proves impossible. The apocalypse claims another victim.`
        ];
        story = fallbackStories[Math.floor(Math.random() * 2)];
      }

      console.log('📖 EPIC STORY:', { survived, length: story.length });
      res.json({ story, survived });
      
    } catch (error) {
      console.error('❌ Story fallback:', error.message);
      const survived = Math.random() > 0.5;
      res.json({ 
        story: survived ? 
          "Your survival instincts prove superior. Danger avoided through sheer willpower. You live to fight another day." :
          "Despite best efforts, catastrophe overwhelms. Survival denied by overwhelming forces.",
        survived 
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'LIVE', 
    stories: true, 
    scenarios: true,
    gemini: !!GEMINI_API_KEY 
  });
});

module.exports = app;
