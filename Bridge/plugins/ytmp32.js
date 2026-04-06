import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import crypto from 'crypto'

const KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex')

function decrypt(enc) {
    const b = Buffer.from(enc.replace(/\s/g, ''), 'base64')
    const iv = b.subarray(0, 16)
    const data = b.subarray(16)
    const d = crypto.createDecipheriv('aes-128-cbc', KEY, iv)
    return JSON.parse(Buffer.concat([d.update(data), d.final()]).toString())
}

export default {
    command: ['ytmp32', 'ytaudio2'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *YOUTUBE MP3 DOWNLOADER V2*
┣𖣠 ${m.prefix}ytmp32 <url>
┣𖣠 Example: ${m.prefix}ytmp32 https://youtube.com/watch?v=xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid YouTube URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*YOUTUBE MP3*\n\nDownloading audio...', m)
        
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
            
            const audioFormat = json.audio_formats.find(f => f.quality === '128') || json.audio_formats[0]
            
            if (!audioFormat) {
                throw new Error('No audio format found')
            }
            
            const downloadRes = await axios.post(`https://${cdn}/download`,
                {
                    id: json.id,
                    key: json.key,
                    downloadType: 'audio',
                    quality: String(audioFormat.quality)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        origin: 'https://save-tube.com'
                    }
                }
            )
            
            const audioUrl = downloadRes.data?.data?.downloadUrl
            
            if (!audioUrl) {
                throw new Error('Could not get download URL')
            }
            
            await newsletter.sendAudio(sock, m.chat, { url: audioUrl }, false, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}