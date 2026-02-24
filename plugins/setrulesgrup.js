import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['setrulesgrup', 'setrules'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const rules = text?.trim() || (m.quoted?.body || m.quoted?.text || '')
        
        if (!rules) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *SET GROUP RULES*
┣𖣠 ${m.prefix}setrulesgrup <rules>
┣𖣠 Example: ${m.prefix}setrulesgrup 1. No spam\n2. Respect others
┗━━━━━━━━━`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        groupData.groupRules = rules
        database.setGroup(m.chat, groupData)
        
        await newsletter.sendText(sock, m.chat,
            `*GROUP RULES UPDATED*\n\n✓ New rules have been set.\nUse ${m.prefix}rulesgrup to view.`,
            m
        )
    }
}