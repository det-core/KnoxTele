import newsletter from '../Bridge/newsletter.js'
import fs from 'fs'

const couponFile = './database/coupons.json'
const trialFile = './database/trials.json'

function loadJSON(file, def = {}) {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def }
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return def }
}
function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

export default {
    command: ['coupon', 'createcoupon', 'redeemcoupon', 'listcoupons'],
    category: 'owner',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const cmd = m.command
        const isOwner = m.isOwner

        // ── List coupons (owner only) ──
        if (cmd === 'listcoupons') {
            if (!isOwner) return m.reply(global.mess.owner)
            const coupons = loadJSON(couponFile)
            if (!Object.keys(coupons).length) {
                return newsletter.sendText(sock, m.chat, '*COUPONS*\n\nNo coupons yet.', m)
            }
            let out = `*📋 ALL COUPONS*\n\n`
            for (const [code, c] of Object.entries(coupons)) {
                out += `Code: \`${code}\`\nHours: ${c.hours}h\nBy: @${c.createdBy}\nUsed: ${c.used ? `✅ @${c.usedBy}` : '❌'}\n\n`
            }
            return newsletter.sendText(sock, m.chat, out, m)
        }

        // ── Create coupon (owner + reseller) ──
        if (cmd === 'createcoupon' || cmd === 'coupon') {
            if (!text || !text.includes(' ')) {
                return newsletter.sendText(sock, m.chat,
                    `┏⧉ *🎟️ CREATE COUPON*\n` +
                    `┣𖣠 ${m.prefix}createcoupon <CODE> <hours>\n` +
                    `┣𖣠 Example: ${m.prefix}createcoupon VIP48 48\n` +
                    `┗━━━━━━━━━\n\nCreates a one-time coupon your customers can redeem for free trial hours.`, m
                )
            }

            const [code, hrsStr] = text.split(' ')
            const hours = parseInt(hrsStr)
            if (!code || isNaN(hours) || hours < 1) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nInvalid. Example: ${m.prefix}createcoupon VIP24 24`, m
                )
            }

            const coupons = loadJSON(couponFile)
            const upperCode = code.toUpperCase()
            if (coupons[upperCode]) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nCoupon \`${upperCode}\` already exists.`, m
                )
            }

            coupons[upperCode] = {
                hours,
                createdBy: m.sender.split('@')[0],
                used: false,
                usedBy: null,
                createdAt: Date.now()
            }
            saveJSON(couponFile, coupons)

            await m.react('✅')
            return newsletter.sendText(sock, m.chat,
                `*✅ COUPON CREATED*\n\n` +
                `Code: \`${upperCode}\`\n` +
                `Duration: ${hours} hour(s)\n\n` +
                `Share this code with your customer.\nThey redeem it with: ${m.prefix}redeemcoupon ${upperCode}`, m
            )
        }

        // ── Redeem coupon (any user) ──
        if (cmd === 'redeemcoupon') {
            const code = args[0]?.toUpperCase()
            if (!code) {
                return newsletter.sendText(sock, m.chat,
                    `*REDEEM COUPON*\n\nUsage: ${m.prefix}redeemcoupon <CODE>`, m
                )
            }

            const coupons = loadJSON(couponFile)
            const c = coupons[code]
            if (!c) return newsletter.sendText(sock, m.chat, `*❌ INVALID COUPON*\n\nCode not found.`, m)
            if (c.used) return newsletter.sendText(sock, m.chat, `*❌ COUPON USED*\n\nThis coupon has already been redeemed.`, m)

            // Mark used
            c.used = true
            c.usedBy = m.sender.split('@')[0]
            c.usedAt = Date.now()
            saveJSON(couponFile, coupons)

            // Activate trial
            const trials = loadJSON(trialFile)
            const userId = m.sender.split('@')[0]
            trials[userId] = {
                activatedAt: Date.now(),
                expiresAt: Date.now() + c.hours * 3600000,
                source: `coupon:${code}`
            }
            saveJSON(trialFile, trials)

            await m.react('🎉')
            return newsletter.sendText(sock, m.chat,
                `*🎉 COUPON REDEEMED!*\n\n` +
                `Code: \`${code}\`\n` +
                `Duration: *${c.hours} hour(s)*\n` +
                `Expires: ${new Date(trials[userId].expiresAt).toLocaleString()}\n\n` +
                `Enjoy using KNOX! 🚀`, m
            )
        }
    }
}
