import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['capcutdl', 'ccdl', 'capcut'],
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
                `┏⧉ *CAPCUT DOWNLOADER*
┣𖣠 ${m.prefix}capcutdl <url>
┣𖣠 Example: ${m.prefix}capcutdl https://www.capcut.com/t/xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.match(/capcut\.com/i)) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid CapCut URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*CAPCUT DOWNLOADER*\n\nDownloading video...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/capcut?url=${encodeURIComponent(url)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.url) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download video', m)
            }
            
            const result = data.data
            
            await newsletter.sendVideo(sock, m.chat, { url: result.url },
                `*CAPCUT DOWNLOADER*\n\nTitle: ${result.title || 'CapCut Video'}\nAuthor: ${result.author || 'Unknown'}`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}