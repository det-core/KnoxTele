import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['listadmin', 'admins'],
    category: 'owner',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const owners = [...new Set([global.ownerNumber, ...det.db.owner])]
        const admins = [...new Set([...det.db.admin])]

        const ownerText = owners.map(n => `👑 @${n}`).join('\n') || 'None'
        const adminText = admins.filter(n => !owners.includes(n)).map(n => `🛡️ @${n}`).join('\n') || 'None'
        const resellerText = det.db.reseller.map(n => `💼 @${n}`).join('\n') || 'None'

        return newsletter.sendText(sock, m.chat,
            `*🔐 ROLE LIST*\n\n` +
            `┏⧉ *Owners*\n${ownerText}\n\n` +
            `┏⧉ *Admins*\n${adminText}\n\n` +
            `┏⧉ *Resellers*\n${resellerText}\n` +
            `┗━━━━━━━━━`, m
        )
    }
}
