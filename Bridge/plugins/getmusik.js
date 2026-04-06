import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

// Music sessions storage
if (!global.musicSessions) global.musicSessions = new Map()

export default {
    command: ['getmusik', 'dlmusik'],
    category: 'music',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const num = parseInt(args[0])
        
        const session = global.musicSessions.get(m.sender)
        
        if (!session) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nNo music search session found.\nUse ${m.prefix}carimusik <song name> first.`,
                m
            )
        }
        
        if (!num || num < 1 || num > session.songs.length) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nPlease select a number between 1-${session.songs.length}`,
                m
            )
        }
        
        const selectedSong = session.songs[num - 1]
        
        await newsletter.sendText(sock, m.chat, `*DOWNLOADING MUSIC*\n\n${selectedSong.title}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.neoxr.eu/api/song?q=${encodeURIComponent(session.query)}&select=${num}&apikey=Milik-Bot-OurinMD`,
                { timeout: 60000 }
            )
            
            if (!data?.status || !data?.data?.url) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download music', m)
            }
            
            const song = data.data
            
            const caption = `*MUSIC DOWNLOADED*\n\nTitle: ${song.title}\nArtist: ${song.user?.username || '-'}\nGenre: ${song.genre || '-'}`
            
            await newsletter.sendAudio(sock, m.chat, { url: song.url }, false, m)
            await newsletter.sendText(sock, m.chat, caption, m)
            
            global.musicSessions.delete(m.sender)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}