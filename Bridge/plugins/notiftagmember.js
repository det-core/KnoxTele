import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['notiftagmember', 'notiftag'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const current = groupData.notifTagMember || false
        
        if (!option || !['on', 'off'].includes(option)) {
            const status = current ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *TAG MEMBER NOTIFICATION*
┣𖣠 Status: ${status}
┣𖣠 ${m.prefix}notiftagmember on
┣𖣠 ${m.prefix}notiftagmember off
┗━━━━━━━━━

When enabled, bot will notify when someone is tagged.`,
                m
            )
        }
        
        if (option === 'on') {
            groupData.notifTagMember = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Tag member notification has been turned ON', m)
        } else {
            groupData.notifTagMember = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*NOTIFICATION*\n\n✓ Tag member notification has been turned OFF', m)
        }
    }
}