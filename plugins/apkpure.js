import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['apkpure', 'apkp'],
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
                `┏⧉ *APKPURE SEARCH*
┣𖣠 ${m.prefix}apkpure <app name>
┣𖣠 Example: ${m.prefix}apkpure whatsapp
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*APKPURE SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nekolabs.web.id/dsc/apkpure/search?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.success || !data?.result?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo results found for "${query}"`, m)
            }
            
            const apps = data.result.slice(0, 5)
            
            let resultText = `*APKPURE SEARCH RESULTS*\n\n`
            
            apps.forEach((app, i) => {
                resultText += `*${i + 1}. ${app.name}*\n`
                resultText += `   Package: ${app.package || '-'}\n`
                resultText += `   Version: ${app.version || '-'}\n`
                resultText += `   Score: ${app.score || '-'}/10\n`
                resultText += `   Installs: ${app.installed || '-'}\n\n`
            })
            
            resultText += `Download directly from apkpure.com`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}