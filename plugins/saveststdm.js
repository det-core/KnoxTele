import newsletter from '../Bridge/newsletter.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['savests', 'ss', 'sw'],
    category: 'tools',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.quoted) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *SAVE STATUS*
┣𖣠 Reply to a status (image/video/audio) with ${m.prefix}savests
┣𖣠 The media will be sent to your private chat
┗━━━━━━━━━`,
                m
            )
        }

        const isStatus = m.quoted.key?.remoteJid === 'status@broadcast'
        
        if (!isStatus) {
            return newsletter.sendText(sock, m.chat,
                '*KNOX INFO*\n\nThis is not a status message. Reply to a status from status@broadcast.',
                m
            )
        }

        await newsletter.sendText(sock, m.chat, '*SAVE STATUS*\n\nDownloading status...', m)

        try {
            const quotedMsg = m.quoted.message
            const type = Object.keys(quotedMsg)[0]
            
            let mediaType = null
            let fileExtension = ''
            let fileName = ''
            let mimetype = ''
            
            if (type === 'imageMessage') {
                mediaType = 'image'
                fileExtension = 'jpg'
                fileName = `status_${randomBytes(4).toString('hex')}.jpg`
                mimetype = 'image/jpeg'
            } else if (type === 'videoMessage') {
                mediaType = 'video'
                fileExtension = 'mp4'
                fileName = `status_${randomBytes(4).toString('hex')}.mp4`
                mimetype = 'video/mp4'
            } else if (type === 'audioMessage') {
                mediaType = 'audio'
                fileExtension = 'mp3'
                fileName = `status_${randomBytes(4).toString('hex')}.mp3`
                mimetype = 'audio/mpeg'
            } else {
                return newsletter.sendText(sock, m.chat,
                    '*KNOX INFO*\n\nUnsupported media type. Only images, videos, and audio can be saved.',
                    m
                )
            }

            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType)
            let buffer = Buffer.from([])
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            if (buffer.length === 0) {
                throw new Error('Failed to download media')
            }

            const sender = m.quoted.key?.participant || m.quoted.sender
            const senderNumber = sender?.split('@')[0] || 'unknown'

            const caption = `*STATUS SAVED*\n\nFrom: @${senderNumber}\nType: ${mediaType.toUpperCase()}\nSize: ${(buffer.length / 1024).toFixed(2)} KB`

            // Send to user's private chat (DM)
            const userJid = m.sender // The user who requested

            if (mediaType === 'image') {
                await sock.sendMessage(userJid, {
                    image: buffer,
                    caption: caption,
                    mentions: [sender]
                })
            } else if (mediaType === 'video') {
                await sock.sendMessage(userJid, {
                    video: buffer,
                    caption: caption,
                    mentions: [sender],
                    mimetype: mimetype
                })
            } else if (mediaType === 'audio') {
                await sock.sendMessage(userJid, {
                    audio: buffer,
                    mimetype: mimetype,
                    ptt: quotedMsg[type].ptt || false
                })
                await newsletter.sendText(sock, userJid, caption, null)
            }

            await newsletter.sendText(sock, m.chat,
                `*SAVE STATUS*\n\n✓ Status saved and sent to your private chat!`,
                m
            )

        } catch (error) {
            await newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nError saving status: ${error.message}`,
                m
            )
        }
    }
}