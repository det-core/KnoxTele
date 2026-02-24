import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['checksewa', 'ceksewa'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const db = database
        
        if (!db.data.settings.sewa) {
            db.data.settings.sewa = { enabled: false, groups: {} }
            db.save()
        }
        
        if (!db.data.settings.sewa.enabled) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nRental system is not enabled on this bot', m)
        }
        
        const sewaData = db.data.settings.sewa.groups[m.chat]
        
        if (!sewaData) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nThis group is not registered in rental system.\nContact owner to rent the bot.`,
                m
            )
        }
        
        const now = Date.now()
        const diff = sewaData.expiredAt - now
        
        if (diff <= 0) {
            return newsletter.sendText(sock, m.chat,
                `*RENTAL EXPIRED*\n\nThis group's rental has expired.\nContact owner to renew.`,
                m
            )
        }
        
        const days = Math.floor(diff / (24 * 60 * 60 * 1000))
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
        
        let remaining = ''
        if (days > 0) remaining += `${days} days `
        if (hours > 0) remaining += `${hours} hours `
        if (minutes > 0 && days === 0) remaining += `${minutes} minutes`
        
        const expiredDate = new Date(sewaData.expiredAt).toLocaleString()
        
        await newsletter.sendText(sock, m.chat,
            `*RENTAL STATUS*\n\n` +
            `Group: ${sewaData.name || m.chat.split('@')[0]}\n` +
            `Remaining: ${remaining}\n` +
            `Expires: ${expiredDate}`,
            m
        )
    }
}