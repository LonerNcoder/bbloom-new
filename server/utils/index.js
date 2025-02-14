import { PrismaClient } from '@prisma/client';
import { getRequestHeader} from 'h3';


/**
 * Verifies if a user with the given userId exists in the database.
 * 
 * @param {number} userId - The unique identifier of the user to verify. Should be an integer.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the user exists, false otherwise.
 */
export async function verifyUserId(userId){
    const prisma = new PrismaClient();
    const user = prisma.user.findUnique({
        where: {id: userId}
    })
    prisma.$disconnect();
    if (user){
        return true;
    }
    return false;
}

export async function verifyUser(event){
    // Extract session token and API key from header
    var sessionToken = await getRequestHeader(event, 'Authorization');
    const apiKey = await getRequestHeader(event, 'X-API-KEY');

    if (sessionToken && sessionToken.startsWith('Bearer ')) {
        sessionToken = sessionToken.split(' ')[1];
    }
    if (!sessionToken || !apiKey) {
        event.context.error = 'Its Invalid session or API key';
        return false
    }
    
    const prisma = new PrismaClient();

    const session = await prisma.session.findUnique({
        where: { sessionToken: sessionToken },
        include: { 
            user: { 
                select:{
                    id: true,
                    username: true,
                    apiKey: true,
                    libraries:true,
                    }
                }
            }
        });
    
        // console.log(session)


    if (!session || session.user.apiKey.key !== apiKey) {
        event.context.error = 'Invalid session or API key';
        prisma.$disconnect()
        return false
    }else{
        event.context.session = session;
        prisma.$disconnect()
        return true
    }
}

export async function getUserRole(userId, novelId){
    const prisma = new PrismaClient();
    try{
        const novel = await prisma.novel.findUnique({
            where: { 
                id: parseInt(novelId),
            }
        })

        if (!novel) {
            throw new Error('Novel not found');
        }
        if (novel.authorId === userId) {
            return 'writer';
          } else if (novel.uploaderId === userId) {
            return 'uploader';
        } 

    }catch(e){
        console.log(e)
        return "none"
    }finally{
        prisma.$disconnect()
    }
}


// Enhanced Genre Map with reduced redundancy
const genreKeywords = {
    "fantasy": new Set([
        "magic", "dragons", "elves", "wizard", "mythical", "quest", 
        "enchanted", "prophecy", "fairy", "druid", "orc", "spellbook",
        "griffin", "mana", "runes", "runestone", "bestiary", "talisman",
        "mana core", "leyline convergence", "beast taming", "dungeon diving",
        "elemental affinity", "arcane sigils", "phylactery", "wyvern riding",
        "shardblades", "worldtree", "rune forging", "aether currents",
        "dragonbond", "fae courts", "moonwell", "voidwalking"
    ]),
    "science fiction": new Set([
        "space", "alien", "robot", "cyber", "AI", "spaceship", "quantum",
        "nanotech", "cyborg", "terraform", "exoplanet", "singularity",
        "android", "teleport", "hologram","sci-fi", "sci", "xeno","scp"
    ]),
    "romance": new Set([
        "love", "passion", "relationship", "wedding", "flirt", 
        "chemistry", "heartbreak", "dating", "soulmate", "affection",
        "proposal", "infatuation", "crush"
    ]),
    "mystery": new Set([
        "clue", "whodunit", "sleuth", "red herring", "alibi", 
        "forensic", "deduction", "suspense", "conspiracy", "evidence",
        "motive", "disguise", "intrigue","enigmatic", "puzzling", "cryptic"
    ]),
    "horror": new Set([
        "ghost", "haunting", "paranormal", "occult", "possession",
        "demon", "witchcraft", "curse", "nightmare", "supernatural",
        "eldritch", "cursed", "scream"
    ]),
    "thriller": new Set([
        "conspiracy", "espionage", "manhunt", "kidnap", "extortion",
        "deadline", "countdown", "betrayal", "blackmail", "assassin",
        "coverup", "hostage", "sabotage"
    ]),
    "non-fiction": new Set([
        "biography", "memoir", "research", "textbook", "autobiography",
        "documentary", "peer-reviewed", "case study", "academic",
        "statistics", "citation", "methodology"
    ]),
    "game": new Set([
        // Popular game titles
        "minecraft", "fortnite", "roblox", "among us", "league of legends",
        "valorant", "call of duty", "world of warcraft", "genshin impact",
        "pokemon", "elden ring", "the legend of zelda", "super mario",
        "animal crossing", "stardew valley", "apex legends", "overwatch",
        
        // Game mechanics and systems
        "quest", "level", "boss fight", "raid", "pvp", "pve", "multiplayer",
        "singleplayer", "open world", "sandbox", "survival", "crafting",
        "loot", "grind", "skill tree", "character customization", "inventory",
        "achievement", "trophy", "leaderboard", "matchmaking", "respawn",
        
        // Game genres
        "rpg", "mmorpg", "fps", "battle royale", "simulation", "strategy",
        "platformer", "puzzle", "horror game", "indie game", "adventure game",
        
        // Game-related terms
        "game system", "console", "pc gaming", "esports", "streaming",
        "speedrun", "modding", "cheat code", "dlc", "expansion pack",
        "game pass", "steam", "epic games", "nintendo switch", "playstation",
        "xbox", "virtual reality", "vr gaming", "augmented reality"
    ]),
    "young adult": new Set([
        "comingofage", "teen", "highschool", "firstlove", "identity",
        "selfdiscovery", "bullying", "clique", "prom", "yearbook",
        "dorm", "extracurricular"
    ]),
    "dystopian": new Set([
        "totalitarian", "apocalypse", "oppression", "dystopia",
        "surveillance", "rebellion", "resistance", "propaganda",
        "dystopia", "rationing", "survivalist", "authoritarian"
    ]),
    "urban fantasy": new Set([
        "vampire", "werewolf", "modernmagic", "shadowhunter",
        "supernatural", "paranormal", "hiddenworld", "ward",
        "enchantedcity", "magicrealism"
    ]),
    "technology": new Set([
        "coding", "blockchain", "cryptography", "algorithm",
        "neuralnet", "machinelearning", "vr", "ar", "iot",
        "biometric", "encryption", "debugging",
        "tech", "ai", "ml", "machine learning",
        "quantum annealing", "neurolink", "photon computing",
        "cryptocurrency mining", "NFT provenance", "DAO governance",
        "smart contracts", "zero-knowledge proofs", "post-quantum crypto",
        "biometric spoofing", "deepfake detection", "AGI alignment",
        "nanofabrication", "fusion ignition"
    ]),
    "lgbtq+": new Set([
        "queer", "genderfluid", "pride", "comingout", "transition",
        "nonbinary", "ally", "stonewall", "drag", "rainbow",
        "orientation", "acceptance"
    ]),
    "self-help": new Set([
        "motivation", "mindfulness", "habit", "productivity",
        "meditation", "gratitude", "resilience", "mindset",
        "affirmation", "journaling", "positivity"
    ]),
    // Educational Categories
    "children's education": new Set([
        "picture book", "early learning", "phonics", "storytime",
        "bedtime math", "science fair", "activity book", "read-aloud",
        "homeschool", "montessori", "educational toys"
    ]),

    "xianxia": new Set([
        "golden core formation", "soul lantern", "karmic severing",
        "heavenly dao insights", "jade slip scriptures", "bloodline legacy",
        "sect contribution points", "spirit herb garden", "tribulation lightning",
        "yin-yang harmonization", "meridian purification", "nascent divinity",
        "demon suppression array", "celestial auction house"
    ]),

    "xuanhuan": new Set([
        "system prompts", "achievement shop", "gacha mechanics",
        "transmigration penalty","transmigration", "travel through time", "reincarnation", "fourth wall breaks", "NPC sentience",
        "virtual interface", "cultivation simulator", "dimensional marketplace",
        "protagonist aura", "plot armor", "cheat codes", "cheats","world hopping",
        "skill fusion", "status screen", "experience points"
    ]),

    "wuxia": new Set([
        "qi deviation", "pressure point combat", "sword intent comprehension",
        "hidden weapons", "poison immunity", "eight trigrams formation",
        "dragon-subduing palm", "phoenix cry technique", "sect inheritance",
        "jianghu reputation", "benevolent medic", "poison masters",
        "escort missions", "martial arts ranking"
    ]),
    "afrofuturism": new Set([
        "sankofa tech", "orisha neural network", "diaspora gate",
        "ancestral AI", "griot VR", "nommo code", "kente circuits",
        "afro-punk", "neo-sankofa", "yoruba space program",
        "pan-african federation", "ubuntu OS"
    ]),

    "cultivation": new Set([
        "core condensation", "soul foundation", "tribulation preparation","cultivation",
        "spirit vein awakening", "body reforging", "dao heart",
        "karmic enlightenment", "sect trials", "closed door retreat",
        "spirit beast contract", "alchemy furnace", "array crafting"
    ]),

    "litrpg": new Set([
        "stat sheets", "achievement notifications", "skill evolution",
        "party system", "guild management", "damage numbers",
        "respawn timer", "quest log", "min-maxing", "grind spots",
        "instance dungeons", "raid coordination"
    ]),

    "chinese historical": new Set([
        "imperial court", "concubine", "palace intrigue", "tributary state",
        "mandarin", "dynasty", "warring states", "emperor", "eunuch",
        "scholar-official", "imperial exam", "three kingdoms"
    ]),
    "danmei": new Set([
        "boys love", "BL", "shounen ai", "danmei", "m/m romance",
        "xianxia BL", "historical BL", "censored romance", "cp",
        "power couple", "soul bonding"
    ]),
    "modern chinese romance": new Set([
        "ceo romance", "showbiz", "entertainment circle", "web novel",
        "transmigration", "quick transmigration", "sweet pet",
        "contract marriage", "rebirth", "rival lovers", "childhood friends"
    ]),

        // Educational Categories
        "textbook": new Set([
            "textbook", "curriculum", "syllabus", "workbook", "coursebook",
            "lesson plan", "educational", "pedagogy", "didactic", "module",
            "chapter exercise", "learning outcomes", "rubric"
        ]),
        "academic": new Set([
            "scholarly", "peer-reviewed", "dissertation", "thesis",
            "research paper", "citation", "literature review", "methodology",
            "academic journal", "ivy league", "graduate", "postdoctoral"
        ]),
        "exam prep": new Set([
            "certification", "test prep", "practice exam", "study guide",
            "flashcards", "mcq", "board exam", "entrance test", "licensing",
            "assessment", "mock test", "question bank"
        ]),
        "reference": new Set([
            "encyclopedia", "dictionary", "handbook", "manual", "atlas",
            "almanac", "directory", "annotated", "bibliography", "gazetteer",
            "companion guide", "quick reference"
        ]),
        "professional development": new Set([
            "career guide", "leadership", "management", "technical skills",
            "certification", "workshop", "case study", "business strategy",
            "industry standards", "white paper", "best practices"
        ]),
        // Newly requested genres
        "classic": new Set([
            "timeless", "canonical", "masterpiece", "heritage", "vintage",
            "literary canon", "seminal", "archetypal", "iconic", "definitive",
            "golden age", "retro", "old school", "traditional", "nostalgic"
        ]),
        "originals": new Set([
            "unique premise", "groundbreaking", "unadapted", "first edition",
            "source material", "prototype", "archetype", "never seen before",
            "innovative", "experimental", "pioneering", "trailblazing"
        ]),
        "random": new Set([
            "absurdist", "nonsensical", "unpredictable", "chaotic", "quirky",
            "surreal", "kafkaesque", "unclassifiable", "postmodern", "dadaist",
            "avant-garde", "nonlinear", "disjointed", "unconventional"
        ]),
        "mischievous": new Set([
            "prank", "trickster", "roguish", "scheming", "subversive",
            "unreliable narrator", "satirical", "parody", "trolling",
            "whimsical", "playful", "anarchic", "rule-breaking"
        ]),
        "medieval": new Set([
            // Focus on medieval-specific terms
            "knights", "chivalry", "castle siege", "chainmail", 
            "longbow", "jousting", "troubadour", "keep",
            "moat", "heraldry", "feudal lord", "medieval times",
            "battlements", "drawbridge", "tournament", "code of honor",
            "pageantry", "courtly love", "fealty", "manor", "serfdom"
        ]),
        
        "historical": new Set([
            // Broader historical terms, excluding medieval-specific ones
            "renaissance", "ancient", "dynasty", "monarchy",
            "viking", "samurai", "artifact", "tapestry",
            "imperial", "revolution", "colonial", "industrial",
            "bronze age", "iron age", "prehistoric", "archaeology",
            "ancient rome", "ancient greece", "egyptian", "mesopotamia",
            "world war", "cold war", "victorian", "enlightenment"
        ]),
        "miscellaneous": new Set([
            "general", "various", "uncategorized", "assorted", "mixed",
            "diverse", "eclectic", "sundry", "multipurpose", "universal",
            "catch-all", "unspecified", "misc", "random", "other"
        ]),
    
        "NSFW": new Set([
            // Explicit Content Markers
            "sex", "sexual", "explicit", "porn", "erotica", "nsfw",
            "gore", "violence", "torture", "graphic", "bloodbath",
            "disturbing", "rape", "abuse", "incest", "paedophilia",
            "cp", "child porn", "snuff", "necrophilia", "bestiality",
            // Abbreviations/Slang
            "bsdm", "bdsm", "fuck", "slut", "whore", "dick", "pussy",
            "cum", "creampie", "blowjob", "handjob", "scat", "voyeur",
            // Content Warnings
            "trigger warning", "content warning", "TW", "CW",
            "omegaverse", "knotting", "breeding kink",,
            "non-con", "edgeplay", "aftercare", "safe words",
            "OnlyFans", "ASMR", "lewd", "simp", "thirst trap",
            // Regex patterns for partial matches
            /^daddy/, /^mommy/, /^yandere/, /^bdsm/,
            /^nsfw/, /^explicit/, /^x-rated/, /^adultonly/
        ])
    
};

function normalizeTag(tag) {
    // Step 1: Case normalization and special character handling
    const cleaned = tag.toLowerCase()
        // Remove unwanted characters except allowed separators
        .replace(/[^a-z0-9\s_+—–-]/g, '')  
        // Handle various dash types and underscores
        .replace(/[—–_]/g, '-')            
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')               
        // Trim whitespace
        .trim();                            

    // Step 2: Advanced splitting with multiple delimiters
    const parts = cleaned
        // Split on multiple delimiter types
        .split(/[\s+—–\-]+/)                
        // Filter valid parts
        .filter(part => part.length > 2);   

    // Step 3: Special case handling
    return parts.length > 0 ? parts : [cleaned];
}

export function classifyGenre(tags, threshold = 0.5) {
    if (!Array.isArray(tags) || tags.length === 0) return ["miscellaneous"];
    
    // 1. Advanced Tag Processing
    const tagWords = [
        ...new Set(
            tags.flatMap(tag => 
                normalizeTag(tag)
                    // Context-aware filtering
                    .filter(word => !/(?:^|\W)unwanted(?:\W|$)/i.test(word))
            )
        )
    ];

    // 2. NSFW Detection Pipeline
    const nsfwDetector = {
        patterns: [
            ...genreKeywords.NSFW,
            /^adult$/,
            /^explicit/i,
            /^xxx/
        ],
        score: 0
    };

    tagWords.forEach(word => {
        nsfwDetector.patterns.forEach(pattern => {
            if (typeof pattern === 'string' && word === pattern) {
                nsfwDetector.score += 2;
            } else if (pattern instanceof RegExp && pattern.test(word)) {
                nsfwDetector.score += 1.5;
            }
        });
    });

    // 3. Genre Scoring System
    const genreEvaluator = {
        scores: new Map(),
        weights: {
            "NSFW": 3.0,
            "xuanhuan": 1.7, // Higher weight for xuanhuan
            "xianxia": 1.6,
            "wuxia": 1.5,
            "textbook": 1.4,
            "classic": 1.3
        },
        evaluate(genre, keywords) {
            let score = 0;
            keywords.forEach(key => {
                tagWords.forEach(word => {
                    if (word === key) score += 1.2;       // Exact match
                    else if (word.includes(key)) score += 0.6; // Partial match
                });
            });
            return score * (this.weights[genre] || 1);
        }
    };

    // Score all genres except NSFW
    Object.entries(genreKeywords).forEach(([genre, keys]) => {
        if (genre === "NSFW") return;
        genreEvaluator.scores.set(genre, genreEvaluator.evaluate(genre, keys));
    });

    // 4. Enforce Mutual Exclusivity for Chinese Novel Genres
    const chineseGenres = ["xuanhuan", "xianxia", "wuxia"];
    let topChineseGenre = null;
    let topScore = 0;

    chineseGenres.forEach(genre => {
        const score = genreEvaluator.scores.get(genre) || 0;
        if (score > topScore) {
            topChineseGenre = genre;
            topScore = score;
        }
    });

    // Remove other Chinese genres from results
    if (topChineseGenre) {
        chineseGenres.forEach(genre => {
            if (genre !== topChineseGenre) {
                genreEvaluator.scores.delete(genre);
            }
        });
    }

    // 5. Result Compilation
    const results = Array.from(genreEvaluator.scores.entries())
        .filter(([genre, score]) => score >= threshold)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    // 6. Priority Handling
    const finalResults = [];
    if (nsfwDetector.score >= 1.5) {
        finalResults.push("NSFW");
    }
    finalResults.push(...results.slice(0, 2).map(([g]) => g));

    return finalResults.length > 0 
        ? finalResults 
        : ["miscellaneous"];
}
export function getGenres(){
    //return all the genres
    return Object.keys(genreKeywords);

}
