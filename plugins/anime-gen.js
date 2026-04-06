import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['anime-gen', 'aianime'],
    category: 'ai',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const prompt = text?.trim()
        
        if (!prompt) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AI ANIME GENERATOR*
┣𖣠 ${m.prefix}anime-gen <prompt>
┣𖣠 Example: ${m.prefix}anime-gen girl, vibrant colors, smiling
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*AI ANIME*\n\nGenerating image...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.neoxr.eu/api/ai-anime?q=${encodeURIComponent(prompt)}&apikey=Milik-Bot-OurinMD`,
                { timeout: 120000 }
            )
            
            if (!data?.status || !data?.data?.url) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to generate image', m)
            }
            
            const result = data.data
            
            const caption = `*AI ANIME GENERATOR*\n\nPrompt: ${result.prompt || prompt}`
            
            await newsletter.sendImage(sock, m.chat, { url: result.url }, caption, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}