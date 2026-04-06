import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['clearchat', 'cc'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await newsletter.sendText(sock, m.chat, '*CLEAR CHAT*\n\nClearing chat...', m)
            
            const now = Math.floor(Date.now() / 1000)
            
            await sock.chatModify({
                delete: true,
                lastMessages: [{
                    key: m.key,
                    messageTimestamp: m.messageTimestamp || now
                }]
            }, m.chat)
            
            await newsletter.sendText(sock, m.chat,
                `*CHAT CLEARED*\n\nChat has been cleared by @${m.sender.split('@')[0]}`,
                m
            )
            
        } catch (error) {
            try {
                await sock.chatModify({
                    clear: {
                        messages: [{
                            id: m.key.id,
                            fromMe: m.key.fromMe,
                            timestamp: Math.floor(Date.now() / 1000)
                        }]
                    }
                }, m.chat)
                
                await newsletter.sendText(sock, m.chat,
                    `*CHAT CLEARED*\n\nChat has been cleared by @${m.sender.split('@')[0]}`,
                    m
                )
            } catch (e) {
                await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${e.message}`, m)
            }
        }
    }
}