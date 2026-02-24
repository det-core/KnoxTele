import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['robloxplayer', 'robloxsearch'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *ROBLOX PLAYER SEARCH*
┣𖣠 ${m.prefix}robloxplayer <username>
┣𖣠 Example: ${m.prefix}robloxplayer linkmon
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*ROBLOX SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.neoxr.eu/api/roblox-search?q=${encodeURIComponent(query)}&apikey=Milik-Bot-OurinMD`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo players found for "${query}"`, m)
            }
            
            const players = data.data.slice(0, 5)
            
            let resultText = `*ROBLOX PLAYER SEARCH RESULTS*\n\n`
            
            players.forEach((player, i) => {
                resultText += `*${i + 1}. ${player.displayName}*\n`
                resultText += `   ID: ${player.id}\n`
                resultText += `   Username: ${player.name}\n`
                resultText += `   Verified: ${player.hasVerifiedBadge ? 'Yes' : 'No'}\n\n`
            })
            
            resultText += `Use ${m.prefix}robloxstalk <username> for details`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}