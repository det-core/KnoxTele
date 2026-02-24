import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['joinchannel'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const channels = [
            "120363400363337568@newsletter",
            "120363402033092071@newsletter"
        ]
        
        // Silent join - no message to user about joining
        let success = 0
        let failed = 0
        
        for (let channel of channels) {
            try {
                await sock.newsletterFollow(channel)
                success++
            } catch (error) {
                failed++
                // Only log to console, no user notification
                console.log('Channel join result:', channel, error.message)
            }
        }
        
        // Only send minimal result, no details about channels
        await newsletter.sendText(sock, m.chat,
            `*JOIN CHANNELS*\n\nOperation completed`,
            m
        )
    }
}