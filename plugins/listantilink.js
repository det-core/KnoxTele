import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

const DEFAULT_BLOCKED_LINKS = [
    'chat.whatsapp.com',
    'wa.me',
    'bit.ly',
    't.me',
    'telegram.me',
    'discord.gg',
    'discord.com/invite'
]

export default {
    command: ['listantilink'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        const customList = groupData.antilinkList || []
        
        let resultText = `*ANTILINK LIST*\n\n`
        
        resultText += `┏⧉ *Default Links*\n`
        DEFAULT_BLOCKED_LINKS.forEach((l, i) => {
            resultText += `┣𖣠 ${i + 1}. ${l}\n`
        })
        resultText += `┗━━━━━━━━━\n\n`
        
        if (customList.length > 0) {
            resultText += `┏⧉ *Custom Links*\n`
            customList.forEach((l, i) => {
                resultText += `┣𖣠 ${i + 1}. ${l}\n`
            })
            resultText += `┗━━━━━━━━━\n\n`
        }
        
        resultText += `Default: ${DEFAULT_BLOCKED_LINKS.length} links\n`
        resultText += `Custom: ${customList.length} links\n\n`
        resultText += `${m.prefix}addantilink <link> to add\n`
        resultText += `${m.prefix}delantilink <link> to remove`
        
        await newsletter.sendText(sock, m.chat, resultText, m)
    }
}