import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ttsearch', 'tiktoksearch'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = args.join(' ')?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *TIKTOK SEARCH*
┣𖣠 ${m.prefix}ttsearch <query>
┣𖣠 Example: ${m.prefix}ttsearch funny cats
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*TIKTOK SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://labs.shannzx.xyz/api/v1/tiktok?query=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.result || data.result.length === 0) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo videos found for "${query}"`, m)
            }
            
            const videos = data.result.slice(0, 3)
            
            for (const video of videos) {
                const caption = `*TIKTOK SEARCH*\n\n` +
                    `Title: ${video.title || 'No title'}\n` +
                    `Author: @${video.author?.unique_id || '-'}\n` +
                    `Plays: ${video.stats?.plays?.toLocaleString() || 0}\n` +
                    `Likes: ${video.stats?.likes?.toLocaleString() || 0}`
                
                await newsletter.sendVideo(sock, m.chat, { url: video.video }, caption, m)
                await new Promise(r => setTimeout(r, 1000))
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}