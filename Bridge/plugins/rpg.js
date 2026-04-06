import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'
import fs from 'fs'

const rpgFile = './database/rpg.json'

function loadRPG() {
    if (!fs.existsSync(rpgFile)) return {}
    try { return JSON.parse(fs.readFileSync(rpgFile, 'utf8')) } catch { return {} }
}
function saveRPG(data) { fs.writeFileSync(rpgFile, JSON.stringify(data, null, 2)) }

const CLASSES = {
    warrior:  { emoji: '⚔️',  hp: 150, atk: 20, def: 15, sp: 'Shield Bash' },
    mage:     { emoji: '🔮',  hp: 90,  atk: 35, def: 8,  sp: 'Fireball'   },
    archer:   { emoji: '🏹',  hp: 110, atk: 28, def: 10, sp: 'Arrow Rain'  },
    healer:   { emoji: '💊',  hp: 120, atk: 15, def: 12, sp: 'Holy Light'  },
    assassin: { emoji: '🗡️', hp: 100, atk: 40, def: 5,  sp: 'Death Strike' }
}

const MONSTERS = [
    { name: 'Goblin',    hp: 40,  atk: 8,  def: 3,  xp: 20, gold: 10, emoji: '👺' },
    { name: 'Orc',       hp: 80,  atk: 15, def: 8,  xp: 45, gold: 25, emoji: '👹' },
    { name: 'Dragon',    hp: 200, atk: 35, def: 20, xp: 150, gold: 100, emoji: '🐉' },
    { name: 'Skeleton',  hp: 60,  atk: 12, def: 5,  xp: 30, gold: 15, emoji: '💀' },
    { name: 'Troll',     hp: 120, atk: 22, def: 12, xp: 70, gold: 40, emoji: '🧌' },
    { name: 'Witch',     hp: 70,  atk: 28, def: 6,  xp: 55, gold: 30, emoji: '🧙' },
    { name: 'Dark Lord', hp: 350, atk: 50, def: 30, xp: 500, gold: 300, emoji: '😈' }
]

const ITEMS = {
    potion:     { name: 'Health Potion', emoji: '🧪', cost: 50,  effect: 'heal', value: 50 },
    sword:      { name: 'Iron Sword',    emoji: '🗡️', cost: 100, effect: 'atk', value: 10 },
    shield:     { name: 'Wood Shield',   emoji: '🛡️', cost: 80,  effect: 'def', value: 8  },
    magesword:  { name: "Mage's Staff",  emoji: '🪄',  cost: 150, effect: 'atk', value: 18 },
    elixir:     { name: 'Full Elixir',   emoji: '✨',  cost: 120, effect: 'heal', value: 999 }
}

function getOrCreatePlayer(jid) {
    const rpg = loadRPG()
    const id = jid.split('@')[0]
    if (!rpg[id]) {
        rpg[id] = {
            name: id,
            class: null,
            level: 1,
            xp: 0,
            xpNext: 100,
            hp: 100,
            maxHp: 100,
            atk: 10,
            def: 5,
            gold: 50,
            inventory: [],
            wins: 0,
            losses: 0
        }
        saveRPG(rpg)
    }
    return { rpg, id, player: rpg[id] }
}

function savePlayer(rpg, id, player) {
    rpg[id] = player
    saveRPG(rpg)
}

function levelUp(player) {
    let levelled = false
    while (player.xp >= player.xpNext) {
        player.xp -= player.xpNext
        player.level++
        player.xpNext = Math.floor(player.xpNext * 1.5)
        player.maxHp += 20
        player.hp = player.maxHp
        player.atk += 3
        player.def += 2
        levelled = true
    }
    return levelled
}

export default {
    command: ['rpg', 'rpgstart', 'rpgstats', 'rpgfight', 'rpgshop', 'rpgbuy', 'rpguse', 'rpgrank'],
    category: 'rpg',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const cmd = m.command
        const { rpg, id, player } = getOrCreatePlayer(m.sender)

        // ── Start / choose class ──
        if (cmd === 'rpgstart' || (cmd === 'rpg' && !text)) {
            if (player.class) {
                return newsletter.sendText(sock, m.chat,
                    `┏⧉ *⚔️ RPG MENU*\n` +
                    `┣𖣠 ${m.prefix}rpgstats — Your stats\n` +
                    `┣𖣠 ${m.prefix}rpgfight — Fight a monster\n` +
                    `┣𖣠 ${m.prefix}rpgshop — Item shop\n` +
                    `┣𖣠 ${m.prefix}rpguse <item> — Use item\n` +
                    `┣𖣠 ${m.prefix}rpgrank — Leaderboard\n` +
                    `┗━━━━━━━━━`, m
                )
            }

            const classList = Object.entries(CLASSES)
                .map(([k, v]) => `${v.emoji} *${k}* — HP:${v.hp} ATK:${v.atk} DEF:${v.def} | SP: ${v.sp}`)
                .join('\n')

            return newsletter.sendText(sock, m.chat,
                `*⚔️ WELCOME TO KNOX RPG*\n\n` +
                `Choose your class:\n\n${classList}\n\n` +
                `Use: ${m.prefix}rpgstart <class>\nExample: ${m.prefix}rpgstart warrior`, m
            )
        }

        // ── rpgstart <class> ──
        if (cmd === 'rpgstart' && args[0]) {
            const chosen = args[0].toLowerCase()
            if (!CLASSES[chosen]) {
                return newsletter.sendText(sock, m.chat,
                    `*INVALID CLASS*\n\nChoose from: ${Object.keys(CLASSES).join(', ')}`, m
                )
            }
            if (player.class) {
                return newsletter.sendText(sock, m.chat, `*KNOX RPG*\n\nYou already have a class: ${player.class}`, m)
            }
            const cls = CLASSES[chosen]
            player.class = chosen
            player.hp = cls.hp
            player.maxHp = cls.hp
            player.atk = cls.atk
            player.def = cls.def
            savePlayer(rpg, id, player)
            await m.react('⚔️')
            return newsletter.sendText(sock, m.chat,
                `*⚔️ CLASS CHOSEN: ${chosen.toUpperCase()} ${cls.emoji}*\n\n` +
                `HP: ${cls.hp} | ATK: ${cls.atk} | DEF: ${cls.def}\n` +
                `Special: ${cls.sp}\n\nYour adventure begins! Use ${m.prefix}rpgfight to battle.`, m
            )
        }

        // ── Stats ──
        if (cmd === 'rpgstats') {
            if (!player.class) return newsletter.sendText(sock, m.chat, `*KNOX RPG*\n\nStart with ${m.prefix}rpgstart first!`, m)
            const cls = CLASSES[player.class]
            return newsletter.sendText(sock, m.chat,
                `*${cls.emoji} RPG STATS*\n\n` +
                `Class: ${player.class.toUpperCase()}\n` +
                `Level: ${player.level}\n` +
                `XP: ${player.xp}/${player.xpNext}\n` +
                `HP: ${player.hp}/${player.maxHp}\n` +
                `ATK: ${player.atk} | DEF: ${player.def}\n` +
                `Gold: ${player.gold}🪙\n` +
                `Wins: ${player.wins} | Losses: ${player.losses}\n` +
                `Inventory: ${player.inventory.length ? player.inventory.join(', ') : 'Empty'}`, m
            )
        }

        // ── Fight ──
        if (cmd === 'rpgfight') {
            if (!player.class) return newsletter.sendText(sock, m.chat, `*KNOX RPG*\n\nStart with ${m.prefix}rpgstart first!`, m)
            if (player.hp <= 0) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX RPG*\n\nYou're dead! Use ${m.prefix}rpguse potion to heal.`, m
                )
            }

            // Random monster scaled to level
            const eligible = MONSTERS.filter(mob => mob.hp < player.maxHp * 3)
            const monster = { ...eligible[Math.floor(Math.random() * eligible.length)] }

            let pHp = player.hp
            let mHp = monster.hp
            const log = []
            let rounds = 0

            while (pHp > 0 && mHp > 0 && rounds < 20) {
                rounds++
                const pDmg = Math.max(1, player.atk - monster.def + Math.floor(Math.random() * 10))
                const mDmg = Math.max(1, monster.atk - player.def + Math.floor(Math.random() * 8))
                mHp -= pDmg
                if (mHp > 0) pHp -= mDmg
                if (rounds <= 3) log.push(`R${rounds}: You dealt ${pDmg}${mHp <= 0 ? ' 💥' : ''}, took ${mHp > 0 ? mDmg : 0}`)
            }

            const won = mHp <= 0
            player.hp = Math.max(0, pHp)

            if (won) {
                player.wins++
                player.xp += monster.xp
                player.gold += monster.gold
                const didLevel = levelUp(player)
                savePlayer(rpg, id, player)
                await m.react('🏆')
                return newsletter.sendText(sock, m.chat,
                    `*⚔️ BATTLE RESULT: VICTORY!*\n\n` +
                    `You defeated ${monster.emoji} ${monster.name}!\n\n` +
                    log.join('\n') + `\n...\n\n` +
                    `+${monster.xp} XP | +${monster.gold}🪙 gold\n` +
                    `HP remaining: ${player.hp}/${player.maxHp}\n` +
                    (didLevel ? `\n🆙 *LEVEL UP!* You are now Level ${player.level}!` : ''), m
                )
            } else {
                player.losses++
                savePlayer(rpg, id, player)
                await m.react('💀')
                return newsletter.sendText(sock, m.chat,
                    `*⚔️ BATTLE RESULT: DEFEAT*\n\n` +
                    `${monster.emoji} ${monster.name} defeated you!\n\n` +
                    log.join('\n') + `\n...\n\n` +
                    `HP: 0/${player.maxHp}\nUse ${m.prefix}rpguse potion to heal.`, m
                )
            }
        }

        // ── Shop ──
        if (cmd === 'rpgshop') {
            const shopList = Object.entries(ITEMS)
                .map(([k, v]) => `${v.emoji} *${v.name}* — ${v.cost}🪙\n   Key: \`${k}\``)
                .join('\n')
            return newsletter.sendText(sock, m.chat,
                `*🛒 RPG SHOP*\n\nYour gold: ${player.gold}🪙\n\n${shopList}\n\nBuy: ${m.prefix}rpgbuy <key>`, m
            )
        }

        // ── Buy ──
        if (cmd === 'rpgbuy') {
            const key = args[0]?.toLowerCase()
            const item = ITEMS[key]
            if (!item) return newsletter.sendText(sock, m.chat, `*SHOP*\n\nInvalid item. Check ${m.prefix}rpgshop`, m)
            if (player.gold < item.cost) {
                return newsletter.sendText(sock, m.chat, `*SHOP*\n\nNot enough gold! You have ${player.gold}🪙, need ${item.cost}🪙`, m)
            }
            player.gold -= item.cost
            player.inventory.push(key)
            savePlayer(rpg, id, player)
            await m.react('✅')
            return newsletter.sendText(sock, m.chat,
                `*✅ PURCHASED*\n\n${item.emoji} ${item.name} added to inventory.\nGold left: ${player.gold}🪙`, m
            )
        }

        // ── Use item ──
        if (cmd === 'rpguse') {
            const key = args[0]?.toLowerCase()
            const idx = player.inventory.indexOf(key)
            if (idx === -1) return newsletter.sendText(sock, m.chat, `*ITEMS*\n\nYou don't have that item.`, m)
            const item = ITEMS[key]
            player.inventory.splice(idx, 1)
            if (item.effect === 'heal') {
                const healed = Math.min(item.value, player.maxHp - player.hp)
                player.hp = Math.min(player.maxHp, player.hp + item.value)
                savePlayer(rpg, id, player)
                await m.react('💊')
                return newsletter.sendText(sock, m.chat,
                    `*${item.emoji} USED ${item.name}*\n\nHealed ${healed} HP!\nHP: ${player.hp}/${player.maxHp}`, m
                )
            }
            if (item.effect === 'atk') {
                player.atk += item.value
                savePlayer(rpg, id, player)
                await m.react('⚔️')
                return newsletter.sendText(sock, m.chat,
                    `*${item.emoji} EQUIPPED ${item.name}*\n\n+${item.value} ATK\nNew ATK: ${player.atk}`, m
                )
            }
            if (item.effect === 'def') {
                player.def += item.value
                savePlayer(rpg, id, player)
                await m.react('🛡️')
                return newsletter.sendText(sock, m.chat,
                    `*${item.emoji} EQUIPPED ${item.name}*\n\n+${item.value} DEF\nNew DEF: ${player.def}`, m
                )
            }
        }

        // ── Rank ──
        if (cmd === 'rpgrank') {
            const rpgData = loadRPG()
            const sorted = Object.entries(rpgData)
                .filter(([, p]) => p.class)
                .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
                .slice(0, 10)
            if (!sorted.length) return newsletter.sendText(sock, m.chat, '*RPG RANK*\n\nNo players yet.', m)
            const medals = ['🥇','🥈','🥉']
            const list = sorted.map(([uid, p], i) =>
                `${medals[i] || `${i+1}.`} @${uid} | Lv.${p.level} | ${CLASSES[p.class]?.emoji || ''} ${p.class}`
            ).join('\n')
            return newsletter.sendText(sock, m.chat, `*🏆 RPG LEADERBOARD*\n\n${list}`, m)
        }
    }
}
