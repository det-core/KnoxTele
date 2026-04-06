import newsletter from '../Bridge/newsletter.js'
import fs from 'fs'

const trialFile = './database/trials.json'

function loadTrials() {
    if (!fs.existsSync(trialFile)) return {}
    try { return JSON.parse(fs.readFileSync(trialFile, 'utf8')) } catch { return {} }
}

function saveTrials(data) {
    fs.writeFileSync(trialFile, JSON.stringify(data, null, 2))
}

export default {
    command: ['freetrial', 'trial'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const action = args[0]?.toLowerCase()

        if (!action) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *🎁 FREE TRIAL MANAGER*\n` +
                `┣𖣠 Status: *${global.freeTrialEnabled ? '✅ ON' : '❌ OFF'}*\n` +
                `┣𖣠 Days: *${global.freeTrialDays}*\n` +
                `┗━━━━━━━━━\n\n` +
                `${m.prefix}freetrial on\n` +
                `${m.prefix}freetrial off\n` +
                `${m.prefix}freetrial <days> — Set duration\n` +
                `${m.prefix}freetrial give @user <hrs> — Give manual trial\n` +
                `${m.prefix}freetrial check @user — Check user trial`,
                m
            )
        }

        if (action === 'on') {
            global.freeTrialEnabled = true
            await m.react('✅')
            return newsletter.sendText(sock, m.chat,
                `*✅ FREE TRIAL ON*\n\nAll users can now pair with the bot freely.`, m
            )
        }

        if (action === 'off') {
            global.freeTrialEnabled = false
            await m.react('🔒')
            return newsletter.sendText(sock, m.chat,
                `*🔒 FREE TRIAL OFF*\n\nOnly resellers and coupon holders can pair.\nUsers who attempt will be directed to @knoxprime.`, m
            )
        }

        // .freetrial give @user <hrs>
        if (action === 'give') {
            let target = null
            if (m.quoted) target = m.quoted.sender.split('@')[0]
            else if (m.mentionedJid?.length > 0) target = m.mentionedJid[0].split('@')[0]
            else if (args[1]) target = args[1].replace(/\D/g, '')

            const hrs = parseInt(args[target ? 2 : 1]) || 24

            if (!target) {
                return newsletter.sendText(sock, m.chat,
                    `*FREE TRIAL GIVE*\n\nMention or reply to a user.\nExample: ${m.prefix}freetrial give @user 48`, m
                )
            }

            const trials = loadTrials()
            trials[target] = { activatedAt: Date.now(), expiresAt: Date.now() + hrs * 3600000 }
            saveTrials(trials)

            const targetJid = target + '@s.whatsapp.net'
            try {
                await sock.sendMessage(targetJid, {
                    text: `*🎁 FREE TRIAL ACTIVATED*\n\nYou've been given *${hrs} hour(s)* of free trial by the owner.\nEnjoy using KNOX! 🚀`
                })
            } catch {}

            return newsletter.sendText(sock, m.chat,
                `*✅ TRIAL GIVEN*\n\n@${target} now has ${hrs} hour(s) of free trial.`,
                m
            )
        }

        // .freetrial check @user
        if (action === 'check') {
            let target = null
            if (m.quoted) target = m.quoted.sender.split('@')[0]
            else if (m.mentionedJid?.length > 0) target = m.mentionedJid[0].split('@')[0]
            else if (args[1]) target = args[1].replace(/\D/g, '')

            if (!target) {
                return newsletter.sendText(sock, m.chat,
                    `*TRIAL CHECK*\n\nMention or reply to a user.`, m
                )
            }

            const trials = loadTrials()
            const t = trials[target]
            if (!t) {
                return newsletter.sendText(sock, m.chat, `*TRIAL STATUS*\n\n@${target}: No trial`, m)
            }
            const active = Date.now() < t.expiresAt
            const exp = new Date(t.expiresAt).toLocaleString()
            return newsletter.sendText(sock, m.chat,
                `*TRIAL STATUS*\n\n@${target}: ${active ? '✅ Active' : '❌ Expired'}\nExpires: ${exp}`, m
            )
        }

        // .freetrial <number> = set days
        const days = parseInt(action)
        if (!isNaN(days) && days > 0) {
            global.freeTrialDays = days
            return newsletter.sendText(sock, m.chat,
                `*✅ TRIAL DURATION SET*\n\n${days} day(s) per trial session.`, m
            )
        }

        return newsletter.sendText(sock, m.chat,
            `*KNOX INFO*\n\nUnknown option. Use ${m.prefix}freetrial for help.`, m
        )
    }
}
