import newsletter from '../Bridge/newsletter.js'
import { runtime } from '../Bridge/utils.js'
import axios from 'axios'

export default {
    command: ['menu', 'help'],
    category: 'main',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const uptime = process.uptime()
        const status = m.isOwner ? 'Owner' : m.isReseller ? 'Reseller' : 'User'
        
        const menu = `*KNOX MD BOT*
> Bot Name : *${global.nameBot}*
> Developer : *${global.ownerName}*
> Version : *${global.versionBot}*
> Runtime : *${runtime(uptime)}*
> Status : *${status}*

┏⧉ *MAIN MENUS*
┣𖣠 ${m.prefix}allmenu
┣𖣠 ${m.prefix}downloadmenu
┣𖣠 ${m.prefix}musicmenu
┣𖣠 ${m.prefix}convertmenu
┣𖣠 ${m.prefix}aimenu
┣𖣠 ${m.prefix}stickermenu
┣𖣠 ${m.prefix}groupmenu
┣𖣠 ${m.prefix}cpanelmenu
┣𖣠 ${m.prefix}stalkermenu
┣𖣠 ${m.prefix}searchmenu
┣𖣠 ${m.prefix}ownermenu
┣𖣠 ${m.prefix}utilitymenu
┗━━━━━━━━━

Type ${m.prefix}menu [category] for details`

        if (global.img && global.img.menu) {
            try {
                const response = await axios.get(global.img.menu, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, menu, m)
            } catch {
                await newsletter.sendText(sock, m.chat, menu, m)
            }
        } else {
            await newsletter.sendText(sock, m.chat, menu, m)
        }
    }
}