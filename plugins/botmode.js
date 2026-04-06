import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

const MODES = {
    md: {
        name: 'Multi-Device',
        description: 'Default mode with all features'
    },
    cpanel: {
        name: 'CPanel',
        description: 'Mode for server panel management'
    },
    store: {
        name: 'Store',
        description: 'Mode for online store'
    },
    otp: {
        name: 'OTP',
        description: 'Mode for OTP service'
    },
    pushkontak: {
        name: 'Push Contact',
        description: 'Mode for pushing contacts to members'
    }
}

export default {
    command: ['botmode', 'mode'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const mode = args[0]?.toLowerCase()
        
        const groupData = database.getGroup(m.chat)
        const currentMode = groupData.botMode || 'md'
        
        if (!mode) {
            let modeList = ''
            for (const [key, val] of Object.entries(MODES)) {
                const isCurrent = key === currentMode ? ' ⬅️' : ''
                modeList += `   ${key} - ${val.name}${isCurrent}\n`
            }
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *BOT MODE SETTINGS*
┣𖣠 Current: ${currentMode.toUpperCase()}
┣𖣠 ${m.prefix}botmode <mode>
┗━━━━━━━━━

*Available Modes:*
${modeList}
Example: ${m.prefix}botmode store

Different modes show different menu categories.`,
                m
            )
        }
        
        if (!MODES[mode]) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nInvalid mode. Available: ${Object.keys(MODES).join(', ')}`,
                m
            )
        }
        
        groupData.botMode = mode
        database.setGroup(m.chat, groupData)
        
        await newsletter.sendText(sock, m.chat,
            `*BOT MODE CHANGED*\n\nMode: ${mode.toUpperCase()} (${MODES[mode].name})\nDescription: ${MODES[mode].description}\n\nUse ${m.prefix}menu to see available commands.`,
            m
        )
    }
}