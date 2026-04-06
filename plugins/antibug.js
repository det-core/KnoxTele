import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['antibug'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const arg = args[0]?.toLowerCase()

        if (!arg || (arg !== 'on' && arg !== 'off')) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *🛡️ ANTIBUG*\n` +
                `┣𖣠 Status: *${global.antibugEnabled ? '✅ ON' : '❌ OFF'}*\n` +
                `┣𖣠 Auto-block: *${global.antibugBlockSender ? 'Yes' : 'No'}*\n` +
                `┗━━━━━━━━━\n\n` +
                `Usage:\n` +
                `${m.prefix}antibug on  — Activate protection\n` +
                `${m.prefix}antibug off — Deactivate protection\n\n` +
                `*What it protects against:*\n` +
                `• Pik exploit / crash scripts\n` +
                `• RTL override attacks\n` +
                `• Zero-width character spam\n` +
                `• ViewOnce exploit payloads\n` +
                `• Malicious document injections\n\n` +
                `Detected senders are auto-blocked and owner is notified.`,
                m
            )
        }

        global.antibugEnabled = arg === 'on'
        await m.react(global.antibugEnabled ? '🛡️' : '🔓')
        await newsletter.sendText(sock, m.chat,
            `*🛡️ ANTIBUG ${global.antibugEnabled ? 'ACTIVATED' : 'DEACTIVATED'}*\n\n` +
            `${global.antibugEnabled
                ? 'Protection is now ON.\nMalicious scripts will be detected and sender auto-blocked.'
                : 'Protection is now OFF.\nBot will no longer filter exploit messages.'}`,
            m
        )
    }
}
