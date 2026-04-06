import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['owner', 'ownerinfo'],
    category: 'general',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const owners = [...new Set([global.ownerNumber, ...det.db.owner])]
        const admins = det.db.admin.filter(n => !owners.includes(n))

        const ownerVcards = owners.map(num => ({
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${global.ownerName}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD`
        }))

        try {
            await sock.sendMessage(m.chat, {
                contacts: { displayName: global.ownerName, contacts: ownerVcards }
            }, { quoted: m })
        } catch {}

        return newsletter.sendText(sock, m.chat,
            `*👑 KNOX OWNER INFO*\n\n` +
            `Name: *${global.ownerName}*\n` +
            `Telegram: ${global.ownerUsername}\n` +
            `Number: wa.me/${global.ownerNumber}\n\n` +
            `┏⧉ *Owners (${owners.length})*\n` +
            owners.map(n => `┣𖣠 @${n}`).join('\n') + `\n` +
            (admins.length ? `\n┏⧉ *Admins (${admins.length})*\n` + admins.map(n => `┣𖣠 @${n}`).join('\n') + '\n' : '') +
            `┗━━━━━━━━━`, m
        )
    }
}
