import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['joinchannel', 'autojoin'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        await m.react('⏳')

        const newsletters = global.autoJoinNewsletters || [
            "120363400363337568@newsletter",
            "120363402033092071@newsletter"
        ]
        const groups = global.autoJoinGroups || []

        let successN = 0, failedN = 0, successG = 0, failedG = 0

        // Join newsletters/channels
        for (const jid of newsletters) {
            try {
                await sock.newsletterFollow(jid)
                successN++
            } catch (e) {
                failedN++
                console.log('[joinchannel] Newsletter error:', jid, e.message)
            }
        }

        // Join groups
        for (const jid of groups) {
            try {
                if (jid.includes('chat.whatsapp.com')) {
                    const code = jid.split('/').pop()
                    await sock.groupAcceptInvite(code)
                } else {
                    await sock.groupAcceptInvite(jid)
                }
                successG++
            } catch (e) {
                failedG++
                console.log('[joinchannel] Group error:', jid, e.message)
            }
        }

        await m.react('✅')
        await newsletter.sendText(sock, m.chat,
            `*📡 AUTO JOIN COMPLETE*\n\n` +
            `Newsletters: ${successN} joined, ${failedN} failed\n` +
            `Groups: ${successG} joined, ${failedG} failed`,
            m
        )
    }
}
