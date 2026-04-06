import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

const DEFAULT_INTRO = `┏⧉ *WELCOME TO THE GROUP*
┣𖣠 Hello {user}!
┣𖣠 Welcome to {group}
┣𖣠 Members: {count}
┣𖣠 Date: {date}
┗━━━━━━━━━

Please introduce yourself and follow the group rules.`

export default {
    command: ['intro', 'perkenalan'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        const groupMeta = await sock.groupMetadata(m.chat)
        
        const introText = groupData.intro || DEFAULT_INTRO
        
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        
        const parsed = introText
            .replace(/{user}/g, `@${m.sender.split('@')[0]}`)
            .replace(/{group}/g, groupMeta.subject)
            .replace(/{count}/g, groupMeta.participants.length)
            .replace(/{date}/g, dateStr)
            .replace(/{desc}/g, groupMeta.desc || 'No description')
        
        await sock.sendMessage(m.chat, {
            text: parsed,
            mentions: [m.sender]
        }, { quoted: m })
    }
}