import newsletter from '../Bridge/newsletter.js'
import payment from '../Bridge/payment.js'

export default {
    command: ['adminpanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const vcard = payment.getOwnerVCF()
        
        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: global.ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m })
        
        await newsletter.sendText(sock, m.chat,
            `*ADMIN PANEL ACCESS*\n\n` +
            `Contact ${global.ownerName} for admin panel access\n` +
            `TG: ${global.ownerUsername}`,
            m
        )
    }
}