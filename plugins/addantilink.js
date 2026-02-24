import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['addantilink', 'addlink'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const link = text?.trim()?.toLowerCase()
        
        if (!link) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *ADD ANTILINK*
┣𖣠 ${m.prefix}addantilink <domain>
┣𖣠 Example: ${m.prefix}addantilink tiktok.com
┗━━━━━━━━━`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        const antilinkList = groupData.antilinkList || []
        
        if (antilinkList.includes(link)) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nLink "${link}" already in antilink list`,
                m
            )
        }
        
        antilinkList.push(link)
        database.setGroup(m.chat, { antilinkList })
        
        await newsletter.sendText(sock, m.chat,
            `*ANTILINK ADDED*\n\n✓ Link: ${link}\nTotal: ${antilinkList.length} links`,
            m
        )
    }
}