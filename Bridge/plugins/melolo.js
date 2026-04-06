import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['melolo', 'novel'],
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
                `┏⧉ *MELOLO NOVEL SEARCH*
┣𖣠 ${m.prefix}melolo <novel title>
┣𖣠 Example: ${m.prefix}melolo cinta
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*MELOLO SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nekolabs.web.id/dsc/melolo/search?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.success || !data?.result?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo novels found for "${query}"`, m)
            }
            
            const novels = data.result.slice(0, 5)
            
            let resultText = `*MELOLO SEARCH RESULTS*\n\n`
            
            novels.forEach((novel, i) => {
                const sinopsis = novel.sinopsis?.substring(0, 100) || '-'
                resultText += `*${i + 1}. ${novel.title}*\n`
                resultText += `   Author: ${novel.author || 'Unknown'}\n`
                resultText += `   Status: ${novel.status || '-'} | Chapters: ${novel.total_chapters || 0}\n`
                resultText += `   ${sinopsis}${novel.sinopsis?.length > 100 ? '...' : ''}\n\n`
            })
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}