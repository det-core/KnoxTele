import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ptvsearch', 'ptvs'],
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
                `┏⧉ *PTV SEARCH*
┣𖣠 ${m.prefix}ptvsearch <query>
┣𖣠 Searches for PTV (Pre-recorded Video) content
┗━━━━━━━━━

Example: ${m.prefix}ptvsearch funny cats`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PTV SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://labs.shannzx.xyz/api/v1/tiktok?query=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.result || data.result.length === 0) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo videos found for "${query}"`, m)
            }
            
            const videos = data.result.slice(0, 5)
            
            for (const video of videos) {
                await sock.sendMessage(m.chat, {
                    video: { url: video.video },
                    mimetype: 'video/mp4',
                    caption: `*PTV SEARCH*\n\nTitle: ${video.title || 'No title'}\nAuthor: @${video.author?.unique_id || '-'}`,
                    mentions: video.author?.unique_id ? [] : []
                }, { quoted: m })
                
                await new Promise(r => setTimeout(r, 1000))
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}