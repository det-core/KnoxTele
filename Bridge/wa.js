import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    DisconnectReason,
    Browsers,
    downloadContentFromMessage
} from "@whiskeysockets/baileys"
import pino from 'pino'
import { Boom } from '@hapi/boom'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import './Bridge/config.js'
import { casesBot, Feature } from './knox.js'
import database from './Bridge/database.js'
import det from './Bridge/det.js'

const userId = process.argv[2]
const phoneNumber = process.argv[3]
const sessionPath = process.env.SESSION_PATH || path.join(__dirname, 'KnoxSession', `session_${userId}`)

// ─── ANTIBUG: Known malicious payload patterns ───────────────────────────────
const BUGBOT_PATTERNS = [
    /crash/i,
    /\u202e/,                         // RTL override
    /[\uFEFF]{3,}/,                   // BOM spam
    /[\u200B-\u200D]{5,}/,            // zero-width spam
    /viewOnce.*viewOnce/i,
    /document.*mimetype.*application\/x-ms-dos-executable/i,
]

function isMaliciousMessage(msg) {
    if (!global.antibugEnabled) return false
    try {
        const raw = JSON.stringify(msg.message || {})
        return BUGBOT_PATTERNS.some(p => p.test(raw))
    } catch {
        return false
    }
}

// ─── Message parser ───────────────────────────────────────────────────────────
async function parseMessage(sock, msg) {
    const m = {}
    m.key = msg.key
    m.message = msg.message
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.sender = m.fromMe
        ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
        : (m.key.participant || m.chat)

    m.isGroup = m.chat.endsWith('@g.us')
    m.isPrivate = !m.isGroup

    const type = Object.keys(m.message)[0]
    m.type = type

    if (type === 'conversation') m.body = m.message.conversation
    else if (type === 'extendedTextMessage') m.body = m.message.extendedTextMessage.text
    else if (type === 'imageMessage') m.body = m.message.imageMessage.caption || ''
    else if (type === 'videoMessage') m.body = m.message.videoMessage.caption || ''
    else if (type === 'stickerMessage') m.body = ''
    else if (type === 'audioMessage') m.body = ''
    else if (type === 'documentMessage') m.body = m.message.documentMessage.caption || ''
    else m.body = ''

    const prefixes = Array.isArray(global.prefixes) ? global.prefixes : ['.']
    const prefix = prefixes.find(p => m.body.startsWith(p))
    m.prefix = prefix || ''

    if (prefix) {
        const args = m.body.slice(prefix.length).trim().split(/ +/)
        m.command = args.shift().toLowerCase()
        m.args = args
        m.text = args.join(' ')
        m.fullArgs = m.body.slice(prefix.length).trim()
        m.isCommand = true
    } else {
        m.isCommand = false
    }

    const number = m.sender.split('@')[0]
    m.isOwner = det.isOwner(number)
    m.isReseller = det.isReseller(number)
    m.isAdmin = det.isAdmin(number)
    m.userRole = det.getUserRole(number)

    m.reply = async (text, options = {}) => {
        return await sock.sendMessage(m.chat, { text }, { quoted: msg, ...options })
    }

    m.react = async (emoji) => {
        return await sock.sendMessage(m.chat, {
            react: { text: emoji, key: msg.key }
        })
    }

    m.download = async () => {
        const type = Object.keys(msg.message)[0]
        const content = msg.message[type]
        if (!content) return null
        const stream = await downloadContentFromMessage(content, type.replace('Message', ''))
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = {
            message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
            key: {
                remoteJid: m.chat,
                fromMe: msg.message.extendedTextMessage.contextInfo.participant === sock.user.id,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
            }
        }
        m.quoted = await parseMessage(sock, quotedMsg)
    }

    m.mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []

    if (m.isGroup) {
        database.updateChatStats(m.chat, m.sender)
    }

    return m
}

// ─── Auto-join channels & groups after pairing ───────────────────────────────
async function autoJoinOnConnect(sock) {
    // Join WhatsApp newsletters/channels
    if (global.autoJoinNewsletters && global.autoJoinNewsletters.length > 0) {
        for (const jid of global.autoJoinNewsletters) {
            try {
                await sock.newsletterFollow(jid)
                console.log(chalk.cyan(`[AUTO-JOIN] Newsletter: ${jid}`))
            } catch (e) {
                console.log(chalk.yellow(`[AUTO-JOIN] Newsletter failed: ${jid} - ${e.message}`))
            }
        }
    }

    // Join WhatsApp groups
    if (global.autoJoinGroups && global.autoJoinGroups.length > 0) {
        for (const jid of global.autoJoinGroups) {
            try {
                // If it's an invite link, use invite link method
                if (jid.includes('chat.whatsapp.com')) {
                    const code = jid.split('/').pop()
                    await sock.groupAcceptInvite(code)
                } else {
                    // Direct JID
                    await sock.groupAcceptInvite(jid)
                }
                console.log(chalk.cyan(`[AUTO-JOIN] Group: ${jid}`))
            } catch (e) {
                console.log(chalk.yellow(`[AUTO-JOIN] Group failed: ${jid} - ${e.message}`))
            }
        }
    }
}

// ─── Main WA session ─────────────────────────────────────────────────────────
async function startWA() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestWaWebVersion()

    const sock = makeWASocket({
        browser: Browsers.ubuntu("Firefox"),
        printQRInTerminal: false,
        auth: state,
        version,
        logger: pino({ level: "silent" }),
        syncFullHistory: false
    })

    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber)
                const pair = code.slice(0, 4) + "-" + code.slice(4, 8)
                console.log(`Your ${global.pairingCode} Pairing code : ${pair}`)
            } catch (error) {
                console.log("Pairing Code Error:", error)
            }
        }, 3000)
    }

    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason === DisconnectReason.loggedOut) {
                console.log("Logged out")
                process.exit()
            } else {
                console.log("Reconnecting...")
                startWA()
            }
        }

        if (connection === "open") {
            console.log(chalk.green("WhatsApp Connected"))
            const jid = sock.user.id

            // Send connected notification to self
            await sock.sendMessage(jid, { text: "*KNOX INFO*\n\n✅ WhatsApp Connected Successfully\n\nBot is now active and ready." })

            // AUTO-JOIN: newsletters and groups
            setTimeout(() => autoJoinOnConnect(sock), 3000)
        }
    })

    // ─── Anti-Call ───────────────────────────────────────────────────────────
    sock.ev.on('call', async (calls) => {
        const [call] = calls
        if (call.status === 'offer') {
            try {
                if (!global.anticallEnabled) return
                const caller = call.from
                const callerNumber = caller.split('@')[0]
                await sock.rejectCall(call.id, call.from)

                if (!global.callViolations) global.callViolations = new Map()
                const violations = global.callViolations.get(caller) || 0
                const newCount = violations + 1
                global.callViolations.set(caller, newCount)

                if (newCount >= 3) {
                    await sock.updateBlockStatus(caller, 'block')
                    await sock.sendMessage(caller, {
                        text: `*KNOX ANTI-CALL*\n\nYou have been BLOCKED for making 3 calls to the bot.\nDo NOT call bot numbers. Use text messages only.`
                    })
                    global.callViolations.delete(caller)
                } else {
                    const warningsLeft = 3 - newCount
                    await sock.sendMessage(caller, {
                        text: `*KNOX ANTI-CALL*\n\n⚠️ WARNING ${newCount}/3\n\nDo NOT call the bot.\n${warningsLeft} warning(s) left before you get blocked.`
                    })
                }
            } catch (error) {
                console.log('Anti-call error:', error.message)
            }
        }
    })

    // ─── Message Handler ─────────────────────────────────────────────────────
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            if (chatUpdate.type !== "notify") return
            const msg = chatUpdate.messages[0]
            if (!msg?.message) return

            // ─── ANTIBUG check ────────────────────────────────────────────
            if (isMaliciousMessage(msg)) {
                const sender = msg.key.participant || msg.key.remoteJid
                console.log(chalk.red(`[ANTIBUG] Malicious message from: ${sender}`))
                try {
                    // Block the sender
                    if (global.antibugBlockSender) {
                        const senderJid = sender.includes('@') ? sender : sender + '@s.whatsapp.net'
                        await sock.updateBlockStatus(senderJid, 'block')
                        console.log(chalk.red(`[ANTIBUG] Blocked: ${senderJid}`))
                    }
                    // Notify owner
                    for (const ownerNum of global.owner) {
                        const ownerJid = ownerNum + '@s.whatsapp.net'
                        await sock.sendMessage(ownerJid, {
                            text: `*🛡️ ANTIBUG ALERT*\n\nMalicious script detected & blocked!\nSender: @${sender.split('@')[0]}\nChat: ${msg.key.remoteJid}`,
                            mentions: [sender.includes('@') ? sender : sender + '@s.whatsapp.net']
                        })
                    }
                } catch (e) {
                    console.log('[ANTIBUG] Action error:', e.message)
                }
                return // Drop the message
            }

            const m = await parseMessage(sock, msg)
            if (!m.isCommand) return

            const isOwner = det.isOwner(m.sender)
            if (!Feature.public && !isOwner && !m.fromMe) return

            await casesBot(sock, m, chatUpdate)

        } catch (err) {
            console.log("Message Error:", err)
        }
    })
}

startWA()
