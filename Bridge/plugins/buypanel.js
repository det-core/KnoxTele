import newsletter from '../Bridge/newsletter.js'
import payment from '../Bridge/payment.js'

export default {
    command: ['buypanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()

        if (!option) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *🖥️ BUY PANEL*\n` +
                `┣𖣠 ${m.prefix}buypanel list — See prices\n` +
                `┣𖣠 ${m.prefix}buypanel auto <size> — Pay via Paystack\n` +
                `┣𖣠 ${m.prefix}buypanel manual <size> — Negotiate with owner\n` +
                `┗━━━━━━━━━\n\n` +
                `*Auto:* Instant Paystack payment → panel created automatically\n` +
                `*Manual:* Contact owner to pay manually`, m
            )
        }

        if (option === 'list') {
            let panelList = `*🖥️ PANEL PRICES*\n\n`
            for (const [size, data] of Object.entries(global.panelPrices || {})) {
                panelList += `┏⧉ *${size.toUpperCase()}*\n`
                panelList += `┣𖣠 RAM: ${data.ram/1024}GB\n`
                panelList += `┣𖣠 Disk: ${data.disk/1024}GB\n`
                panelList += `┣𖣠 CPU: ${data.cpu}%\n`
                panelList += `┣𖣠 Price: ₦${data.price.toLocaleString()}\n`
                panelList += `┗━━━━━━━━━\n\n`
            }
            return newsletter.sendText(sock, m.chat, panelList, m)
        }

        if (option === 'auto') {
            const size = args[1]?.toLowerCase()
            if (!size || !global.panelPrices?.[size]) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nInvalid size. Available: ${Object.keys(global.panelPrices || {}).join(', ')}`, m
                )
            }

            const price = global.panelPrices[size].price
            const phone = m.sender.split('@')[0]
            const email = `${phone}@knox.bot`

            await newsletter.sendText(sock, m.chat,
                `*⏳ CREATING PAYMENT...*\n\nGenerating Paystack link for ${size.toUpperCase()} panel (₦${price.toLocaleString()})...`, m
            )

            const result = await payment.createPaystackPayment(price, email, phone, size)

            if (result.success) {
                global.autoNotifySock = sock

                await newsletter.sendText(sock, m.chat,
                    `*✅ PAYMENT LINK READY*\n\n` +
                    `Plan: ${size.toUpperCase()}\n` +
                    `Amount: ₦${price.toLocaleString()}\n` +
                    `Reference: \`${result.reference}\`\n\n` +
                    `💳 *Pay via Paystack:*\n${result.paymentLink}\n\n` +
                    `After payment, your panel will be created *automatically* within 2 minutes.\n\n` +
                    `_If panel isn't created, contact owner with your reference code._`, m
                )
            } else {
                await newsletter.sendText(sock, m.chat,
                    `*❌ PAYMENT FAILED*\n\n${result.message}\n\nTry manual instead: ${m.prefix}buypanel manual ${size}`, m
                )
            }
            return
        }

        if (option === 'manual') {
            const size = args[1]?.toLowerCase()
            if (!size || !global.panelPrices?.[size]) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nInvalid size. Available: ${Object.keys(global.panelPrices || {}).join(', ')}`, m
                )
            }

            const order = payment.createManualOrder(m.sender, size)
            const vcard = payment.getOwnerVCF()

            await sock.sendMessage(m.chat, {
                contacts: { displayName: global.ownerName, contacts: [{ vcard }] }
            }, { quoted: m })

            await newsletter.sendText(sock, m.chat,
                `*📋 MANUAL ORDER CREATED*\n\n` +
                `Order ID: \`${order.orderId}\`\n` +
                `Plan: ${size.toUpperCase()}\n` +
                `Price: ₦${global.panelPrices[size].price.toLocaleString()}\n\n` +
                `Contact the owner above with your Order ID to complete payment.\nPanel will be created after confirmation.`, m
            )
            return
        }

        return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUnknown option. Use ${m.prefix}buypanel for help.`, m)
    }
}
