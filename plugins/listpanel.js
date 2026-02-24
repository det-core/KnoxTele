import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['listpanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let panelList = `*PANEL PRICES*\n\n`
        
        for (let [size, data] of Object.entries(global.panelPrices || {})) {
            panelList += `┏⧉ *${size.toUpperCase()}*\n`
            panelList += `┣𖣠 CPU: ${data.cpu}%\n`
            panelList += `┣𖣠 RAM: ${data.ram/1024}GB\n`
            panelList += `┣𖣠 Disk: ${data.disk/1024}GB\n`
            panelList += `┣𖣠 Price: ₦${data.price.toLocaleString()}\n`
            panelList += `┗━━━━━━━━━\n\n`
        }
        
        panelList += `Use ${m.prefix}buypanel to order`
        
        await newsletter.sendText(sock, m.chat, panelList, m)
    }
}