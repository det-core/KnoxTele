import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notifpromote'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifPromote || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *PROMOTE NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notifpromote on
┣𖣠 ${m.prefix}notifpromote off
┗━━━━━━━━━

When enabled, bot will notify when someone is promoted to admin.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifPromote = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Promote notification has been turned ON', m)
        } else {
            groupData.notifPromote = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Promote notification has been turned OFF', m)
        }
    }
}