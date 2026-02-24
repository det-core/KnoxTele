import fs from 'fs'

if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database', { recursive: true })
}

global.pairingCode = "KNOX"
global.versionBot = "1.0.0"
global.ownerName = "CODEBREAKER"
global.nameBot = "KNOX MD"

global.ownerUsername = "@knoxprime"

global.prefixes = [".", "/", "•", "∆", "#", "!"]

global.feature = {
    public: true
}

global.requiredChannels = [
    "@darkemptech"
]

global.owner = ["2347030626048"]
global.ownerNumber = "2347030626048"

global.reseller = []

global.loc = "1"
global.egg = "15"
global.nestid = "5"
global.domain = "https://yourpanel.com"
global.apikey = "ptla_yourkey"
global.capikey = "ptlc_yourkey"

global.panelPrices = {
    '1gb': { ram: 1024, disk: 1024, cpu: 30, price: 1500 },
    '2gb': { ram: 2048, disk: 2048, cpu: 40, price: 2500 },
    '3gb': { ram: 3072, disk: 3072, cpu: 50, price: 3500 },
    '4gb': { ram: 4096, disk: 4096, cpu: 60, price: 4500 },
    '5gb': { ram: 5120, disk: 5120, cpu: 70, price: 5500 },
    '6gb': { ram: 6144, disk: 6144, cpu: 80, price: 6500 },
    '7gb': { ram: 7168, disk: 7168, cpu: 90, price: 7500 },
    '8gb': { ram: 8192, disk: 8192, cpu: 100, price: 8500 },
    '9gb': { ram: 9216, disk: 9216, cpu: 110, price: 9500 },
    '10gb': { ram: 10240, disk: 10240, cpu: 120, price: 10500 }
}

global.img = {
    menu: 'https://files.catbox.moe/oei3f7.jpg',
    cpanel: 'https://files.catbox.moe/oinvai.png',
    owner: 'https://files.catbox.moe/srku7m.png',
    download: 'https://files.catbox.moe/lm1p5r.png',
    group: 'https://files.catbox.moe/72nnjr.png',
    git: 'https://files.catbox.moe/rzea5p.png',
    osint: 'https://files.catbox.moe/xh6kuu.png',
    telegram: 'https://files.catbox.moe/oei3f7.jpg'
}

global.music = {
    menu: 'https://files.catbox.moe/0r8asd.mp3',
    cpanel: 'https://files.catbox.moe/3we7c6.mp3',
    welcome: 'https://files.catbox.moe/5y9pie.mp3'
}

global.mess = {
    owner: "*ACCESS DENIED* OWNER ONLY",
    reseller: "*ACCESS DENIED* RESELLER ONLY",
    admin: "*ACCESS DENIED* ADMIN ONLY",
    group: "*ACCESS DENIED* GROUP ONLY",
    private: "*ACCESS DENIED* PRIVATE ONLY",
    botAdmin: "*ACCESS DENIED* BOT MUST BE ADMIN",
    success: "*SUCCESS*"
}