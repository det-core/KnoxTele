import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

const DEFAULT_TOXIC_WORDS = [
    'anjing', 'babi', 'kontol', 'memek', 'ngentot', 'tolol', 'goblok',
    'bangsat', 'asu', 'kampret', 'bodoh', 'idiot', 'bego', 'jancok',
    'fuck', 'shit', 'asshole', 'bitch', 'dick', 'pussy', 'cunt'
]

export default {
    command: ['antitoxic'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *ANTITOXIC SETTINGS*
┣𖣠 ${m.prefix}antitoxic on
┣𖣠 ${m.prefix}antitoxic off
┣𖣠 ${m.prefix}antitoxic add <word>
┣𖣠 ${m.prefix}antitoxic remove <word>
┣𖣠 ${m.prefix}antitoxic list
┗━━━━━━━━━

Automatically detects and warns toxic words in group chats.`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        if (!groupData.toxicWords) groupData.toxicWords = [...DEFAULT_TOXIC_WORDS]
        
        if (option === 'on') {
            groupData.antitoxic = true
            database.setGroup(m.chat, groupData)
            return newsletter.sendText(sock, m.chat, '*ANTITOXIC*\n\n✓ Antitoxic has been turned ON', m)
        }
        
        if (option === 'off') {
            groupData.antitoxic = false
            database.setGroup(m.chat, groupData)
            return newsletter.sendText(sock, m.chat, '*ANTITOXIC*\n\n✓ Antitoxic has been turned OFF', m)
        }
        
        if (option === 'add') {
            const word = args[1]?.toLowerCase()
            if (!word) return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nPlease provide a word to add', m)
            
            if (!groupData.toxicWords.includes(word)) {
                groupData.toxicWords.push(word)
                database.setGroup(m.chat, groupData)
                await newsletter.sendText(sock, m.chat, `*ANTITOXIC*\n\n✓ Word "${word}" added to toxic list`, m)
            } else {
                await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nWord "${word}" already in toxic list`, m)
            }
            return
        }
        
        if (option === 'remove') {
            const word = args[1]?.toLowerCase()
            if (!word) return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nPlease provide a word to remove', m)
            
            const index = groupData.toxicWords.indexOf(word)
            if (index > -1) {
                groupData.toxicWords.splice(index, 1)
                database.setGroup(m.chat, groupData)
                await newsletter.sendText(sock, m.chat, `*ANTITOXIC*\n\n✓ Word "${word}" removed from toxic list`, m)
            } else {
                await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nWord "${word}" not found in toxic list`, m)
            }
            return
        }
        
        if (option === 'list') {
            let listText = `*TOXIC WORDS LIST*\n\n`
            groupData.toxicWords.forEach((word, i) => {
                listText += `${i + 1}. ${word}\n`
            })
            listText += `\nTotal: ${groupData.toxicWords.length} words`
            await newsletter.sendText(sock, m.chat, listText, m)
        }
    }
}

export function isToxic(text, toxicWords = DEFAULT_TOXIC_WORDS) {
    if (!text) return { toxic: false, word: null }
    const lower = text.toLowerCase()
    for (const word of toxicWords) {
        if (lower.includes(word)) {
            return { toxic: true, word }
        }
    }
    return { toxic: false, word: null }
}