import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notifdemote'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifDemote || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *DEMOTE NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notifdemote on
┣𖣠 ${m.prefix}notifdemote off
┗━━━━━━━━━

When enabled, bot will notify when someone is demoted from admin.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifDemote = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Demote notification has been turned ON', m)
        } else {
            groupData.notifDemote = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Demote notification has been turned OFF', m)
        }
    }
}