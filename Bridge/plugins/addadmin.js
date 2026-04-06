import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['addadmin'],
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
                `*ADD ADMIN*\n\nMention or reply to user.\nExample: ${m.prefix}addadmin 2347030626048`, m
            )
        }

        if (det.isAdmin(target)) {
            return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\n@${target} is already an admin.`, m)
        }

        det.db.admin.push(target)
        det.saveDB()
        await m.react('✅')
        return newsletter.sendText(sock, m.chat,
            `*✅ ADMIN ADDED*\n\n@${target} is now an admin.`, m
        )
    }
}
