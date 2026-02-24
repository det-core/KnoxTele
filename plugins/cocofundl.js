import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['cocofundl', 'cfdl', 'cocofun'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *COCOFUN DOWNLOADER*
┣𖣠 ${m.prefix}cocofundl <url>
┣𖣠 Example: ${m.prefix}cocofundl https://www.cocofun.com/share/post/xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.match(/cocofun\.com/i)) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid CocoFun URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*COCOFUN DOWNLOADER*\n\nDownloading video...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/cocofun?url=${encodeURIComponent(url)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.url) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download video', m)
            }
            
            const result = data.data
            
            await newsletter.sendVideo(sock, m.chat, { url: result.url },
                `*COCOFUN DOWNLOADER*\n\nTitle: ${result.title || 'CocoFun Video'}\nPlays: ${result.play || 0}\nLikes: ${result.like || 0}`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}