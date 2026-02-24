import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['resetgoodbye'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        
        delete groupData.goodbyeMsg
        database.setGroup(m.chat, groupData)
        
        await newsletter.sendText(sock, m.chat,
            '*RESET GOODBYE*\n\n✓ Goodbye message has been reset to default',
            m
        )
    }
}