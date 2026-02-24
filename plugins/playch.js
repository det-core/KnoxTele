import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)

export default {
    command: ['playch', 'pch'],
    category: 'music',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const channelId = args[0]
        const query = args.slice(1).join(' ')
        
        if (!channelId || !query) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *PLAY MUSIC TO CHANNEL*
┣𖣠 ${m.prefix}playch <channel> <song name>
┣𖣠 Example: ${m.prefix}playch 120363400363337568@newsletter Believer
┗━━━━━━━━━

Plays music directly to a WhatsApp channel.`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PLAY MUSIC*\n\nSearching for "${query}"...`, m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const outputPath = path.join(tempDir, `playch_${randomBytes(4).toString('hex')}.mp3`)
        
        try {
            const { data } = await axios.get(
                `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.result?.dlink) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo results found', m)
            }
            
            const title = data.result.title
            const thumbnail = data.result.thumbnail
            
            await newsletter.sendText(sock, m.chat, `*PLAY MUSIC*\n\nDownloading: ${title}`, m)
            
            const audioRes = await axios.get(data.result.dlink, { responseType: 'arraybuffer' })
            fs.writeFileSync(outputPath, Buffer.from(audioRes.data))
            
            await execAsync(`ffmpeg -y -i "${outputPath}" -map_metadata -1 -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}.mp3"`)
            
            const audioBuffer = fs.readFileSync(`${outputPath}.mp3`)
            
            // Send to channel
            await sock.sendMessage(channelId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: 'KNOX Music Player',
                        thumbnailUrl: thumbnail,
                        mediaType: 1
                    }
                }
            })
            
            await newsletter.sendText(sock, m.chat,
                `*MUSIC SENT*\n\n✓ "${title}" has been sent to the channel`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        } finally {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
            if (fs.existsSync(`${outputPath}.mp3`)) fs.unlinkSync(`${outputPath}.mp3`)
        }
    }
}