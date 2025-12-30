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

console.log('🎥 CINEMATIC SURVIVAL SERVER LIVE');
console.log('Keys:', !!ROBLOX_SECRET, !!GEMINI_API_KEY);

function isValidRobloxRequest(req) {
  const authToken = req.headers['x-roblox-secret'];
  return authToken === ROBLOX_SECRET;
}

app.post('/survival', async (req, res) => {
  console.log('📨', req.body.generateScenario ? 'SCENARIO' : 'STORY');
  
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Roblox only' });
  }

  const { scenario, response, generateScenario } = req.body;

  if (generateScenario) {
    // 🎬 AI SCENARIO GENERATOR
    const scenarioPrompt = `Generate ONE 10-15 word cinematic survival scenario:
"Zombies swarm abandoned hospital corridors at midnight"
"Volcano's 400°C ash cloud engulfs fleeing city"
"Sharks circle blood trail from sinking luxury yacht"
"Cave collapse traps you with rising flood waters"
"Alien mothership silently beams up skyscrapers"

Return ONLY scenario text:`;

    try {
      const data = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: scenarioPrompt }] }],
            generationConfig: { maxOutputTokens: 60, temperature: 0.85 }
          })
        }
      ).then(r => r.json());

      let scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      scenarioText = scenarioText.replace(/["\n\r]/g, '').substring(0, 85);
      
      if (scenarioText.length < 8) {
        const fallbacks = [
          "Zombies overrun hospital during midnight blackout",
          "Volcano buries city under glowing ash flows",
          "Sharks hunt sinking yacht survivors in blood sea", 
          "Cave floods rapidly after ceiling collapse",
          "Alien beams silently harvest city population"
        ];
        scenarioText = fallbacks[Math.floor(Math.random() * 5)];
      }
      
      console.log('🎬 Scenario:', scenarioText);
      res.json({ scenario: scenarioText });
      
    } catch {
      res.json({ scenario: "Zombies swarm hospital corridors during blackout" });
    }

  } else {
    // 🎥 IMMERSIVE CINEMATIC STORY
    const sensoryBoosts = {
      zombie: "moonlight glints off exposed bone, groans echo through corridors, floor sticky with fluids",
      volcano: "400°C air shimmers violently, rocks glow orange-red, sulfur scorches every breath",
      virus: "fluorescent lights buzz overhead, monitors flatline rhythmically, air tastes of chemicals",
      shark: "saltwater stings eyes, blood clouds bloom crimson, dorsal fins slice dark waves",
      cave: "water drips endlessly, pebbles crunch underfoot, darkness presses like physical weight",
      alien: "hum vibrates bones, sky pulses unnatural green, metallic tang fills mouth"
    };

    let sensoryBoost = '';
    const scenarioLower = scenario.toLowerCase();
    for (const [key, boost] of Object.entries(sensoryBoosts)) {
      if (scenarioLower.includes(key)) {
        sensoryBoost = boost;
        break;
      }
    }

    const prompt = `Cinematic survival masterwork - 5 sentences of TOTAL IMMERSION:

ATMOSPHERE: ${sensoryBoost}

SCENARIO: ${scenario}
ACTION: "${response}"

2nd person. Every sense ALIVE:
- Heartbeat pounds chest
- Sweat drips into eyes  
- Adrenaline sharpens vision
- Chain reactions from your action
End EXACTLY: "**SURVIVED**" or "**DIED**"

EXAMPLE:
Heartbeat thunders as groans fill corridor ahead. Moonlight catches rotting fingers clawing barricade. Fork clashes bone - they stumble but surge. Every breath tastes decay but you hold ground. **SURVIVED**`;

    try {
      const data = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              maxOutputTokens: 300, 
              temperature: 0.75,
              topP: 0.92 
            }
          })
        }
      ).then(r => r.json());

      let fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const survived = fullText.toUpperCase().includes('SURVIVED');
      
      // Clean story text
      let story = fullText.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();
      story = story.replace(/\n\s*\n/g, '\n');  // Clean extra newlines
      
      // QUALITY GUARANTEE
      if (story.length < 120) {
        const survivedRand = Math.random() > 0.48;
        const qualityStories = survivedRand ? [
          `Heartbeat slams chest as danger closes in relentlessly. Every sense sharpens - sweat stings eyes, breath burns lungs. Your desperate action triggers chain reaction of chaos. Against impossible odds, you snatch survival from jaws of death. Adrenaline surges through trembling limbs.`,
          `World narrows to survival instinct alone. Sensory overload - sounds deafening, smells overwhelming, touch electric. Split-second decision cascades through environment dramatically. Fate balances on knife-edge moment. You live - barely.`
        ] : [
          `Every sense screams danger as situation spirals. Action creates unstoppable chain reaction against you. Timing betrays at critical instant. World closes in suffocatingly. Survival denied in final heartbeat.`,
          `Adrenaline peaks but proves insufficient. Environmental cascade overwhelms calculated strategy. Sensory details sharpen final moments cruelly. One irreversible misstep seals destiny. Darkness claims another victim.`
        ];
        story = qualityStories[Math.floor(Math.random() * 2)];
      }

      console.log('🎥 CINEMATIC:', { survived, length: story.length });
      res.json({ story, survived });
      
    } catch (error) {
      console.error('Fallback story:', error.message);
      const survived = Math.random() > 0.5;
      res.json({ 
        story: survived ? 
          `Every sense alive, you execute perfect survival dance. Danger brushes past - heartbeat slows. You live.` :
          `Senses overload as world collapses inward. Survival slips through desperate fingers. End.`,
        survived 
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: '🎥 CINEMATIC LIVE', 
    gemini: !!GEMINI_API_KEY,
    stories: 'immersive',
    scenarios: 'dynamic'
  });
});

module.exports = app;
