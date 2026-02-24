import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)

export default {
    command: ['automedia'],
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
            const status = groupData.automedia ? 'ON' : 'OFF'
            
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTOMEDIA SETTINGS*
┣𖣠 Current: ${status}
┣𖣠 ${m.prefix}automedia on
┣𖣠 ${m.prefix}automedia off
┗━━━━━━━━━

When enabled, stickers will auto-convert to images`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        
        if (option === 'on') {
            groupData.automedia = true
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*AUTOMEDIA*\n\n✓ Automedia has been turned ON', m)
        } else {
            groupData.automedia = false
            database.setGroup(m.chat, groupData)
            await newsletter.sendText(sock, m.chat, '*AUTOMEDIA*\n\n✓ Automedia has been turned OFF', m)
        }
    }
}

export async function autoMediaHandler(sock, m) {
    try {
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe) return false
        
        const groupData = database.getGroup(m.chat)
        if (!groupData.automedia) return false
        
        const hasSticker = m.message?.stickerMessage
        if (!hasSticker) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `media_${randomBytes(4).toString('hex')}.webp`)
        const outputPath = path.join(tempDir, `media_${randomBytes(4).toString('hex')}.png`)
        
        fs.writeFileSync(inputPath, buffer)
        
        await execAsync(`ffmpeg -y -i "${inputPath}" -vframes 1 "${outputPath}"`)
        
        if (fs.existsSync(outputPath)) {
            const imageBuffer = fs.readFileSync(outputPath)
            await sock.sendMessage(m.chat, { image: imageBuffer }, { quoted: m })
        }
        
        fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        
        return true
    } catch (error) {
        console.log('AutoMedia error:', error.message)
        return false
    }
}