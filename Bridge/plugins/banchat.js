import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['banchat', 'bangroup'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const cmd = m.command.toLowerCase()
        const isUnban = ['unbanchat', 'unbangroup'].includes(cmd)
        
        try {
            const groupMetadata = await sock.groupMetadata(m.chat)
            const groupName = groupMetadata.subject || 'Unknown'
            const groupData = database.getGroup(m.chat)
            
            if (isUnban) {
                if (!groupData.isBanned) {
                    return newsletter.sendText(sock, m.chat,
                        `*KNOX INFO*\n\nThis group is not banned.`,
                        m
                    )
                }
                
                groupData.isBanned = false
                database.setGroup(m.chat, groupData)
                
                await newsletter.sendText(sock, m.chat,
                    `*GROUP UNBANNED*\n\nGroup: ${groupName}\nAll members can now use the bot.`,
                    m
                )
                return
            }
            
            if (groupData.isBanned) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nThis group is already banned.\nUse .unbanchat to unban.`,
                    m
                )
            }
            
            groupData.isBanned = true
            database.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat,
                `*GROUP BANNED*\n\nGroup: ${groupName}\nOnly owner can use bot in this group.`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}