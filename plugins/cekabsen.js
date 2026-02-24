import newsletter from '../Bridge/newsletter.js'

// Global attendance storage
if (!global.attendance) global.attendance = {}

export default {
    command: ['cekabsen', 'listabsen'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const chatId = m.chat
        
        if (!global.attendance[chatId]) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nNo active attendance session.\nUse ${m.prefix}mulaiabsen to start one.`,
                m
            )
        }
        
        const absen = global.attendance[chatId]
        
        const createdDate = new Date(absen.createdAt).toLocaleString()
        
        let participantsList = 'None yet'
        if (absen.participants.length > 0) {
            participantsList = absen.participants.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n')
        }
        
        await sock.sendMessage(chatId, {
            text: `*ATTENDANCE LIST*\n\n` +
                `Description: ${absen.description}\n` +
                `Started: ${createdDate}\n` +
                `Created by: @${absen.createdBy.split('@')[0]}\n\n` +
                `*Participants (${absen.participants.length})*\n\n` +
                `${participantsList}\n\n` +
                `Use ${m.prefix}absen to attend`,
            mentions: [absen.createdBy, ...absen.participants]
        }, { quoted: m })
    }
}