import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['delantilink', 'removelink'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const link = text?.trim()?.toLowerCase()
        
        if (!link) {
            const groupData = database.getGroup(m.chat)
            const antilinkList = groupData.antilinkList || []
            
            if (antilinkList.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo antilink list found', m)
            }
            
            let listText = `*ANTILINK LIST*\n\n`
            antilinkList.forEach((l, i) => {
                listText += `${i + 1}. ${l}\n`
            })
            listText += `\nUse ${m.prefix}delantilink <domain> to remove`
            
            return newsletter.sendText(sock, m.chat, listText, m)
        }
        
        const groupData = database.getGroup(m.chat)
        const antilinkList = groupData.antilinkList || []
        
        const index = antilinkList.findIndex(l => l === link)
        
        if (index === -1) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nLink "${link}" not found in antilink list`,
                m
            )
        }
        
        antilinkList.splice(index, 1)
        database.setGroup(m.chat, { antilinkList })
        
        await newsletter.sendText(sock, m.chat,
            `*ANTILINK REMOVED*\n\n✓ Link: ${link}\nRemaining: ${antilinkList.length} links`,
            m
        )
    }
}