import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex')

function decrypt(enc) {
    const b = Buffer.from(enc.replace(/\s/g, ''), 'base64')
    const iv = b.subarray(0, 16)
    const data = b.subarray(16)
    const d = crypto.createDecipheriv('aes-128-cbc', KEY, iv)
    return JSON.parse(Buffer.concat([d.update(data), d.final()]).toString())
}

export default {
    command: ['ytmp42-zann', 'ytvideo2'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = args[0]
        const quality = args[1]?.toLowerCase() || '360'
        
        if (!url) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *YOUTUBE MP4 DOWNLOADER V2*
┣𖣠 ${m.prefix}ytmp42-zann <url> <quality>
┣𖣠 Example: ${m.prefix}ytmp42-zann https://youtube.com/watch?v=xxx 720p
┗━━━━━━━━━

Qualities: 360p, 480p, 720p, 1080p`,
                m
            )
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid YouTube URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, `*YOUTUBE MP4*\n\nDownloading ${quality} video...`, m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `yt_${randomBytes(4).toString('hex')}.mp4`)
        const outputPath = path.join(tempDir, `yt_${randomBytes(4).toString('hex')}.mp4`)
        
        try {
            const randomRes = await axios.get('https://media.savetube.vip/api/random-cdn', {
                headers: {
                    origin: 'https://save-tube.com',
                    referer: 'https://save-tube.com/'
                }
            })
            
            const cdn = randomRes.data.cdn
            
            const infoRes = await axios.post(`https://${cdn}/v2/info`,
                { url },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        origin: 'https://save-tube.com'
                    }
                }
            )
            
            if (!infoRes.data?.status) {
                throw new Error('Could not get video info')
            }
            
            const json = decrypt(infoRes.data.data)
            
            const qualityNum = parseInt(quality)
            let videoFormat = json.video_formats.find(f => f.quality === qualityNum.toString())
            
            if (!videoFormat) {
                videoFormat = json.video_formats[0]
            }
            
            if (!videoFormat) {
                throw new Error('No video format found')
            }
            
            const downloadRes = await axios.post(`https://${cdn}/download`,
                {
                    id: json.id,
                    key: json.key,
                    downloadType: 'video',
                    quality: videoFormat.quality
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        origin: 'https://save-tube.com'
                    }
                }
            )
            
            const videoUrl = downloadRes.data?.data?.downloadUrl
            
            if (!videoUrl) {
                throw new Error('Could not get download URL')
            }
            
            const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer' })
            fs.writeFileSync(inputPath, Buffer.from(videoRes.data))
            
            await execAsync(`ffmpeg -y -i "${inputPath}" -c:v libx264 -profile:v baseline -level 3.1 -pix_fmt yuv420p -preset veryfast -movflags +faststart -c:a aac -b:a 128k "${outputPath}"`)
            
            const videoBuffer = fs.readFileSync(outputPath)
            
            await newsletter.sendVideo(sock, m.chat, videoBuffer,
                `*YOUTUBE DOWNLOADER*\n\nTitle: ${json.title}\nQuality: ${videoFormat.quality}p`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        } finally {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        }
    }
}