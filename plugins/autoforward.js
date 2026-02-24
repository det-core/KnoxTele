import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['autoforward', 'autofw'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.autoforward || false
        
        if (!option) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTO FORWARD SETTINGS*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}autoforward on
┣𖣠 ${m.prefix}autoforward off
┗━━━━━━━━━

When enabled, all messages will be forwarded to this group.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.autoforward = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat,
                `*AUTO FORWARD*\n\n✓ Auto forward has been turned ON`,
                m
            )
        } else if (option === 'off') {
            groupData.autoforward = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat,
                `*AUTO FORWARD*\n\n✓ Auto forward has been turned OFF`,
                m
            )
        } else {
            await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nUse on or off', m)
        }
    }
}