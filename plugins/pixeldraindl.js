import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['pixeldraindl', 'pddl'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url || !url.includes('pixeldrain.com')) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *PIXELDRAIN DOWNLOADER*
┣𖣠 ${m.prefix}pixeldraindl <url>
┣𖣠 Example: ${m.prefix}pixeldraindl https://pixeldrain.com/u/xxxxx
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*PIXELDRAIN DOWNLOADER*\n\nFetching file info...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.neoxr.eu/api/pixeldrain?url=${encodeURIComponent(url)}&apikey=Milik-Bot-OurinMD`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFile not found or invalid link', m)
            }
            
            const file = data.data
            
            await newsletter.sendText(sock, m.chat,
                `*PIXELDRAIN FILE*\n\n` +
                `Filename: ${file.filename || '-'}\n` +
                `Size: ${file.size || '-'}\n` +
                `Type: ${file.type || '-'}\n\n` +
                `Downloading file...`,
                m
            )
            
            if (file.url) {
                await newsletter.sendDocument(sock, m.chat, { url: file.url }, file.filename, '', m)
            } else {
                await newsletter.sendText(sock, m.chat, `Download link: ${file.direct_url || file.url}`, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}