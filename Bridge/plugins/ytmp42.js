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
    command: ['ytmp42', 'ytvideo'],
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
                `┏⧉ *YOUTUBE MP4 DOWNLOADER*
┣𖣠 ${m.prefix}ytmp42 <url>
┣𖣠 Example: ${m.prefix}ytmp42 https://youtube.com/watch?v=xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid YouTube URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*YOUTUBE MP4*\n\nFetching video info...', m)
        
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
            
            const rows = json.video_formats.map(f => ({
                header: `${f.quality}p`,
                title: `Download ${f.quality}p video`,
                description: `Quality: ${f.quality}p`,
                id: `${m.prefix}ytmp42-zann ${url} ${f.quality}`
            }))
            
            const caption = `*YOUTUBE DOWNLOADER*\n\n` +
                `Title: ${json.title}\n` +
                `Duration: ${json.duration}s\n\n` +
                `Please select a quality:`
            
            await sock.sendMessage(m.chat, {
                text: caption,
                footer: 'KNOX MD',
                interactiveButtons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: 'Select Quality',
                        sections: [{
                            title: 'Available Qualities',
                            rows: rows
                        }]
                    })
                }]
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}