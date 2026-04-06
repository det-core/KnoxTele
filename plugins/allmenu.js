import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['menu', 'allmenu', 'help', 'start'],
    category: 'general',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const isOwner = m.isOwner
        const isAdmin = m.isAdmin
        const isReseller = m.isReseller

        let roleTag = '👤 User'
        if (isOwner) roleTag = '👑 Owner'
        else if (isAdmin) roleTag = '🛡️ Admin'
        else if (isReseller) roleTag = '💼 Reseller'

        const generalMenu = `┏⧉ *⚙️ GENERAL*
┣𖣠 ${m.prefix}menu — This menu
┣𖣠 ${m.prefix}ping — Bot speed
┣𖣠 ${m.prefix}runtime — Uptime
┣𖣠 ${m.prefix}owner — Owner info
┗━━━━━━━━━`

        const rpgMenu = `┏⧉ *⚔️ RPG GAME*
┣𖣠 ${m.prefix}rpg — RPG menu
┣𖣠 ${m.prefix}rpgstart <class> — Choose class
┣𖣠 ${m.prefix}rpgstats — Your stats
┣𖣠 ${m.prefix}rpgfight — Battle monster
┣𖣠 ${m.prefix}rpgshop — Item shop
┣𖣠 ${m.prefix}rpgbuy <item> — Buy item
┣𖣠 ${m.prefix}rpguse <item> — Use item
┣𖣠 ${m.prefix}rpgrank — Leaderboard
┗━━━━━━━━━`

        const cpanelMenu = `┏⧉ *🖥️ PANEL*
┣𖣠 ${m.prefix}buypanel — Buy a panel
┣𖣠 ${m.prefix}cpanel <n>|<size> — Create panel
┣𖣠 ${m.prefix}listpanel — My panels
┣𖣠 ${m.prefix}delpanel — Delete panel
┣𖣠 ${m.prefix}cpanelmenu — Panel menu
┗━━━━━━━━━`

        const couponMenu = `┏⧉ *🎟️ COUPON*
┣𖣠 ${m.prefix}redeemcoupon <code> — Redeem coupon
┗━━━━━━━━━`

        const dlMenu = `┏⧉ *📥 DOWNLOAD*
┣𖣠 ${m.prefix}ytmp3 — YouTube MP3
┣𖣠 ${m.prefix}ytmp4 — YouTube MP4
┣𖣠 ${m.prefix}tiktokdl — TikTok DL
┣𖣠 ${m.prefix}instagramdl — IG DL
┣𖣠 ${m.prefix}spotplay — Spotify
┣𖣠 ${m.prefix}pindl — Pinterest
┗━━━━━━━━━`

        const aiMenu = `┏⧉ *🤖 AI*
┣𖣠 ${m.prefix}gpt4o — GPT-4o
┣𖣠 ${m.prefix}gemini3 — Gemini
┣𖣠 ${m.prefix}deepseek — Deepseek
┣𖣠 ${m.prefix}glm4 — GLM-4
┗━━━━━━━━━`

        const groupMenu = `┏⧉ *👥 GROUP*
┣𖣠 ${m.prefix}tagall — Tag all
┣𖣠 ${m.prefix}kick — Kick user
┣𖣠 ${m.prefix}promote — Promote
┣𖣠 ${m.prefix}demote — Demote
┣𖣠 ${m.prefix}groupinfo — Group info
┣𖣠 ${m.prefix}hidetag2 — Hidden tag
┗━━━━━━━━━`

        const antiFeatMenu = `┏⧉ *🛡️ ANTI FEATURES*
┣𖣠 ${m.prefix}antibot on/off
┣𖣠 ${m.prefix}antispam on/off
┣𖣠 ${m.prefix}antilink on/off
┣𖣠 ${m.prefix}antisticker on/off
┣𖣠 ${m.prefix}antimedia on/off
┣𖣠 ${m.prefix}anticall on/off
┣𖣠 ${m.prefix}antibug on/off — 🐛 Premium
┗━━━━━━━━━`

        let adminMenu = ''
        if (isOwner || isAdmin) {
            adminMenu = `\n┏⧉ *🔐 ADMIN*
┣𖣠 ${m.prefix}addadmin — Add admin
┣𖣠 ${m.prefix}removeadmin — Remove admin
┣𖣠 ${m.prefix}addreseller — Add reseller
┣𖣠 ${m.prefix}listadmin — List roles
┣𖣠 ${m.prefix}adminpanel — Admin panel
┣𖣠 ${m.prefix}freetrial on/off — Free trial
┣𖣠 ${m.prefix}freetrial give @user <hrs>
┣𖣠 ${m.prefix}createcoupon <code> <hrs>
┣𖣠 ${m.prefix}listcoupons — All coupons
┣𖣠 ${m.prefix}broadcast — Broadcast
┣𖣠 ${m.prefix}joinchannel — Join channels
┗━━━━━━━━━`
        } else if (isReseller) {
            adminMenu = `\n┏⧉ *💼 RESELLER*
┣𖣠 ${m.prefix}createcoupon <code> <hrs>
┣𖣠 ${m.prefix}reseller — Reseller info
┗━━━━━━━━━`
        }

        const header = `*🤖 KNOX MD BOT*
> Name: *${global.nameBot}*
> Dev: *${global.ownerName}*
> Version: *${global.versionBot}*
> Role: *${roleTag}*
> Prefix: *${m.prefix}*\n`

        const full = [header, generalMenu, rpgMenu, cpanelMenu, couponMenu, dlMenu, aiMenu, groupMenu, antiFeatMenu, adminMenu].join('\n')

        try {
            const axios = (await import('axios')).default
            if (global.img?.menu) {
                const res = await axios.get(global.img.menu, { responseType: 'arraybuffer' })
                return await sock.sendMessage(m.chat, {
                    image: Buffer.from(res.data),
                    caption: full
                }, { quoted: m })
            }
        } catch {}

        return newsletter.sendText(sock, m.chat, full, m)
    }
}
