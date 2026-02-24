import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import { zencf } from 'zencf'

export default {
    command: ['spotify', 'spsearch'],
    category: 'music',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *SPOTIFY SEARCH*
┣𖣠 ${m.prefix}spotify <song name>
┣𖣠 Example: ${m.prefix}spotify believer
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*SPOTIFY SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { token } = await zencf.turnstileMin(
                'https://spotidownloader.com/en13',
                '0x4AAAAAAA8QAiFfE5GuBRRS'
            )
            
            const sessionRes = await axios.post(
                'https://api.spotidownloader.com/session',
                { token },
                {
                    headers: {
                        'user-agent': 'Mozilla/5.0',
                        'content-type': 'application/json'
                    }
                }
            )
            
            const bearer = sessionRes.data.token
            
            const searchRes = await axios.post(
                'https://api.spotidownloader.com/search',
                { query },
                {
                    headers: {
                        'authorization': `Bearer ${bearer}`,
                        'content-type': 'application/json'
                    }
                }
            )
            
            const results = searchRes.data?.results || []
            
            if (results.length === 0) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo results found for "${query}"`, m)
            }
            
            const tracks = results.slice(0, 5)
            
            let resultText = `*SPOTIFY SEARCH RESULTS*\n\n`
            
            tracks.forEach((track, i) => {
                resultText += `*${i + 1}. ${track.title}*\n`
                resultText += `   Artist: ${track.artists}\n`
                resultText += `   Album: ${track.album}\n`
                resultText += `   ID: ${track.id}\n\n`
            })
            
            resultText += `Use ${m.prefix}spotplay <id> to download`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}