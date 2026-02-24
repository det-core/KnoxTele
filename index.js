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

const bot = new TelegramBot("8110692904:AAFHnlFdOdEfC9h_KQMFpolLP5Zebw-A-cQ", { polling: true })
const bridge = new WhatsAppBridge()

global.pendingPair = {}

global.det.checkMembership = async (userId) => {
    if (!global.requiredChannels || global.requiredChannels.length === 0) return true
    
    for (let channel of global.requiredChannels) {
        try {
            const member = await bot.getChatMember(channel, userId)
            if (member.status === "left" || member.status === "kicked") return false
        } catch {
            return false
        }
    }
    return true
}

global.det.mainMenu = (id) => {
    const status = global.det.isOwner(id) ? "Owner" :
                   global.det.isReseller(id) ? "Reseller" :
                   "User"

    return `*KNOX INFO* 
> Bot name : *${global.nameBot}*
> Developer : *${global.ownerName}*
> Version : *${global.versionBot}*
> Runtime : *${runtime(process.uptime())}*
> Bot mode : *public*
> Status : *${status}*

┏⧉ *General Menu* 
┣𖣠 /reqpair
┣𖣠 /delsess
┣𖣠 /help
┣𖣠 /list
┗━━━━━━━━━━━━━❖`
}

global.det.startHandler = async (msg) => {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const id = String(msg.from.id)

    const joined = await global.det.checkMembership(userId)

    if (!joined && global.requiredChannels && global.requiredChannels.length > 0) {
        return bot.sendMessage(chatId,
`*KNOX INFO*

You must join required channels before using KNOX`,
        {
            reply_markup: {
                inline_keyboard: global.requiredChannels.map(ch => [
                    { text: ch, url: `https://t.me/${ch.replace("@", "")}` }
                ]).concat([
                    [{ text: "VERIFY", callback_data: "verify_join" }]
                ])
            }
        })
    }

    const menuText = global.det.mainMenu(id)
    
    if (global.img && global.img.telegram) {
        try {
            const response = await axios.get(global.img.telegram, { responseType: 'arraybuffer' })
            const imageBuffer = Buffer.from(response.data)
            
            await bot.sendPhoto(chatId, imageBuffer, {
                caption: menuText,
                parse_mode: "Markdown"
            })
            
            if (global.music && global.music.menu) {
                try {
                    const musicResponse = await axios.get(global.music.menu, { responseType: 'arraybuffer' })
                    const musicBuffer = Buffer.from(musicResponse.data)
                    
                    await bot.sendAudio(chatId, musicBuffer, {
                        title: "KNOX Menu Music",
                        performer: global.ownerName
                    })
                } catch (musicError) {
                    console.log('Music send error:', musicError.message)
                }
            }
        } catch {
            await bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" })
        }
    } else {
        await bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" })
    }
}

global.det.reqpair = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    const existingSession = bridge.checkSession(userId)
    if (existingSession) {
        return bot.sendMessage(chatId, 
            `*KNOX INFO*\n\nYou already have an active session\nUse /delsess to remove it`
        )
    }
    
    bot.sendMessage(chatId, `*KNOX PAIRING*\n\nSend your WhatsApp number with country code\nExample: 2347030626048`)
    
    global.pendingPair[userId] = true
}

global.det.delsess = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    await bridge.stopSession(userId, bot)
}

global.det.help = async (msg) => {
    const chatId = msg.chat.id
    
    const helpText = `*KNOX HELP*

┏⧉ *Commands*
┣𖣠 /start - Start the bot
┣𖣠 /reqpair - Request WhatsApp pairing
┣𖣠 /delsess - Delete active session
┣𖣠 /list - List all sessions
┣𖣠 /help - Show this help
┗━━━━━━━━━

Updates and inquiries:
${global.ownerUsername}`

    if (global.img && global.img.owner) {
        try {
            const response = await axios.get(global.img.owner, { responseType: 'arraybuffer' })
            const imageBuffer = Buffer.from(response.data)
            
            await bot.sendPhoto(chatId, imageBuffer, {
                caption: helpText,
                parse_mode: "Markdown"
            })
        } catch {
            await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" })
        }
    } else {
        await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" })
    }
}

global.det.list = async (msg) => {
    const sessionsFile = './database/sessions.json'
    let sessions = {}
    
    if (fs.existsSync(sessionsFile)) {
        sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'))
    }
    
    const sessionList = Object.keys(sessions).map(id => {
        const s = sessions[id]
        return `ID: ${id}\nNumber: ${s.phoneNumber}\nPaired: ${new Date(s.pairedAt).toLocaleString()}`
    }).join('\n\n')
    
    bot.sendMessage(msg.chat.id,
        `*ACTIVE SESSIONS*\n\n${sessionList || 'No active sessions'}`,
        { parse_mode: "Markdown" }
    )
}

bot.on("message", async (msg) => {
    if (!msg.text) return
    
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    
    if (global.pendingPair && global.pendingPair[userId]) {
        if (/^\d{10,15}$/.test(text.replace(/\D/g, ''))) {
            delete global.pendingPair[userId]
            const phone = text.replace(/\D/g, '')
            
            bot.sendMessage(chatId, `*KNOX PAIRING*\n\nStarting session...`)
            
            const result = await bridge.startSession(userId, phone, bot)
            
            if (!result.success) {
                bot.sendMessage(chatId, `*KNOX INFO*\n\n${result.message}`)
            }
        } else {
            bot.sendMessage(chatId, `*KNOX INFO*\n\nInvalid number\nUse format: 2347030626048`)
        }
        return
    }
    
    const parsed = global.det.parseCommand(msg.text)
    if (!parsed) return

    const { command } = parsed

    if (command === "start") return global.det.startHandler(msg)
    if (command === "reqpair") return global.det.reqpair(msg, bot)
    if (command === "delsess") return global.det.delsess(msg, bot)
    if (command === "help") return global.det.help(msg)
    if (command === "list") return global.det.list(msg)
})

bot.on("callback_query", async (query) => {
    if (query.data === "verify_join") {
        return global.det.startHandler(query.message)
    }
})

console.log(chalk.green("KNOX Telegram Bot Running"))