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

console.log('🤖 AI To Survive! Server starting...');
console.log('ROBLOX_SECRET:', !!ROBLOX_SECRET);
console.log('GEMINI_API_KEY:', !!GEMINI_API_KEY);
console.log('🎥 40+ SCENARIOS LIVE');

function isValidRobloxRequest(req) {
    const authToken = req.headers['x-roblox-secret'];
    const isValid = authToken === ROBLOX_SECRET;
    console.log('🔐 Auth:', isValid ? 'PASS' : 'FAIL');
    return isValid;
}

// 🔥 40 DIVERSE SURVIVAL SCENARIOS
const scenarios = [
    "Zombie outbreak in abandoned hospital during power outage",
    "Alien invasion destroys all electronics worldwide",
    "Nuclear meltdown contaminates your entire city",
    "Volcanic eruption buries your town in ash",
    "Global pandemic turns people into rage monsters",
    "Massive earthquake cracks open sinkhole under your house",
    "Toxic gas cloud from chemical plant explosion",
    "Meteor shower ignites forest fires everywhere",
    "Mutant animal swarm attacks suburban neighborhood",
    "EMP blast fries all technology in 100 mile radius",
    "Sharks circle blood-filled sinking luxury yacht",
    "Cave collapse traps you with rising flood waters",
    "Alien mothership beams up city skyscrapers",
    "Rogue AI locks down skyscraper - no escape",
    "Tsunami floods coastal city - buildings collapsing",
    "Bio-engineered plague turns neighbors violent",
    "Asteroid impact creates toxic dust storm",
    "Arctic research station overrun by polar mutants",
    "Underground bunker floods with contaminated water",
    "Swarm of giant mutated insects invades city",
    "Quantum rift spawns shadow creatures everywhere",
    "Solar flare melts all electronics instantly",
    "Cryo-virus outbreak freezes victims solid",
    "Rogue nanobots disassemble entire neighborhood",
    "Time dilation trap ages you 50 years instantly",
    "Parasitic fungi infects entire apartment complex",
    "Ghost ship appears in harbor - crew reanimates",
    "Antimatter leak destabilizes local physics",
    "Memory wipe virus erases survival instincts",
    "Dimensional tear summons eldritch horrors",
    "Global oxygen depletion - breathing becomes deadly",
    "Swarm intelligence hijacks all human minds",
    "Reality fracture spawns impossible geometries",
    "Chronal storm rewinds time unpredictably",
    "Neural parasite network controls city population",
    "Black hole micro-singularity consumes suburb",
    "Psionic storm amplifies everyone's worst fears",
    "Matter replicator malfunction creates monsters",
    "Gravitational anomaly crushes buildings inward",
    "Entropy field accelerates decay everywhere"
];

app.post('/survival', async (req, res) => {
    console.log('📨 Request:', req.body);
    console.log('📨', req.body.generateScenario ? 'SCENARIO' : 'STORY');

    if (!isValidRobloxRequest(req)) {
        return res.status(403).json({ error: 'Roblox servers only' });
    }

    const { scenario, response, generateScenario } = req.body;

    if (generateScenario) {
        // 🎬 AI SCENARIO GENERATOR
        const scenarioPrompt = `Generate ONE 10-15 word cinematic survival scenario from these themes:
Zombies, Volcano, Sharks, Cave collapse, Alien invasion, Nuclear, Earthquake, Toxic gas, Meteors, Mutants, EMP, Tsunami, Plague, Asteroid, Arctic mutants, Sinkhole, Nanobots, Parasites, Ghost ship, Black hole

Return ONLY the scenario text:`;

        try {
            const apiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: scenarioPrompt }] }],
                        generationConfig: { maxOutputTokens: 60, temperature: 0.85 }
                    })
                }
            );

            const data = await apiRes.json();
            let scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

            // Clean scenario
            scenarioText = scenarioText.replace(/["\n\r]/g, '').substring(0, 80);
            
            if (scenarioText.length < 8) {
                scenarioText = scenarios[Math.floor(Math.random() * scenarios.length)];
            }

            console.log('🎬 Scenario:', scenarioText);
            res.json({ scenario: scenarioText });

        } catch {
            res.json({ scenario: scenarios[Math.floor(Math.random() * scenarios.length)] });
        }

    } else {
        // 🎥 IMMERSIVE CINEMATIC STORY
        const sensoryBoosts = {
            zombie: "rotting flesh stench chokes air, guttural moans echo corridors, blood slicks tile floors",
            volcano: "400°C air blisters skin, molten rocks hiss nearby, sulfur burns every breath",
            alien: "eerie hum vibrates bones, sky pulses unnatural green, metallic ozone fills mouth",
            nuclear: "crackling Geiger counters, acrid ionized air stings eyes, shadows burned into walls",
            shark: "saltwater stings wounds, blood clouds water red, dorsal fins slice dark waves",
            cave: "water drips endlessly, rocks grind shifting, darkness crushes like physical weight",
            plague: "hack coughs echo halls, fever sweat soaks clothes, metallic blood taste lingers",
            meteor: "sky burns orange-red, shockwaves shatter glass, ash chokes burning lungs",
            emp: "electronics spark die, radios scream static, world plunges into silent dark",
            mutant: "unnatural howls pierce night, twisted limbs snap branches, predatory eyes glow"
        };

        let sensoryBoost = '';
        const scenarioLower = scenario.toLowerCase();
        for (const [key, boost] of Object.entries(sensoryBoosts)) {
            if (scenarioLower.includes(key)) {
                sensoryBoost = boost;
                break;
            }
        }

        const prompt = `Cinematic survival masterwork - EXACTLY 5 sentences of TOTAL IMMERSION:

ATMOSPHERE: ${sensoryBoost || "apocalyptic chaos assaults every sense"}

SCENARIO: "${scenario}"
PLAYER ACTION: "${response}"

2nd person perspective. Every sense ALIVE:
• Heart pounds chest ribs
• Sweat stings eyes painfully 
• Muscles burn screaming fatigue
• Action creates PERFECT chain reaction
End EXACTLY: "**SURVIVED**" or "**DIED**"

EXAMPLE:
Heartbeat slams ribs as groans fill corridor. Rotting fingers claw barricade - moonlight glints bone. Your bat CRACKS skull, gore sprays walls. Horde staggers, you hold position. **SURVIVED**`;

        try {
            const apiRes = await fetch(
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
            );

            const data = await apiRes.json();
            let fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            const survived = fullText.toUpperCase().includes('SURVIVED');
            
            // Clean story text
            let story = fullText.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();
            story = story.replace(/\n\s*\n/g, '\n');

            // QUALITY GUARANTEE
            if (story.length < 120) {
                const survivedRand = Math.random() > 0.48;
                const qualityStories = survivedRand ? [
                    `Heartbeat thunders chest as ${scenarioLower} surrounds you completely. Every sense screams - sweat burns eyes, muscles scream fatigue. Your desperate ${response} triggers perfect survival chain. Danger brushes past inches away. Adrenaline peaks - you live.`,
                    `World collapses to primal instinct only. Sensory overload assaults - sounds deafening, smells choking, skin electric. Split-second ${response} cascades perfectly through chaos. Fate tilts your direction. Survival snatched from catastrophe.`
                ] : [
                    `Every sense screams as ${scenarioLower} accelerates. Your ${response} creates unstoppable doom cascade. Timing betrays critical instant perfectly. World crushes inward suffocatingly. Survival denied final heartbeat.`,
                    `Adrenaline surges insufficient against ${scenarioLower}. Environmental cascade overwhelms every ${response} attempt. Sensory details sharpen doom moments cruelly. One fatal cascade seals destiny completely. Darkness claims victim.`
                ];
                story = qualityStories[Math.floor(Math.random() * 2)];
            }

            console.log('🎥 CINEMATIC:', { survived, length: story.length });
            res.json({ story, survived });

        } catch (error) {
            console.error('❌ Story fallback:', error.message);
            const survived = Math.random() > 0.5;
            const fallback = survived ? 
                `Every sense alive, your ${response} executes perfectly. Danger brushes past - heartbeat slows. You live.` :
                `Senses overload as ${scenario} collapses inward. Survival slips through desperate fingers. End.`;
            res.json({ story: fallback, survived });
        }
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: '🤖 AI To Survive! LIVE', 
        gemini: !!GEMINI_API_KEY,
        scenarios: scenarios.length,
        stories: 'immersive'
    });
});

module.exports = app;
