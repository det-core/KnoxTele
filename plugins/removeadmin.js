import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['removeadmin', 'deladmin'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let target = null
        if (m.quoted) target = m.quoted.sender.split('@')[0]
        else if (m.mentionedJid?.length > 0) target = m.mentionedJid[0].split('@')[0]
        else if (args[0]) target = args[0].replace(/\D/g, '')

        if (!target) {
            return newsletter.sendText(sock, m.chat,
                `*REMOVE ADMIN*\n\nMention or reply to user.`, m
            )
        }

        if (det.isOwner(target)) {
            return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nCannot remove the owner from admin.`, m)
        }

        const idx = det.db.admin.indexOf(target)
        if (idx === -1) {
            return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\n@${target} is not an admin.`, m)
        }

        det.db.admin.splice(idx, 1)
        det.saveDB()
        await m.react('✅')
        return newsletter.sendText(sock, m.chat,
            `*✅ ADMIN REMOVED*\n\n@${target} is no longer an admin.`, m
        )
    }
}
