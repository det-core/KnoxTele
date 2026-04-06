import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['totalchat', 'chatstats'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        const chatStats = groupData.chatStats || {}
        
        const userStats = chatStats[m.sender] || 0
        
        const totalUsers = Object.keys(chatStats).length
        const totalMessages = Object.values(chatStats).reduce((sum, count) => sum + count, 0)
        
        const userRank = Object.entries(chatStats)
            .sort((a, b) => b[1] - a[1])
            .findIndex(([jid]) => jid === m.sender) + 1
        
        await newsletter.sendText(sock, m.chat,
            `*CHAT STATISTICS*\n\n` +
            `Your Messages: ${userStats}\n` +
            `Your Rank: #${userRank} of ${totalUsers}\n\n` +
            `Group Total: ${totalMessages} messages\n` +
            `Active Members: ${totalUsers}`,
            m
        )
    }
}