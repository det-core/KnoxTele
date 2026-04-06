import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['getpp', 'pp', 'profilepic'],
    category: 'tools',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let target = m.sender
        
        if (m.quoted) {
            target = m.quoted.sender
        } else if (m.mentionedJid?.length) {
            target = m.mentionedJid[0]
        } else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '')
            if (num.startsWith('0')) num = '234' + num.slice(1)
            target = num + '@s.whatsapp.net'
        }
        
        const targetNum = target.split('@')[0]
        
        let ppUrl
        try {
            ppUrl = await sock.profilePictureUrl(target, 'image')
        } catch {
            ppUrl = 'https://files.catbox.moe/default-avatar.jpg'
        }
        
        const name = await sock.getName(target)
        
        try {
            const response = await axios.get(ppUrl, { responseType: 'arraybuffer' })
            const imageBuffer = Buffer.from(response.data)
            
            await newsletter.sendImage(sock, m.chat, imageBuffer,
                `*PROFILE PICTURE*\n\nName: ${name}\nNumber: ${targetNum}`,
                m
            )
        } catch (error) {
            await newsletter.sendText(sock, m.chat,
                `*PROFILE PICTURE*\n\nName: ${name}\nNumber: ${targetNum}\nNo profile picture found.`,
                m
            )
        }
    }
}