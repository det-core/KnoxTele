import newsletter from '../Bridge/newsletter.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion } from "@whiskeysockets/baileys"
import pino from 'pino'
import path from 'path'
import fs from 'fs'

export default {
    command: ['pair', 'pairing'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const phoneNumber = args[0]?.replace(/\D/g, '')
        
        if (!phoneNumber) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *PAIRING CODE*
┣𖣠 ${m.prefix}pair <phone number>
┣𖣠 Example: ${m.prefix}pair 2347030626048
┗━━━━━━━━━

Generates pairing code for WhatsApp Web.`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PAIRING*\n\nGenerating code for ${phoneNumber}...`, m)
        
        const sessionDir = path.join(process.cwd(), 'KnoxSession', `pair_${Date.now()}`)
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })
        
        try {
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
            const { version } = await fetchLatestWaWebVersion()
            
            const wa = makeWASocket({
                auth: state,
                version,
                logger: pino({ level: "silent" }),
                printQRInTerminal: false
            })
            
            wa.ev.on('creds.update', saveCreds)
            
            setTimeout(async () => {
                try {
                    const code = await wa.requestPairingCode(phoneNumber)
                    const pairCode = code.match(/.{1,4}/g)?.join('-') || code
                    
                    await newsletter.sendText(sock, m.chat,
                        `*PAIRING CODE GENERATED*\n\n` +
                        `Code: ${pairCode}\n\n` +
                        `Open WhatsApp > Linked Devices > Link a Device\n` +
                        `Enter this code to pair.`,
                        m
                    )
                    
                    // Clean up after 5 minutes
                    setTimeout(() => {
                        if (fs.existsSync(sessionDir)) {
                            fs.rmSync(sessionDir, { recursive: true, force: true })
                        }
                    }, 300000)
                    
                } catch (error) {
                    await newsletter.sendText(sock, m.chat,
                        `*PAIRING FAILED*\n\nError: ${error.message}`,
                        m
                    )
                }
            }, 3000)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat,
                `*PAIRING FAILED*\n\nError: ${error.message}`,
                m
            )
        }
    }
}