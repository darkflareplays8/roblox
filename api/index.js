const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const ROBLOX_SECRET = "mySuperSecretKey123";
const PORT = process.env.PORT || 3000;

// 50+ survival scenarios
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
    "EMP blast fries all technology in 100 mile radius"
    // Add 40 more scenarios...
];

app.post('/survival', (req, res) => {
    const secret = req.headers['x-roblox-secret'];
    
    if (secret !== ROBLOX_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { scenario, response, generateScenario } = req.body;

    if (generateScenario) {
        // Generate random scenario
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        res.json({ scenario: randomScenario });
        return;
    }

    // CRITICAL: ANALYZE PLAYER RESPONSE
    const playerAction = response.toLowerCase();
    let survived = false;
    let story = "";

    // 60% BASE SURVIVAL + RESPONSE BOOST
    const baseRoll = Math.random();
    const responseScore = analyzeResponse(playerAction);
    
    survived = (baseRoll + responseScore) > 0.4; // 60% survival threshold

    if (survived) {
        story = generateSurvivalStory(scenario, playerAction);
    } else {
        story = generateDeathStory(scenario, playerAction);
    }

    console.log(`Player: "${playerAction}" → Score: ${responseScore.toFixed(2)} → ${survived ? 'SURVIVED' : 'DIED'}`);
    
    res.json({ story, survived });
});

function analyzeResponse(action) {
    // SCORE PLAYER'S SURVIVAL STRATEGY (0.0 - 0.6 boost)
    let score = 0;
    
    // KEYWORDS THAT BOOST SURVIVAL
    if (action.includes('barricade') || action.includes('board up')) score += 0.15;
    if (action.includes('weapon') || action.includes('bat') || action.includes('knife')) score += 0.12;
    if (action.includes('hide') || action.includes('attic') || action.includes('closet')) score += 0.10;
    if (action.includes('food') || action.includes('water') || action.includes('supplies')) score += 0.10;
    if (action.includes('quiet') || action.includes('silent') || action.includes('noise')) score += 0.08;
    if (action.includes('neighbor') || action.includes('group')) score -= 0.10; // Risky!
    if (action.includes('run') || action.includes('street')) score -= 0.08; // Exposed!
    
    return Math.min(score, 0.6); // Cap boost
}

function generateSurvivalStory(scenario, action) {
    const survivalReasons = [
        `Your ${action.includes('barricade') ? 'barricades held firm' : 'clever defenses'} kept them out!`,
        `The ${action.includes('weapon') ? 'improvised weapons' : 'smart traps'} you made decimated the horde!`,
        `${action.includes('hide') ? 'Perfect hiding spot' : 'Strategic position'} - they never found you!`,
        `Your ${action.includes('food') ? 'stockpile lasted' : 'resource management'} kept you alive for days!`
    ];
    
    return `🔥 EPIC SURVIVAL! 🔥

${scenario.toUpperCase()}

"Your plan: ${action}

${survivalReasons[Math.floor(Math.random() * survivalReasons.length)]}

You survived 72 hours. Dawn breaks. You're alive... for now.

NEXT CHALLENGE AWAITS...`;
}

function generateDeathStory(scenario, action) {
    const deathReasons = [
        `The ${action.includes('neighbor') ? 'neighbors betrayed you' : 'horde overwhelmed your weak defenses'}.`,
        `Your ${action.includes('run') ? 'dash into the street exposed you' : 'position was compromised'}.`,
        `You ran out of ${action.includes('food') ? 'supplies too quickly' : 'luck'}. Game over.`,
        `A single ${action.includes('noise') ? 'noise gave you away' : 'mistake'} sealed your fate.`
    ];
    
    return `💀 FATAL MISTAKE 💀

${scenario.toUpperCase()}

"Your plan: ${action}

${deathReasons[Math.floor(Math.random() * deathReasons.length)]}

You lasted ${Math.floor(Math.random() * 24) + 1} hours.

TRY AGAIN - BETTER STRATEGY REQUIRED!`;
}

app.listen(PORT, () => {
    console.log(`🚀 Survival AI Server running on port ${PORT}`);
});
