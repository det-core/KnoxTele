import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['pin', 'pinmsg'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.quoted || !m.quoted.key) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *PIN MESSAGE*
┣𖣠 ${m.prefix}pin (reply to message)
┣𖣠 ${m.prefix}pin <hours> (reply to message)
┗━━━━━━━━━

Example: Reply to a message with .pin 24`,
                m
            )
        }
        
        let duration = 86400 // Default 24 hours
        
        if (args[0] && !isNaN(parseInt(args[0]))) {
            const hours = parseInt(args[0])
            if (hours >= 1 && hours <= 720) {
                duration = hours * 3600
            }
        }
        
        try {
            const pinKey = {
                remoteJid: m.chat,
                fromMe: m.quoted.key.fromMe || false,
                id: m.quoted.key.id,
                participant: m.quoted.key.participant || m.quoted.sender
            }
            
            await sock.sendMessage(m.chat, {
                pin: pinKey,
                type: 1,
                time: duration
            })
            
            const durationText = duration >= 86400 
                ? `${Math.floor(duration / 86400)} days` 
                : `${Math.floor(duration / 3600)} hours`
            
            await newsletter.sendText(sock, m.chat,
                `*MESSAGE PINNED*\n\n✓ Message pinned for ${durationText}\nBy: @${m.sender.split('@')[0]}`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}