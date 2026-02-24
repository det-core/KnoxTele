import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['pindl', 'pinterestdl'],
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
                `┏⧉ *PINTEREST DOWNLOADER*
┣𖣠 ${m.prefix}pindl <pinterest url>
┣𖣠 Example: ${m.prefix}pindl https://pin.it/xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.match(/pinterest|pin\.it/i)) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid Pinterest URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*PINTEREST DOWNLOADER*\n\nFetching media...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/pinterest?url=${encodeURIComponent(url)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download media', m)
            }
            
            const result = data.data
            
            if (result.images && result.images.length > 0) {
                for (const img of result.images.slice(0, 3)) {
                    const response = await axios.get(img, { responseType: 'arraybuffer' })
                    const imgBuffer = Buffer.from(response.data)
                    await newsletter.sendImage(sock, m.chat, imgBuffer, '', m)
                }
            } else if (result.videos && result.videos.length > 0) {
                await newsletter.sendVideo(sock, m.chat, { url: result.videos[0] }, '', m)
            } else {
                await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo media found', m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}