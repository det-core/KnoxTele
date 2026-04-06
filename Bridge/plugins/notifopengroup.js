import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notifopengroup', 'notifopen'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifOpenGroup || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *OPEN GROUP NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notifopengroup on
┣𖣠 ${m.prefix}notifopengroup off
┗━━━━━━━━━

When enabled, bot will notify when group is opened.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifOpenGroup = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Open group notification has been turned ON', m)
        } else {
            groupData.notifOpenGroup = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Open group notification has been turned OFF', m)
        }
    }
}