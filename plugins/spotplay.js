import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { zencf } from 'zencf'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
    command: ['spotplay', 'spdl'],
    category: 'music',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const trackId = args[0]
        
        if (!trackId) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *SPOTIFY DOWNLOAD*
┣𖣠 ${m.prefix}spotplay <track id>
┣𖣠 Example: ${m.prefix}spotplay 6DCZcSspjsKoFjzjrWoCdn
┗━━━━━━━━━

Use ${m.prefix}spotify to search for track IDs.`,
                m
            )
        }
        
        let spotifyUrl = trackId
        if (!trackId.includes('spotify.com')) {
            spotifyUrl = `https://open.spotify.com/track/${trackId}`
        }
        
        await newsletter.sendText(sock, m.chat, '*SPOTIFY DOWNLOAD*\n\nDownloading track...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const outputPath = path.join(tempDir, `spotify_${randomBytes(4).toString('hex')}.mp3`)
        
        try {
            const { token } = await zencf.turnstileMin(
                'https://spotidownloader.com/en13',
                '0x4AAAAAAA8QAiFfE5GuBRRS'
            )
            
            const sessionRes = await axios.post(
                'https://api.spotidownloader.com/session',
                { token },
                {
                    headers: {
                        'user-agent': 'Mozilla/5.0',
                        'content-type': 'application/json'
                    }
                }
            )
            
            const bearer = sessionRes.data.token
            
            const metaRes = await axios.post(
                'https://api.spotidownloader.com/metadata',
                { type: 'track', id: trackId },
                {
                    headers: {
                        'authorization': `Bearer ${bearer}`,
                        'content-type': 'application/json'
                    }
                }
            )
            
            if (!metaRes.data?.success) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nTrack not found', m)
            }
            
            const metadata = metaRes.data
            
            const downRes = await axios.post(
                'https://api.spotidownloader.com/download',
                { id: trackId },
                {
                    headers: {
                        'authorization': `Bearer ${bearer}`,
                        'content-type': 'application/json'
                    }
                }
            )
            
            const downloadUrl = downRes.data.link
            
            const audioRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
            fs.writeFileSync(outputPath, Buffer.from(audioRes.data))
            
            await execAsync(`ffmpeg -y -i "${outputPath}" -map_metadata -1 -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}.mp3"`)
            
            const audioBuffer = fs.readFileSync(`${outputPath}.mp3`)
            
            const caption = `*SPOTIFY DOWNLOAD*\n\nTitle: ${metadata.title}\nArtist: ${metadata.artists}\nAlbum: ${metadata.album}`
            
            await newsletter.sendAudio(sock, m.chat, audioBuffer, false, m)
            await newsletter.sendText(sock, m.chat, caption, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        } finally {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
            if (fs.existsSync(`${outputPath}.mp3`)) fs.unlinkSync(`${outputPath}.mp3`)
        }
    }
}