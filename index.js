import TelegramBot from "node-telegram-bot-api"
import chalk from "chalk"
import { runtime } from "./Bridge/utils.js"
import WhatsAppBridge from "./bridge.js"
import det from "./Bridge/det.js"
import database from "./Bridge/database.js"
import axios from "axios"
import fs from "fs"

await import("./Bridge/config.js")

global.det = det

// ══════════════════════════════════════════════════════════════════════════════
// ── ROLE CHECKS (Telegram side uses Telegram IDs, not WA numbers) ─────────────
// ══════════════════════════════════════════════════════════════════════════════

function isOwnerTg(userId) {
    const id = String(userId)
    return id === String(global.ownerTelegramId) ||
           (global.adminTelegramIds || []).includes(id)
}

function isAdminTg(userId) {
    const id = String(userId)
    return id === String(global.ownerTelegramId) ||
           (global.adminTelegramIds || []).includes(id)
}

function isResellerTg(userId) {
    const id = String(userId)
    // Check hardcoded reseller Telegram IDs
    if ((global.resellerTelegramIds || []).includes(id)) return true
    // Also check reseller.json (for resellers added via /addreseller command)
    const resellers = loadJSON(resellerFile, [])
    return Array.isArray(resellers) && resellers.includes(id)
}

// ══════════════════════════════════════════════════════════════════════════════
// ── JSON helpers ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const trialFile    = './database/trials.json'
const couponFile   = './database/coupons.json'
const resellerFile = './database/reseller.json'

function loadJSON(file, def = {}) {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def }
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return def }
}
function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FREE TRIAL helpers ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function hasActiveTrial(userId) {
    const trials = loadJSON(trialFile)
    const t = trials[String(userId)]
    return t ? Date.now() < t.expiresAt : false
}

function getTrialExpiry(userId) {
    const trials = loadJSON(trialFile)
    return trials[String(userId)]?.expiresAt || null
}

function activateTrial(userId, hours) {
    const trials = loadJSON(trialFile)
    trials[String(userId)] = {
        activatedAt: Date.now(),
        expiresAt: Date.now() + hours * 3600000
    }
    saveJSON(trialFile, trials)
}

function canUseBot(userId) {
    const id = String(userId)
    if (isOwnerTg(id)) return true
    if (isResellerTg(id)) return true
    if (hasActiveTrial(id)) return true
    if (global.freeTrialEnabled) return true
    return false
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COUPON helpers ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function createCoupon(code, hours, createdBy) {
    const coupons = loadJSON(couponFile)
    coupons[code.toUpperCase()] = {
        hours,
        createdBy: String(createdBy),
        used: false,
        usedBy: null,
        createdAt: Date.now()
    }
    saveJSON(couponFile, coupons)
}

function redeemCoupon(code, userId) {
    const coupons = loadJSON(couponFile)
    const c = coupons[code.toUpperCase()]
    if (!c) return { success: false, msg: 'Invalid coupon code.' }
    if (c.used) return { success: false, msg: 'Coupon already used.' }
    c.used = true
    c.usedBy = String(userId)
    c.usedAt = Date.now()
    saveJSON(couponFile, coupons)
    activateTrial(userId, c.hours)
    return { success: true, hours: c.hours }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── RESELLER helpers ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function addResellerTg(userId) {
    let resellers = loadJSON(resellerFile, [])
    if (!Array.isArray(resellers)) resellers = []
    if (!resellers.includes(String(userId))) {
        resellers.push(String(userId))
        saveJSON(resellerFile, resellers)
    }
}

function removeResellerTg(userId) {
    let resellers = loadJSON(resellerFile, [])
    if (!Array.isArray(resellers)) resellers = []
    resellers = resellers.filter(r => r !== String(userId))
    saveJSON(resellerFile, resellers)
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BOT INIT ──────────────────────────────────────════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

const bot = new TelegramBot("8110692904:AAFHnlFdOdEfC9h_KQMFpolLP5Zebw-A-cQ", { polling: true })
const bridge = new WhatsAppBridge()

global.pendingPair = {}

// ── Membership check ──────────────────────────────────────────────────────────
global.det.checkMembership = async (userId) => {
    if (!global.requiredChannels || global.requiredChannels.length === 0) return true
    for (let channel of global.requiredChannels) {
        try {
            const member = await bot.getChatMember(channel, userId)
            if (member.status === "left" || member.status === "kicked") return false
        } catch { return false }
    }
    return true
}

// ── Main menu ─────────────────────────────────────────────────────────────────
global.det.mainMenu = (userId) => {
    const id = String(userId)
    let status = '👤 User'
    if (isOwnerTg(id))        status = '👑 Owner'
    else if (isAdminTg(id))   status = '🛡️ Admin'
    else if (isResellerTg(id)) status = '💼 Reseller'
    else if (hasActiveTrial(id)) {
        const exp = new Date(getTrialExpiry(id)).toLocaleString()
        status = `🎁 Trial (expires: ${exp})`
    }

    return `*🤖 KNOX BOT*
> Bot: *${global.nameBot}*
> Dev: *${global.ownerName}*
> Version: *${global.versionBot}*
> Status: *${status}*

┏⧉ *Commands*
┣𖣠 /start - Main menu
┣𖣠 /reqpair - Pair WhatsApp
┣𖣠 /delsess - Delete session
┣𖣠 /help - Help & commands
┣𖣠 /list - Your sessions
┣𖣠 /redeem <code> - Redeem coupon
┗━━━━━━━━━━━━━❖`
}

// ── Start handler ─────────────────────────────────────────────────────────────
global.det.startHandler = async (msg) => {
    const chatId = msg.chat.id
    const userId = msg.from.id

    const joined = await global.det.checkMembership(userId)
    if (!joined && global.requiredChannels?.length > 0) {
        return bot.sendMessage(chatId,
            `*KNOX INFO*\n\nYou must join our channel before using KNOX.`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: global.requiredChannels.map(ch => ([
                        { text: `📢 Join ${ch}`, url: `https://t.me/${ch.replace("@", "")}` }
                    ])).concat([[{ text: "✅ I've Joined - Verify", callback_data: "verify_join" }]])
                }
            }
        )
    }

    const menuText = global.det.mainMenu(userId)
    try {
        if (global.img?.telegram) {
            const response = await axios.get(global.img.telegram, { responseType: 'arraybuffer' })
            await bot.sendPhoto(chatId, Buffer.from(response.data), {
                caption: menuText, parse_mode: "Markdown"
            })
        } else {
            await bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" })
        }
    } catch {
        await bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" })
    }
}

// ── Reqpair handler ───────────────────────────────────────────────────────────
global.det.reqpair = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (!canUseBot(userId)) {
        return bot.sendMessage(chatId,
            `*⛔ ACCESS DENIED*\n\nFree trial is currently OFF.\n\nContact CODEBREAKER to purchase access:`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: "💬 Contact @knoxprime (CODEBREAKER)", url: "https://t.me/knoxprime" }
                    ]]
                }
            }
        )
    }

    const existingSession = bridge.checkSession(userId)
    if (existingSession) {
        return bot.sendMessage(chatId,
            `*KNOX INFO*\n\nYou already have an active session.\nUse /delsess to remove it first.`,
            { parse_mode: 'Markdown' }
        )
    }

    bot.sendMessage(chatId,
        `*🔗 KNOX PAIRING*\n\nSend your WhatsApp number with country code.\nExample: \`2347030626048\``,
        { parse_mode: 'Markdown' }
    )
    global.pendingPair[userId] = true
}

global.det.delsess = async (msg, bot) => {
    await bridge.stopSession(msg.from.id, bot)
}

// ── Help handler ──────────────────────────────────────────────────────────────
global.det.help = async (msg) => {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const id = String(userId)

    let roleSection = ''
    if (isOwnerTg(id) || isAdminTg(id)) {
        roleSection = `\n┏⧉ *👑 Owner/Admin Commands*
┣𖣠 /freetrial on/off - Toggle free trial
┣𖣠 /freetrial <days> - Set trial duration
┣𖣠 /givetrial <userId> <hrs> - Give trial
┣𖣠 /broadcast <msg> - Broadcast to all users
┣𖣠 /createcoupon <CODE> <hrs> - Create coupon
┣𖣠 /listcoupons - List all coupons
┣𖣠 /addreseller <telegramId> - Add reseller
┣𖣠 /removereseller <telegramId> - Remove reseller
┣𖣠 /listresellers - List resellers
┗━━━━━━━━━`
    } else if (isResellerTg(id)) {
        roleSection = `\n┏⧉ *💼 Reseller Commands*
┣𖣠 /createcoupon <CODE> <hrs> - Create coupon
┗━━━━━━━━━`
    }

    const helpText = `*📖 KNOX HELP*

┏⧉ *User Commands*
┣𖣠 /start - Main menu
┣𖣠 /reqpair - Pair WhatsApp
┣𖣠 /delsess - Delete session
┣𖣠 /list - Your sessions
┣𖣠 /redeem <code> - Redeem coupon for trial
┗━━━━━━━━━${roleSection}

Contact: ${global.ownerUsername}`

    try {
        if (global.img?.owner) {
            const response = await axios.get(global.img.owner, { responseType: 'arraybuffer' })
            await bot.sendPhoto(chatId, Buffer.from(response.data), {
                caption: helpText, parse_mode: "Markdown"
            })
        } else {
            await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" })
        }
    } catch {
        await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" })
    }
}

// ── List handler ──────────────────────────────────────────────────────────────
global.det.list = async (msg) => {
    const sessionsFile = './database/sessions.json'
    let sessions = {}
    if (fs.existsSync(sessionsFile)) {
        sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'))
    }

    const userId = String(msg.from.id)
    const isAdmin = isAdminTg(userId)
    const filtered = isAdmin ? sessions : Object.fromEntries(
        Object.entries(sessions).filter(([k]) => k === userId)
    )

    const sessionList = Object.entries(filtered).map(([id, s]) =>
        `👤 TG ID: \`${id}\`\n📱 WA: \`${s.phoneNumber}\`\n🕒 Paired: ${new Date(s.pairedAt).toLocaleString()}`
    ).join('\n\n')

    bot.sendMessage(msg.chat.id,
        `*📋 ${isAdmin ? 'ALL' : 'YOUR'} SESSIONS*\n\n${sessionList || 'No active sessions'}`,
        { parse_mode: "Markdown" }
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MESSAGE ROUTER ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

bot.on("message", async (msg) => {
    if (!msg.text) return
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text.trim()
    const id = String(userId)
    const args = text.split(' ').slice(1)

    // ── Handle phone number input for pairing ──
    if (global.pendingPair?.[userId]) {
        if (/^\d{10,15}$/.test(text.replace(/\D/g, ''))) {
            delete global.pendingPair[userId]
            const phone = text.replace(/\D/g, '')
            bot.sendMessage(chatId,
                `*⏳ KNOX PAIRING*\n\nStarting session for \`${phone}\`...`,
                { parse_mode: 'Markdown' }
            )
            const result = await bridge.startSession(userId, phone, bot)
            if (!result.success) {
                bot.sendMessage(chatId, `*❌ KNOX INFO*\n\n${result.message}`, { parse_mode: 'Markdown' })
            }
        } else {
            bot.sendMessage(chatId,
                `*KNOX INFO*\n\nInvalid number. Send digits only.\nExample: \`2347030626048\``,
                { parse_mode: 'Markdown' }
            )
        }
        return
    }

    const parsed = global.det.parseCommand(text)
    if (!parsed) return
    const { command } = parsed

    // ── Public commands ────────────────────────────────────────────────────
    if (command === "start")   return global.det.startHandler(msg)
    if (command === "reqpair") return global.det.reqpair(msg, bot)
    if (command === "delsess") return global.det.delsess(msg, bot)
    if (command === "help")    return global.det.help(msg)
    if (command === "list")    return global.det.list(msg)

    // ── Redeem coupon (any user) ───────────────────────────────────────────
    if (command === "redeem") {
        const code = args[0]?.toUpperCase()
        if (!code) return bot.sendMessage(chatId, `Usage: /redeem <CODE>`, { parse_mode: 'Markdown' })
        const result = redeemCoupon(code, userId)
        if (result.success) {
            return bot.sendMessage(chatId,
                `*✅ COUPON REDEEMED!*\n\nYou have *${result.hours} hour(s)* of free trial activated!\nEnjoy KNOX 🚀`,
                { parse_mode: 'Markdown' }
            )
        }
        return bot.sendMessage(chatId, `*❌ REDEEM FAILED*\n\n${result.msg}`, { parse_mode: 'Markdown' })
    }

    // ── Reseller + Admin commands ──────────────────────────────────────────
    if (!isAdminTg(id) && !isResellerTg(id)) return

    if (command === "createcoupon") {
        const [code, hoursStr] = args
        const hours = parseInt(hoursStr)
        if (!code || isNaN(hours) || hours < 1) {
            return bot.sendMessage(chatId,
                `*CREATE COUPON*\n\nUsage: /createcoupon <CODE> <hours>\nExample: /createcoupon VIP24 24`,
                { parse_mode: 'Markdown' }
            )
        }
        createCoupon(code, hours, userId)
        return bot.sendMessage(chatId,
            `*✅ COUPON CREATED*\n\nCode: \`${code.toUpperCase()}\`\nDuration: ${hours} hour(s)\n\nShare with your customer to redeem.`,
            { parse_mode: 'Markdown' }
        )
    }

    // ── Admin-only commands below ──────────────────────────────────────────
    if (!isAdminTg(id)) return

    if (command === "freetrial") {
        const arg = args[0]?.toLowerCase()
        if (arg === 'on') {
            global.freeTrialEnabled = true
            return bot.sendMessage(chatId, `*✅ FREE TRIAL ON*\n\nAll users can now pair with the bot.`, { parse_mode: 'Markdown' })
        }
        if (arg === 'off') {
            global.freeTrialEnabled = false
            return bot.sendMessage(chatId, `*🔒 FREE TRIAL OFF*\n\nOnly resellers and coupon holders can pair.`, { parse_mode: 'Markdown' })
        }
        const days = parseInt(arg)
        if (!isNaN(days) && days > 0) {
            global.freeTrialDays = days
            return bot.sendMessage(chatId, `*✅ TRIAL DURATION SET*\n\n${days} day(s) per session.`, { parse_mode: 'Markdown' })
        }
        return bot.sendMessage(chatId,
            `*FREE TRIAL*\n\nStatus: ${global.freeTrialEnabled ? '✅ ON' : '❌ OFF'}\nDays: ${global.freeTrialDays}\n\n/freetrial on\n/freetrial off\n/freetrial <days>`,
            { parse_mode: 'Markdown' }
        )
    }

    if (command === "givetrial") {
        const targetId = args[0]
        const hours = parseInt(args[1]) || 24
        if (!targetId) return bot.sendMessage(chatId, `Usage: /givetrial <telegramUserId> <hours>`, { parse_mode: 'Markdown' })
        activateTrial(targetId, hours)
        try { await bot.sendMessage(targetId, `*🎁 FREE TRIAL ACTIVATED*\n\nYou have been given *${hours} hour(s)* of free trial by the admin!\nUse /reqpair to get started.`, { parse_mode: 'Markdown' }) } catch {}
        return bot.sendMessage(chatId, `*✅ TRIAL GIVEN*\n\nUser \`${targetId}\` now has ${hours} hour(s) of free trial.`, { parse_mode: 'Markdown' })
    }

    if (command === "broadcast") {
        const broadcastMsg = args.join(' ')
        if (!broadcastMsg) return bot.sendMessage(chatId, `Usage: /broadcast <message>`)
        const sessions = fs.existsSync('./database/sessions.json')
            ? JSON.parse(fs.readFileSync('./database/sessions.json', 'utf8'))
            : {}
        let sent = 0, failed = 0
        for (const uid of Object.keys(sessions)) {
            try {
                await bot.sendMessage(uid, `*📢 KNOX BROADCAST*\n\n${broadcastMsg}`, { parse_mode: 'Markdown' })
                sent++
            } catch { failed++ }
        }
        return bot.sendMessage(chatId, `*📢 BROADCAST DONE*\n\nSent: ${sent} ✅\nFailed: ${failed} ❌`, { parse_mode: 'Markdown' })
    }

    if (command === "addreseller") {
        const targetId = args[0]
        if (!targetId) return bot.sendMessage(chatId, `Usage: /addreseller <telegramUserId>\n\n_Get their ID by having them message @userinfobot_`, { parse_mode: 'Markdown' })
        addResellerTg(targetId)
        try { await bot.sendMessage(targetId, `*✅ YOU ARE NOW A RESELLER*\n\nWelcome to KNOX reseller program!\nYou can now pair the bot and create coupon codes.\n\nContact @knoxprime for support.`, { parse_mode: 'Markdown' }) } catch {}
        return bot.sendMessage(chatId,
            `*✅ RESELLER ADDED*\n\nTelegram ID: \`${targetId}\` is now a reseller.\nThey can pair the bot and create coupons.`,
            { parse_mode: 'Markdown' }
        )
    }

    if (command === "removereseller") {
        const targetId = args[0]
        if (!targetId) return bot.sendMessage(chatId, `Usage: /removereseller <telegramUserId>`, { parse_mode: 'Markdown' })
        removeResellerTg(targetId)
        return bot.sendMessage(chatId, `*✅ RESELLER REMOVED*\n\n\`${targetId}\` is no longer a reseller.`, { parse_mode: 'Markdown' })
    }

    if (command === "listresellers") {
        const resellers = loadJSON(resellerFile, [])
        const hardcoded = global.resellerTelegramIds || []
        const all = [...new Set([...hardcoded, ...(Array.isArray(resellers) ? resellers : [])])]
        return bot.sendMessage(chatId,
            `*💼 RESELLERS*\n\n${all.length ? all.map((r, i) => `${i+1}. \`${r}\``).join('\n') : 'No resellers yet.'}`,
            { parse_mode: 'Markdown' }
        )
    }

    if (command === "listcoupons") {
        const coupons = loadJSON(couponFile)
        if (!Object.keys(coupons).length) return bot.sendMessage(chatId, `*COUPONS*\n\nNo coupons created yet.`, { parse_mode: 'Markdown' })
        let out = `*📋 ALL COUPONS*\n\n`
        for (const [code, c] of Object.entries(coupons)) {
            out += `Code: \`${code}\`\nHours: ${c.hours}h\nBy: \`${c.createdBy}\`\nUsed: ${c.used ? `✅ by \`${c.usedBy}\`` : '❌'}\n\n`
        }
        return bot.sendMessage(chatId, out, { parse_mode: 'Markdown' })
    }
})

bot.on("callback_query", async (query) => {
    if (query.data === "verify_join") {
        bot.answerCallbackQuery(query.id, { text: 'Checking...' })
        return global.det.startHandler(query.message)
    }
})

console.log(chalk.green.bold("✅ KNOX Telegram Bot Running"))
console.log(chalk.cyan(`Owner TG ID: ${global.ownerTelegramId} | Owner WA: ${global.ownerNumber}`))
