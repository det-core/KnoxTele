import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['adminpanel', 'apanel'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const ownerList = det.db.owner.length
            ? det.db.owner.map(n => `👑 @${n}`).join('\n')
            : `👑 @${global.ownerNumber} (hardcoded)`

        const adminList = det.db.admin.length
            ? det.db.admin.map(n => `🛡️ @${n}`).join('\n')
            : `🛡️ @${global.ownerNumber} (hardcoded)`

        const resellerList = det.db.reseller.length
            ? det.db.reseller.map(n => `💼 @${n}`).join('\n')
            : 'None'

        return newsletter.sendText(sock, m.chat,
            `*🔐 ADMIN PANEL*\n\n` +
            `┏⧉ *Owners*\n${ownerList}\n\n` +
            `┏⧉ *Admins*\n${adminList}\n\n` +
            `┏⧉ *Resellers (${det.db.reseller.length})*\n${resellerList}\n\n` +
            `┏⧉ *Settings*\n` +
            `┣𖣠 Free Trial: ${global.freeTrialEnabled ? '✅ ON' : '❌ OFF'} (${global.freeTrialDays}d)\n` +
            `┣𖣠 AntiBug: ${global.antibugEnabled ? '✅ ON' : '❌ OFF'}\n` +
            `┣𖣠 AntiCall: ${global.anticallEnabled ? '✅ ON' : '❌ OFF'}\n` +
            `┗━━━━━━━━━`, m
        )
    }
}
