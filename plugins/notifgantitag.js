import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notifgantitag', 'notiflabel'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifLabelChange || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *LABEL CHANGE NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notifgantitag on
┣𖣠 ${m.prefix}notifgantitag off
┗━━━━━━━━━

When enabled, bot will notify when member labels are changed.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifLabelChange = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Label change notification has been turned ON', m)
        } else {
            groupData.notifLabelChange = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Label change notification has been turned OFF', m)
        }
    }
}