import newsletter from '../Bridge/newsletter.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
    command: ['openvo', 'rvo'],
    category: 'tools',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const quoted = m.quoted
        
        if (!quoted) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *OPEN VIEW ONCE*
┣𖣠 ${m.prefix}openvo (reply to view-once message)
┣𖣠 Opens and saves view-once media
┗━━━━━━━━━

Example: Reply to a view-once image/video with .openvo`,
                m
            )
        }
        
        const quotedMsg = quoted.message
        if (!quotedMsg) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nCould not read the quoted message', m)
        }
        
        const type = Object.keys(quotedMsg)[0]
        const content = quotedMsg[type]
        
        if (!content || !content.viewOnce) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nThis is not a view-once message', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*OPEN VIEW ONCE*\n\nProcessing...', m)
        
        try {
            let mediaType = null
            if (type.includes('image')) {
                mediaType = 'image'
            } else if (type.includes('video')) {
                mediaType = 'video'
            } else if (type.includes('audio')) {
                mediaType = 'audio'
            } else {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nUnsupported media type', m)
            }
            
            const stream = await downloadContentFromMessage(content, mediaType)
            let buffer = Buffer.from([])
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            
            if (buffer.length === 0) {
                throw new Error('Failed to download media')
            }
            
            const senderNumber = quoted.key?.participant?.split('@')[0] || 'Unknown'
            const caption = `*VIEW ONCE OPENED*\n\nFrom: @${senderNumber}`
            
            if (mediaType === 'image') {
                await newsletter.sendImage(sock, m.chat, buffer, caption, m)
            } else if (mediaType === 'video') {
                await newsletter.sendVideo(sock, m.chat, buffer, caption, m)
            } else if (mediaType === 'audio') {
                await newsletter.sendAudio(sock, m.chat, buffer, content.ptt || false, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}