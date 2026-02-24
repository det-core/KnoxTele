import newsletter from '../Bridge/newsletter.js'
import { runtime } from '../Bridge/utils.js'
import axios from 'axios'

export default {
    command: ['allmenu'],
    category: 'main',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const uptime = process.uptime()
        const status = m.isOwner ? 'Owner' : m.isReseller ? 'Reseller' : 'User'
        
        const menu = `*KNOX MD*
> Runtime : *${runtime(uptime)}*
> Status : *${status}*

┏⧉ *BASIC*
┣𖣠 ${m.prefix}ping
┣𖣠 ${m.prefix}owner
┣𖣠 ${m.prefix}menu
┣𖣠 ${m.prefix}runtime
┣𖣠 ${m.prefix}report
┗━━━━━━━━━❖

┏⧉ *DOWNLOAD*
┣𖣠 ${m.prefix}ytmp3
┣𖣠 ${m.prefix}ytmp4
┣𖣠 ${m.prefix}tiktok
┣𖣠 ${m.prefix}instagram
┣𖣠 ${m.prefix}facebook
┣𖣠 ${m.prefix}twitter
┣𖣠 ${m.prefix}mediafire
┣𖣠 ${m.prefix}sfile
┣𖣠 ${m.prefix}terabox
┣𖣠 ${m.prefix}capcut
┣𖣠 ${m.prefix}likee
┣𖣠 ${m.prefix}cocofun
┣𖣠 ${m.prefix}pindl
┣𖣠 ${m.prefix}aio
┗━━━━━━━━━❖

┏⧉ *MUSIC*
┣𖣠 ${m.prefix}play
┣𖣠 ${m.prefix}spotify
┣𖣠 ${m.prefix}spotplay
┣𖣠 ${m.prefix}ttmp3
┣𖣠 ${m.prefix}carimusik
┣𖣠 ${m.prefix}getmusik
┣𖣠 ${m.prefix}playch
┗━━━━━━━━━❖

┏⧉ *AUDIO EFFECTS*
┣𖣠 ${m.prefix}bass
┣𖣠 ${m.prefix}nightcore
┣𖣠 ${m.prefix}slow
┣𖣠 ${m.prefix}fast
┣𖣠 ${m.prefix}earrape
┣𖣠 ${m.prefix}deep
┣𖣠 ${m.prefix}echo
┣𖣠 ${m.prefix}smooth
┣𖣠 ${m.prefix}tupai
┣𖣠 ${m.prefix}robot
┣𖣠 ${m.prefix}blown
┣𖣠 ${m.prefix}fat
┗━━━━━━━━━❖

┏⧉ *IMAGE*
┣𖣠 ${m.prefix}hd
┣𖣠 ${m.prefix}hd2
┣𖣠 ${m.prefix}removebg
┣𖣠 ${m.prefix}img2prompt
┣𖣠 ${m.prefix}faceswap
┣𖣠 ${m.prefix}unblur
┣𖣠 ${m.prefix}txt2img
┣𖣠 ${m.prefix}pins
┣𖣠 ${m.prefix}wallpaper
┣𖣠 ${m.prefix}getpp
┗━━━━━━━━━❖

┏⧉ *VIDEO*
┣𖣠 ${m.prefix}videoenhancer
┣𖣠 ${m.prefix}slow
┣𖣠 ${m.prefix}fast
┣𖣠 ${m.prefix}reverse
┣𖣠 ${m.prefix}txt2vid
┗━━━━━━━━━❖

┏⧉ *AI*
┣𖣠 ${m.prefix}ai
┣𖣠 ${m.prefix}gemini
┣𖣠 ${m.prefix}gpt4
┣𖣠 ${m.prefix}gpt41
┣𖣠 ${m.prefix}deepseek
┣𖣠 ${m.prefix}glm4
┣𖣠 ${m.prefix}gita
┣𖣠 ${m.prefix}ai-leaderboard
┣𖣠 ${m.prefix}anime-gen
┗━━━━━━━━━❖

┏⧉ *STICKER*
┣𖣠 ${m.prefix}sticker
┣𖣠 ${m.prefix}toimage
┣𖣠 ${m.prefix}tovideo
┣𖣠 ${m.prefix}togif
┗━━━━━━━━━❖

┏⧉ *GROUP*
┣𖣠 ${m.prefix}add
┣𖣠 ${m.prefix}kick
┣𖣠 ${m.prefix}promote
┣𖣠 ${m.prefix}demote
┣𖣠 ${m.prefix}groupinfo
┣𖣠 ${m.prefix}linkgc
┣𖣠 ${m.prefix}resetlinkgc
┣𖣠 ${m.prefix}setnamegc
┣𖣠 ${m.prefix}setdeskgc
┣𖣠 ${m.prefix}setppgc
┣𖣠 ${m.prefix}delppgc
┣𖣠 ${m.prefix}close
┣𖣠 ${m.prefix}open
┣𖣠 ${m.prefix}tagall
┣𖣠 ${m.prefix}hidetag2
┣𖣠 ${m.prefix}totag
┣𖣠 ${m.prefix}intro
┣𖣠 ${m.prefix}setintro
┣𖣠 ${m.prefix}resetintro
┣𖣠 ${m.prefix}setrules
┣𖣠 ${m.prefix}pin
┣𖣠 ${m.prefix}delete
┣𖣠 ${m.prefix}cekonline
┣𖣠 ${m.prefix}topchat
┣𖣠 ${m.prefix}totalchat
┣𖣠 ${m.prefix}listadmin
┗━━━━━━━━━❖

┏⧉ *PROTECTION*
┣𖣠 ${m.prefix}welcome
┣𖣠 ${m.prefix}setwelcome
┣𖣠 ${m.prefix}resetwelcome
┣𖣠 ${m.prefix}goodbye
┣𖣠 ${m.prefix}setgoodbye
┣𖣠 ${m.prefix}resetgoodbye
┣𖣠 ${m.prefix}antilink
┣𖣠 ${m.prefix}antilinkall
┣𖣠 ${m.prefix}addantilink
┣𖣠 ${m.prefix}delantilink
┣𖣠 ${m.prefix}listantilink
┣𖣠 ${m.prefix}antitoxic
┣𖣠 ${m.prefix}antibot
┣𖣠 ${m.prefix}antimedia
┣𖣠 ${m.prefix}antisticker
┣𖣠 ${m.prefix}antidocument
┣𖣠 ${m.prefix}antiremove
┣𖣠 ${m.prefix}antitagsw
┣𖣠 ${m.prefix}antispam
┣𖣠 ${m.prefix}slowmode
┣𖣠 ${m.prefix}mute
┣𖣠 ${m.prefix}unmute
┣𖣠 ${m.prefix}warn
┣𖣠 ${m.prefix}settings
┣𖣠 ${m.prefix}botmode
┗━━━━━━━━━❖

┏⧉ *AUTO*
┣𖣠 ${m.prefix}autodl
┣𖣠 ${m.prefix}autoforward
┣𖣠 ${m.prefix}autosticker
┣𖣠 ${m.prefix}automedia
┣𖣠 ${m.prefix}autoreply
┣𖣠 ${m.prefix}autoai
┗━━━━━━━━━❖

┏⧉ *NOTIFICATIONS*
┣𖣠 ${m.prefix}notifpromote
┣𖣠 ${m.prefix}notifdemote
┣𖣠 ${m.prefix}notiftagmember
┣𖣠 ${m.prefix}notifgantitag
┣𖣠 ${m.prefix}notifopengroup
┣𖣠 ${m.prefix}notifclosegroup
┗━━━━━━━━━❖

┏⧉ *CPANEL*
┣𖣠 ${m.prefix}buypanel
┣𖣠 ${m.prefix}cpanel
┣𖣠 ${m.prefix}listpanel
┣𖣠 ${m.prefix}delpanel
┣𖣠 ${m.prefix}adminpanel
┗━━━━━━━━━❖

┏⧉ *OSINT*
┣𖣠 ${m.prefix}igstalk
┣𖣠 ${m.prefix}ttstalk
┣𖣠 ${m.prefix}ghstalk
┣𖣠 ${m.prefix}ytstalk
┣𖣠 ${m.prefix}robloxstalk
┣𖣠 ${m.prefix}robloxplayer
┣𖣠 ${m.prefix}discordstalk
┣𖣠 ${m.prefix}pintereststalk
┣𖣠 ${m.prefix}ffstalk
┣𖣠 ${m.prefix}wastalk
┣𖣠 ${m.prefix}ipwho
┣𖣠 ${m.prefix}lookup
┗━━━━━━━━━❖

┏⧉ *SEARCH*
┣𖣠 ${m.prefix}film
┣𖣠 ${m.prefix}manga
┣𖣠 ${m.prefix}dramabox
┣𖣠 ${m.prefix}apkmod
┣𖣠 ${m.prefix}apkpure
┣𖣠 ${m.prefix}melolo
┣𖣠 ${m.prefix}npm
┣𖣠 ${m.prefix}cnnnews
┣𖣠 ${m.prefix}ttsearch
┣𖣠 ${m.prefix}ptvsearch
┗━━━━━━━━━❖

┏⧉ *OWNER*
┣𖣠 ${m.prefix}addowner
┣𖣠 ${m.prefix}removeowner
┣𖣠 ${m.prefix}addadmin
┣𖣠 ${m.prefix}removeadmin
┣𖣠 ${m.prefix}addreseller
┣𖣠 ${m.prefix}removereseller
┣𖣠 ${m.prefix}reseller
┣𖣠 ${m.prefix}broadcast
┣𖣠 ${m.prefix}block
┣𖣠 ${m.prefix}unblock
┣𖣠 ${m.prefix}blocklist
┣𖣠 ${m.prefix}banchat
┣𖣠 ${m.prefix}unbanchat
┣𖣠 ${m.prefix}cleardb
┣𖣠 ${m.prefix}update
┣𖣠 ${m.prefix}autoupdate
┣𖣠 ${m.prefix}gitpull
┣𖣠 ${m.prefix}restart
┣𖣠 ${m.prefix}pair
┣𖣠 ${m.prefix}anticall
┣𖣠 ${m.prefix}joinchannel
┗━━━━━━━━━❖

┏⧉ *UTILITY*
┣𖣠 ${m.prefix}savests
┣𖣠 ${m.prefix}openvo
┣𖣠 ${m.prefix}vcf
┣𖣠 ${m.prefix}afk
┣𖣠 ${m.prefix}cekidgc
┣𖣠 ${m.prefix}checksewa
┣𖣠 ${m.prefix}clearchat
┣𖣠 ${m.prefix}system
┣𖣠 ${m.prefix}ram
┣𖣠 ${m.prefix}cpu
┣𖣠 ${m.prefix}disk
┗━━━━━━━━━❖`

        if (global.img && global.img.menu) {
            try {
                const response = await axios.get(global.img.menu, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, menu, m)
                
                if (global.music && global.music.menu) {
                    try {
                        const musicResponse = await axios.get(global.music.menu, { responseType: 'arraybuffer' })
                        const musicBuffer = Buffer.from(musicResponse.data)
                        await sock.sendMessage(m.chat, {
                            audio: musicBuffer,
                            mimetype: 'audio/mpeg',
                            ptt: false
                        })
                    } catch {}
                }
            } catch {
                await newsletter.sendText(sock, m.chat, menu, m)
            }
        } else {
            await newsletter.sendText(sock, m.chat, menu, m)
        }
    }
}