import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notifclosegroup', 'notifclose'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifCloseGroup || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *CLOSE GROUP NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notifclosegroup on
┣𖣠 ${m.prefix}notifclosegroup off
┗━━━━━━━━━

When enabled, bot will notify when group is closed.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifCloseGroup = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Close group notification has been turned ON', m)
        } else {
            groupData.notifCloseGroup = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Close group notification has been turned OFF', m)
        }
    }
}