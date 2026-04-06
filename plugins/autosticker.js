import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'
import webp from '../lib/webp.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['autosticker'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option || !['on', 'off'].includes(option)) {
            const groupData = database.getGroup(m.chat)
            const status = groupData.autosticker ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTOSTICKER SETTINGS*
┣𖣠 Current: ${status}
┣𖣠 ${m.prefix}autosticker on
┣𖣠 ${m.prefix}autosticker off
┗━━━━━━━━━

When enabled, images/videos will auto-convert to stickers`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        
        if (option === 'on') {
            groupData.autosticker = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*AUTOSTICKER*\n\n✓ Autosticker has been turned ON', m)
        } else {
            groupData.autosticker = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*AUTOSTICKER*\n\n✓ Autosticker has been turned OFF', m)
        }
    }
}

export async function autoStickerHandler(sock, m) {
    try {
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe) return false
        
        const groupData = database.getGroup(m.chat)
        if (!groupData.autosticker) return false
        
        const hasImage = m.message?.imageMessage
        const hasVideo = m.message?.videoMessage
        
        if (!hasImage && !hasVideo) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `auto_${randomBytes(4).toString('hex')}.${hasImage ? 'jpg' : 'mp4'}`)
        const outputPath = path.join(tempDir, `auto_${randomBytes(4).toString('hex')}.webp`)
        
        fs.writeFileSync(inputPath, buffer)
        
        let success = false
        if (hasVideo) {
            const duration = m.message.videoMessage.seconds || 0
            if (duration > 10) return false
            success = await webp.videoToWebp(inputPath, outputPath, 10)
        } else {
            success = await webp.imageToWebp(inputPath, outputPath)
        }
        
        if (success) {
            const stickerBuffer = fs.readFileSync(outputPath)
            await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        }
        
        fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        
        return true
    } catch (error) {
        console.log('AutoSticker error:', error.message)
        return false
    }
}