import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['autodl', 'autodownload'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.autodl || false
        
        if (!option || option === 'status') {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTO DOWNLOAD SETTINGS*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}autodl on
┣𖣠 ${m.prefix}autodl off
┗━━━━━━━━━

*Supported Platforms:*
TikTok, Instagram, Facebook, YouTube, Twitter/X

When enabled, bot will auto-download social media links.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.autodl = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat,
                `*AUTO DOWNLOAD*\n\n✓ Auto download has been turned ON\nSupported: TikTok, Instagram, Facebook, YouTube`,
                m
            )
        } else if (option === 'off') {
            groupData.autodl = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat,
                `*AUTO DOWNLOAD*\n\n✓ Auto download has been turned OFF`,
                m
            )
        } else {
            await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nUse on or off', m)
        }
    }
}