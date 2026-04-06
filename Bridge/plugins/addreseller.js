import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['addreseller'],
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
                `*ADD RESELLER*\n\nMention, reply to, or provide the number of the user.\nExample: ${m.prefix}addreseller 2347030626048`, m
            )
        }

        if (det.isReseller(target) && !det.isOwner(target)) {
            return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\n@${target} is already a reseller.`, m)
        }

        if (!det.db.reseller.includes(target)) {
            det.db.reseller.push(target)
            det.saveDB()
        }

        const targetJid = target + '@s.whatsapp.net'
        try {
            await sock.sendMessage(targetJid, {
                text: `*✅ YOU ARE NOW A RESELLER*\n\nWelcome to the KNOX reseller program!\n\nYou can now:\n• Create coupon codes for customers\n• Pair with the bot\n\nContact @knoxprime for support.`
            })
        } catch {}

        await m.react('✅')
        return newsletter.sendText(sock, m.chat,
            `*✅ RESELLER ADDED*\n\n@${target} is now a reseller.\nThey can create coupons and pair with the bot.`, m
        )
    }
}
