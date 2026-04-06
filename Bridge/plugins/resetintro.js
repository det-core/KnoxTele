import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

const DEFAULT_INTRO = `┏⧉ *WELCOME TO THE GROUP*
┣𖣠 Hello {user}!
┣𖣠 Welcome to {group}
┣𖣠 Members: {count}
┣𖣠 Date: {date}
┗━━━━━━━━━`

export default {
    command: ['resetintro'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupData = database.getGroup(m.chat)
        
        if (!groupData.intro) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nThis group is already using the default intro.`,
                m
            )
        }
        
        delete groupData.intro
        database.setGroup(m.chat, groupData)
        
        await newsletter.sendText(sock, m.chat,
            `*INTRO RESET*\n\n✓ Group intro has been reset to default.\nUse ${m.prefix}intro to see it.`,
            m
        )
    }
}