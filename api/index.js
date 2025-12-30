const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ROBLOX_SECRET = process.env.ROBLOX_SECRET || 'mySuperSecretKey123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function isValidRobloxRequest(req) {
  return req.headers['x-roblox-secret'] === ROBLOX_SECRET;
}

app.post('/survival', async (req, res) => {
  if (!isValidRobloxRequest(req)) {
    return res.status(403).json({ error: 'Roblox servers only' });
  }

  const { scenario, response, generateScenario } = req.body;

  if (generateScenario) {
    // 🎬 25+ DIVERSE SCENARIO EXAMPLES - NO REPEATS
    const scenarioPrompt = `Generate ONE dramatic 12-word survival scenario. NEW ideas only. Examples:
"Zombies swarm abandoned hospital corridors at midnight"
"Volcano's 400°C ash cloud engulfs fleeing city"
"Sharks circle blood trail from sinking luxury yacht"
"Cave collapse traps you with rising flood waters"
"Alien mothership silently beams up skyscrapers"
"Tsunami wave towers 100ft over coastal city"
"Polar bears stalk Arctic research station in blizzard"
"Toxic gas cloud spreads from chemical plant explosion"
"Mutant insects swarm after nuclear reactor meltdown"
"Quicksand pulls you under jungle temple ruins"
"Flash flood sweeps through narrow slot canyon"
"Rogue AI locks down skyscraper, floors collapsing"
"Electrical storm ignites forest fire encircling camp"
"Earthquake splits highway bridge mid-traffic"
"Piranha frenzy attacks after dam breaks upstream"
"Mountain avalanche buries ski lodge under snow"
"Bioengineered plague turns neighbors into monsters"
"Space station oxygen leak, hull breaches everywhere"
"Glacier calf creates tsunami in remote fjord"
"Underground bunker floods from ruptured pipes"
"Swarm locusts strip crops, starving refugees riot"
"Meteor shower ignites city-wide inferno"
"AI nanobots disassemble buildings from inside out"
"Super volcano ash blocks sun, crops fail instantly"
"Ghost ship crew awakens during midnight fog"

Return ONLY scenario text:`;

    try {
      const data = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: scenarioPrompt }] }],
            generationConfig: { maxOutputTokens: 70, temperature: 0.9 }
          })
        }
      ).then(r => r.json());

      let scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      scenarioText = scenarioText.replace(/["\n\r]/g, '').substring(0, 90);
      
      // 25+ FALLBACKS - completely different from examples
      if (scenarioText.length < 8 || scenarioPrompt.includes(scenarioText)) {
        const diverseFallbacks = [
          "Rogue AI drones hunt survivors in deserted city",
          "Mutant wolves pack circles mountain cabin blizzard",
          "Tornado rips apart trailer park at midnight",
          "Radioactive storm cloud sweeps across wasteland",
          "Killer robots patrol flooded subway tunnels",
          "Sabertooth tigers roam thawed permafrost plains",
          "Acid rain melts through collapsing skyscraper",
          "Giant spiders weave webs across highway overpass",
          "Rogue submarine torpedoes oil rig platform",
          "Cryogenic lab breach unleashes frozen horrors",
          "Hypercane 500mph winds shred coastal fortress",
          "Nanobot plague turns metal structures to dust",
          "Rift opens spawning shadow creatures everywhere",
          "Bioluminescent jellyfish swarm blocks safe harbor",
          "Rogue satellite debris rains fire on earth",
          "Parasitic vines overrun abandoned shopping mall",
          "Electromagnetic pulse fries all electronics instantly",
          "Crystal caves collapse releasing toxic spores",
          "Time rift spawns prehistoric predators downtown",
          "Swarm hornets size of fists attack village",
          "Geothermal vent erupts boiling mud tsunami",
          "Shadow clones mimic you perfectly in mirror maze",
          "Antimatter leak destabilizes entire city block",
          "Psychic storm drives population violently insane",
          "Dimensional tear sucks buildings into void"
        ];
        scenarioText = diverseFallbacks[Math.floor(Math.random() * diverseFallbacks.length)];
      }
      
      res.json({ scenario: scenarioText });
      
    } catch {
      const emergencyFallbacks = ["Rogue AI drones hunt city", "Mutant wolves blizzard", "Tornado trailer park"];
      res.json({ scenario: emergencyFallbacks[Math.floor(Math.random() * 3)] });
    }

  } else {
    // IMMERSIVE STORY - 60% SURVIVAL (unchanged)
    const sensoryBoosts = {
      zombie: "moonlight glints off exposed bone, groans echo through corridors, floor sticky with fluids",
      volcano: "400°C air shimmers violently, rocks glow orange-red, sulfur scorches every breath",
      virus: "fluorescent lights buzz overhead, monitors flatline rhythmically, air tastes of chemicals",
      shark: "saltwater stings eyes, blood clouds bloom crimson, dorsal fins slice dark waves",
      cave: "water drips endlessly, pebbles crunch underfoot, darkness presses like physical weight",
      alien: "hum vibrates bones, sky pulses unnatural green, metallic tang fills mouth",
      drone: "red laser sights sweep darkness, rotors whir overhead, metal footsteps echo",
      wolf: "ice crystals form on breath, pawprints circle camp, eyes glow in dark"
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

2nd person. Every sense ALIVE. Balanced survival odds.
End EXACTLY: "**SURVIVED**" or "**DIED**"`;

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
      
      // 60% SURVIVAL RATE
      let survived;
      if (fullText.toUpperCase().includes('SURVIVED')) {
        survived = true;
      } else {
        survived = Math.random() < 0.6;
      }
      
      let story = fullText.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();
      story = story.replace(/\n\s*\n/g, '\n');
      
      if (story.length < 120 || !story.includes('.')) {
        const survivedRand = Math.random() < 0.6;
        const qualityStories = survivedRand ? [
          `Heartbeat slams chest but steadies as your plan unfolds perfectly. Every sense sharpens - sweat evaporates, breath clears, vision laser-focused. Your desperate action triggers perfect chain reaction of safety. Against impossible odds, you triumph gloriously. Adrenaline surges through victorious limbs.`,
          `World becomes crystal clear through survival instinct. Sensory symphony - sounds sharpen, smells guide, touch reveals paths. Split-second brilliance cascades perfectly through environment. Fate rewards your genius decisively. You live triumphantly.`
        ] : [
          `Every sense screams danger as situation spirals rapidly. Action creates unstoppable chain reaction against you. Timing betrays at critical instant. World closes in suffocatingly. Survival denied in final heartbeat.`
        ];
        story = qualityStories[Math.floor(Math.random() * qualityStories.length)];
      }

      res.json({ story, survived });
      
    } catch (error) {
      const survived = Math.random() < 0.6;
      res.json({ 
        story: survived ? 
          `Every sense alive, you execute perfect survival dance. Danger brushes past - heartbeat slows to victory. You live triumphantly.` :
          `Senses overload as world collapses inward. Survival slips through desperate fingers.`,
        survived 
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: '🎥 CINEMATIC LIVE (60% SURVIVAL + 50 Scenarios)', 
    gemini: !!GEMINI_API_KEY
  });
});

module.exports = app;
