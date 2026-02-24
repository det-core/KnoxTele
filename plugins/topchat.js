import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['topchat', 'leaderboard'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        const chatStats = groupData.chatStats || {}
        
        if (Object.keys(chatStats).length === 0) {
            return newsletter.sendText(sock, m.chat,
                `*TOP CHATTERS*\n\nNo chat data available yet.`,
                m
            )
        }
        
        const sorted = Object.entries(chatStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        
        let leaderboard = '*TOP CHATTERS*\n\n'
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        const mentions = []
        
        sorted.forEach(([jid, count], index) => {
            if (jid && jid.includes('@')) {
                mentions.push(jid)
                const username = jid.split('@')[0]
                leaderboard += `${medals[index] || `${index + 1}.`} @${username}: ${count} messages\n`
            }
        })
        
        const totalMessages = sorted.reduce((sum, [, count]) => sum + count, 0)
        leaderboard += `\nTotal Messages: ${totalMessages}`
        
        await sock.sendMessage(m.chat, {
            text: leaderboard,
            mentions: mentions.slice(0, 30)
        }, { quoted: m })
    }
}