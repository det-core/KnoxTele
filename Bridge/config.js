import fs from 'fs'

if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database', { recursive: true })
}

global.pairingCode = "KNOX"
global.versionBot = "1.0.0"
global.ownerName = "CODEBREAKER"
global.nameBot = "KNOX MD"
global.ownerUsername = "@knoxprime"
global.ownerContact = "https://t.me/knoxprime"

global.prefixes = [".", "/", "•", "∆", "#", "!"]

global.feature = {
    public: true
}

// ══════════════════════════════════════════════════════════════════════════════
// ── OWNER & ADMIN IDs ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// WhatsApp numbers (used by WA bot side - no + or spaces)
global.owner = ["2347030626048"]          // Owner WA number
global.ownerNumber = "2347030626048"       // Same as above

// Telegram numeric user IDs (get yours by messaging @userinfobot on Telegram)
// These are DIFFERENT from your WhatsApp number
global.ownerTelegramId = "7711882574"     // <-- YOUR TELEGRAM USER ID

// Telegram admin IDs - can use all admin commands on Telegram side
global.adminTelegramIds = [
    "7711882574"                           // <-- ADD MORE TELEGRAM IDs HERE
]

// Telegram reseller IDs - can pair + create coupons (stored in reseller.json too)
global.resellerTelegramIds = []           // <-- ADD RESELLER TELEGRAM IDs HERE

// WA admin numbers (used by WhatsApp side)
global.adminNumbers = ["2347030626048"]   // WA numbers of admins

// ══════════════════════════════════════════════════════════════════════════════
// ── AUTO-JOIN ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Newsletter JIDs to auto-follow when bot connects (WhatsApp channels)
global.autoJoinNewsletters = [
    "120363400363337568@newsletter",
    "120363402033092071@newsletter"
]

// Group invite links or JIDs to auto-join when bot connects
global.autoJoinGroups = []

// ── Telegram required channels ─────────────────────────────────────────────
global.requiredChannels = [
    "@darkemptech"
]

// ══════════════════════════════════════════════════════════════════════════════
// ── PTERODACTYL PANEL ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.loc = "1"
global.egg = "15"
global.nestid = "5"
global.domain = "https://yourpanel.com"       // <-- YOUR PANEL URL
global.apikey = "ptla_4NSl9cktsf3m0WhCi9IiSRJFSOCClUZKIpMqyGEXFqc"                // <-- APPLICATION API KEY
global.capikey = "ptlc_VmePp0fpf8EceKxhSPE6YHwswAHH9Rb8ROpJuGPOkR9"              // <-- CLIENT API KEY

// ══════════════════════════════════════════════════════════════════════════════
// ── PAYSTACK ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.paystackSecretKey = "sk_live_9878e0da1acf28502ee89ce4e692e99fa88d1d28"   // <-- FROM dashboard.paystack.com
global.paystackPublicKey = "pk_live_03fa82ae8e5a7e2bd1f81b49f8db6380a833a044"   // <-- FROM dashboard.paystack.com
global.paystackCallbackUrl = ""                // <-- optional redirect URL

// ══════════════════════════════════════════════════════════════════════════════
// ── PANEL PRICING ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.panelPrices = {
    '1gb':  { ram: 1024,  disk: 1024,  cpu: 30,  price: 1500  },
    '2gb':  { ram: 2048,  disk: 2048,  cpu: 40,  price: 2500  },
    '3gb':  { ram: 3072,  disk: 3072,  cpu: 50,  price: 3500  },
    '4gb':  { ram: 4096,  disk: 4096,  cpu: 60,  price: 4500  },
    '5gb':  { ram: 5120,  disk: 5120,  cpu: 70,  price: 5500  },
    '6gb':  { ram: 6144,  disk: 6144,  cpu: 80,  price: 6500  },
    '7gb':  { ram: 7168,  disk: 7168,  cpu: 90,  price: 7500  },
    '8gb':  { ram: 8192,  disk: 8192,  cpu: 100, price: 8500  },
    '9gb':  { ram: 9216,  disk: 9216,  cpu: 110, price: 9500  },
    '10gb': { ram: 10240, disk: 10240, cpu: 120, price: 10500 }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── IMAGES & MUSIC ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.img = {
    menu:     'https://files.catbox.moe/oei3f7.jpg',
    cpanel:   'https://files.catbox.moe/oinvai.png',
    owner:    'https://files.catbox.moe/srku7m.png',
    download: 'https://files.catbox.moe/lm1p5r.png',
    group:    'https://files.catbox.moe/72nnjr.png',
    git:      'https://files.catbox.moe/rzea5p.png',
    osint:    'https://files.catbox.moe/xh6kuu.png',
    telegram: 'https://files.catbox.moe/oei3f7.jpg'
}

global.music = {
    menu:    'https://files.catbox.moe/0r8asd.mp3',
    cpanel:  'https://files.catbox.moe/3we7c6.mp3',
    welcome: 'https://files.catbox.moe/5y9pie.mp3'
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MESSAGES ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.mess = {
    owner:    "*⛔ ACCESS DENIED*\nOwner only command.",
    reseller: "*⛔ ACCESS DENIED*\nReseller only.\n\nContact @knoxprime (CODEBREAKER) to purchase.",
    admin:    "*⛔ ACCESS DENIED*\nAdmin only command.",
    group:    "*⛔ ACCESS DENIED*\nGroup only command.",
    private:  "*⛔ ACCESS DENIED*\nPrivate chat only.",
    botAdmin: "*⛔ ACCESS DENIED*\nMake the bot a group admin first.",
    success:  "✅ *SUCCESS*"
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FEATURES ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
global.freeTrialEnabled = true        // ON = anyone can pair
global.freeTrialDays = 1

global.antibugEnabled = false         // Toggle with .antibug on/off
global.antibugBlockSender = true

global.anticallEnabled = false
global.callViolations = new Map()
