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

// 🔥 SURVIVAL SCENARIOS
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

    if (!isValidRobloxRequest(req)) {
        return res.status(403).json({ error: 'Roblox servers only' });
    }

    const { scenario, response, generateScenario } = req.body;

    // 🎬 SCENARIO GENERATOR
    if (generateScenario) {
        const prompt = `Generate ONE cinematic survival scenario (10–15 words).
Themes: zombies, volcano, sharks, cave collapse, aliens, nuclear, EMP, tsunami.
Return ONLY the scenario text.`;

        try {
            const apiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 60, temperature: 0.85 }
                    })
                }
            );

            const data = await apiRes.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            text = text.replace(/["\n\r]/g, '').substring(0, 80);

            if (text.length < 8) {
                text = scenarios[Math.floor(Math.random() * scenarios.length)];
            }

            return res.json({ scenario: text });

        } catch {
            return res.json({ scenario: scenarios[Math.floor(Math.random() * scenarios.length)] });
        }
    }

    // 🎥 CINEMATIC STORY (GUARANTEED RESPONSE USE)
    const prompt = `You are writing a cinematic survival story.

STRICT RULES (BREAKING ANY RULE = FAILURE):
- EXACTLY 5 sentences.
- Second person ("you").
- You MUST include the following text EXACTLY, character-for-character:
>>> ${response} <<<
- Do NOT rephrase it.
- Do NOT split it.
- Use it as a physical action that causes a chain reaction.

SCENARIO:
"${scenario}"

Style:
- Short, punchy, cinematic sentences.
- Extreme danger and sensory detail.

Ending:
- Final sentence must be either **SURVIVED** or **DIED**
- Nothing after that.`;

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

        // 🔒 HARD ENFORCEMENT
        if (!fullText.includes(response)) {
            console.log('⚠️ Response missing — injecting');

            let sentences = fullText
                .replace(/\*\*(SURVIVED|DIED)\*\*/gi, '')
                .split(/(?<=[.!?])\s+/)
                .slice(0, 4);

            if (sentences.length >= 2) {
                sentences[1] += ` ${response}.`;
            } else {
                sentences.push(`${response}.`);
            }

            fullText = sentences.join(' ') + ' **SURVIVED**';
        }

        const survived = fullText.toUpperCase().includes('SURVIVED');
        let story = fullText.replace(/\*\*(SURVIVED|DIED)\*\*/gi, '').trim();

        return res.json({ story, survived });

    } catch (err) {
        console.error('❌ Story error:', err.message);

        const survived = Math.random() > 0.5;
        const fallback = survived
            ? `Adrenaline detonates as danger surrounds you. ${response} ignites a perfect chain reaction. The threat collapses instantly. Silence follows.`
            : `Panic floods every sense as everything fails. ${response} triggers a fatal cascade. Pain blurs reality. Darkness takes you.`;

        return res.json({ story: fallback, survived });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: '🤖 AI To Survive! LIVE',
        gemini: !!GEMINI_API_KEY,
        scenarios: scenarios.length
    });
});

module.exports = app;
