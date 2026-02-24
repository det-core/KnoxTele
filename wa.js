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
    
    m.reply = async (text, options = {}) => {
        return await sock.sendMessage(m.chat, { text }, { quoted: msg, ...options })
    }
    
    m.react = async (emoji) => {
        return await sock.sendMessage(m.chat, {
            react: {
                text: emoji,
                key: msg.key
            }
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
        
        const quoted = await parseMessage(sock, quotedMsg)
        m.quoted = quoted
    }
    
    m.mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
    
    if (m.isGroup) {
        database.updateChatStats(m.chat, m.sender)
    }
    
    return m
}

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
            await sock.sendMessage(jid, { text: "*KNOX INFO*\n\nWhatsApp Connected Successfully" })
        }
    })

    // Anti-call handler
    sock.ev.on('call', async (calls) => {
        const [call] = calls
        if (call.status === 'offer') {
            try {
                if (!global.anticallEnabled) return
                
                const caller = call.from
                const callerNumber = caller.split('@')[0]
                
                await sock.rejectCall(call.id, call.from)
                
                const callViolations = global.callViolations || new Map()
                if (!global.callViolations) global.callViolations = callViolations
                
                const violations = callViolations.get(caller) || 0
                const newCount = violations + 1
                callViolations.set(caller, newCount)
                
                if (newCount >= 3) {
                    await sock.updateBlockStatus(caller, 'block')
                    await sock.sendMessage(caller, {
                        text: `*KNOX ANTI-CALL SYSTEM*\n\nYou have been BLOCKED for making 3 calls to the bot.\nPlease DO NOT call bot numbers.\nUse text messages only.`
                    })
                    
                    for (const owner of global.owner) {
                        const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net'
                        await sock.sendMessage(ownerJid, {
                            text: `*ANTI-CALL ALERT*\n\nUser @${callerNumber} has been BLOCKED for 3 call violations.`,
                            mentions: [caller]
                        })
                    }
                    
                    callViolations.delete(caller)
                } else {
                    const warningsLeft = 3 - newCount
                    await sock.sendMessage(caller, {
                        text: `*KNOX ANTI-CALL SYSTEM*\n\n⚠️ WARNING ${newCount}/3\n\nPlease DO NOT call the bot.\nYou have ${warningsLeft} warning${warningsLeft > 1 ? 's' : ''} left before being blocked.\n\nUse text messages only.`
                    })
                }
            } catch (error) {
                console.log('Anti-call error:', error.message)
            }
        }
    })

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            if (chatUpdate.type !== "notify") return
            
            const msg = chatUpdate.messages[0]
            if (!msg?.message) return

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