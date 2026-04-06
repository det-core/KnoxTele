import newsletter from '../Bridge/newsletter.js'
import fs from 'fs'

export default {
    command: ['broadcast', 'bc'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!text) {
            return newsletter.sendText(sock, m.chat,
                `*BROADCAST*\n\nUsage: ${m.prefix}broadcast <message>\n\nThis will send your message to all users in the database.`, m
            )
        }

        const sessionsFile = './database/sessions.json'
        let sessions = {}
        if (fs.existsSync(sessionsFile)) {
            sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'))
        }

        const phoneNumbers = Object.values(sessions).map(s => s.phoneNumber).filter(Boolean)
        if (!phoneNumbers.length) {
            return newsletter.sendText(sock, m.chat, '*BROADCAST*\n\nNo paired users found.', m)
        }

        await newsletter.sendText(sock, m.chat,
            `*📢 BROADCASTING...*\n\nSending to ${phoneNumbers.length} user(s)...`, m
        )

        let sent = 0, failed = 0
        for (const phone of phoneNumbers) {
            try {
                const jid = phone + '@s.whatsapp.net'
                await sock.sendMessage(jid, {
                    text: `*📢 KNOX BROADCAST*\n\n${text}\n\n— ${global.ownerName}`
                })
                sent++
                await new Promise(r => setTimeout(r, 500))
            } catch { failed++ }
        }

        await m.react('✅')
        return newsletter.sendText(sock, m.chat,
            `*📢 BROADCAST DONE*\n\nSent: ${sent} ✅\nFailed: ${failed} ❌`, m
        )
    }
}
