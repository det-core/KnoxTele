import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import database from '../Bridge/database.js'

const characters = {
    assistant: {
        name: 'Assistant',
        instruction: 'You are a helpful AI assistant. Answer questions accurately and concisely.'
    },
    translator: {
        name: 'Translator',
        instruction: 'You are a translator. Translate the user\'s message accurately.'
    },
    teacher: {
        name: 'Teacher',
        instruction: 'You are a teacher. Explain concepts clearly and patiently.'
    },
    programmer: {
        name: 'Programmer',
        instruction: 'You are a programming expert. Help with code, debugging, and technical questions.'
    },
    friend: {
        name: 'Friend',
        instruction: 'You are a friendly companion. Chat casually and be supportive.'
    }
}

export default {
    command: ['autoai'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.isAdmin && !m.isOwner) {
            return newsletter.sendText(sock, m.chat, global.mess.admin, m)
        }
        
        const option = args[0]?.toLowerCase()
        
        if (!option || !['on', 'off'].includes(option)) {
            let charList = ''
            for (const [key, val] of Object.entries(characters)) {
                charList += `   ${key} - ${val.name}\n`
            }
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTO AI SETTINGS*
┣𖣠 ${m.prefix}autoai on --character=<name>
┣𖣠 ${m.prefix}autoai off
┗━━━━━━━━━

*Characters Available:*
${charList}
Example: ${m.prefix}autoai on --character=teacher

When enabled, bot will auto-reply when mentioned.`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        
        if (option === 'off') {
            delete groupData.autoai
            database.setGroup(m.chat, groupData)
            return newsletter.sendText(sock, m.chat, '*AUTO AI*\n\n✓ Auto AI has been turned OFF', m)
        }
        
        const charMatch = text.match(/--character=(\w+)/i)
        const charKey = charMatch ? charMatch[1].toLowerCase() : 'assistant'
        
        if (!characters[charKey]) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nCharacter "${charKey}" not found. Available: ${Object.keys(characters).join(', ')}`,
                m
            )
        }
        
        groupData.autoai = {
            enabled: true,
            character: charKey,
            name: characters[charKey].name,
            instruction: characters[charKey].instruction
        }
        
        database.setGroup(m.chat, groupData)
        
        await newsletter.sendText(sock, m.chat,
            `*AUTO AI ENABLED*
            
Character: ${characters[charKey].name}
Mode: Bot will auto-reply when mentioned or replied to`,
            m
        )
    }
}