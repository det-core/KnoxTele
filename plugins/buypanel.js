import newsletter from '../Bridge/newsletter.js'
import payment from '../Bridge/payment.js'

export default {
    command: ['buypanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *BUY PANEL*
┣𖣠 ${m.prefix}buypanel list
┣𖣠 ${m.prefix}buypanel auto <size>
┣𖣠 ${m.prefix}buypanel manual <size>
┗━━━━━━━━━

*Auto Payment:* Instant payment via Flutterwave
*Manual Payment:* Negotiate with owner

Example: ${m.prefix}buypanel auto 2gb
Example: ${m.prefix}buypanel manual 4gb`,
                m
            )
        }
        
        if (option === 'list') {
            let panelList = `*PANEL PRICES*\n\n`
            
            for (let [size, data] of Object.entries(global.panelPrices || {})) {
                panelList += `┏⧉ *${size.toUpperCase()}*\n`
                panelList += `┣𖣠 CPU: ${data.cpu}%\n`
                panelList += `┣𖣠 RAM: ${data.ram/1024}GB\n`
                panelList += `┣𖣠 Disk: ${data.disk/1024}GB\n`
                panelList += `┣𖣠 Price: ₦${data.price.toLocaleString()}\n`
                panelList += `┗━━━━━━━━━\n\n`
            }
            
            return newsletter.sendText(sock, m.chat, panelList, m)
        }
        
        if (option === 'auto') {
            const size = args[1]?.toLowerCase()
            
            if (!size || !global.panelPrices[size]) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nInvalid panel size. Use: ${Object.keys(global.panelPrices || {}).join(', ')}`,
                    m
                )
            }
            
            const price = global.panelPrices[size].price
            const email = `${m.sender.split('@')[0]}@user.com`
            const name = await sock.getName(m.sender)
            const phone = m.sender.split('@')[0]
            
            await newsletter.sendText(sock, m.chat,
                `*AUTO PAYMENT*\n\nCreating payment for ${size} panel (₦${price})...`,
                m
            )
            
            const result = await payment.createFlutterwavePayment(price, email, name, phone)
            
            if (result.success) {
                await newsletter.sendText(sock, m.chat,
                    `*PAYMENT LINK GENERATED*\n\n` +
                    `Link: ${result.paymentLink}\n` +
                    `Reference: ${result.reference}\n\n` +
                    `After payment, your panel will be created automatically.`,
                    m
                )
            } else {
                await newsletter.sendText(sock, m.chat,
                    `*PAYMENT FAILED*\n\n${result.message}\n\nPlease try manual payment instead.`,
                    m
                )
            }
            
            return
        }
        
        if (option === 'manual') {
            const size = args[1]?.toLowerCase()
            
            if (!size || !global.panelPrices[size]) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nInvalid panel size. Use: ${Object.keys(global.panelPrices || {}).join(', ')}`,
                    m
                )
            }
            
            const order = payment.createManualOrder(m.sender, size)
            
            const vcard = payment.getOwnerVCF()
            
            await sock.sendMessage(m.chat, {
                contacts: {
                    displayName: global.ownerName,
                    contacts: [{ vcard }]
                }
            }, { quoted: m })
            
            await newsletter.sendText(sock, m.chat,
                `*MANUAL ORDER CREATED*\n\n` +
                `Order ID: ${order.orderId}\n` +
                `Panel: ${size}\n` +
                `Price: ₦${global.panelPrices[size].price}\n\n` +
                `Contact the owner above to negotiate and complete payment.`,
                m
            )
            
            return
        }
        
        await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid option. Use .buypanel for help', m)
    }
}