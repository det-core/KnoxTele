import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'
import det from '../Bridge/det.js'

export default {
    command: ['reseller', 'resellerpanel'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const action = args[0]?.toLowerCase()
        
        if (!action) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *RESELLER MANAGEMENT*
┣𖣠 ${m.prefix}reseller list
┣𖣠 ${m.prefix}reseller add @user
┣𖣠 ${m.prefix}reseller remove @user
┣𖣠 ${m.prefix}reseller stats
┗━━━━━━━━━

Manage resellers who can create panels.`,
                m
            )
        }
        
        if (action === 'list') {
            const resellers = det.db.reseller || []
            
            if (resellers.length === 0) {
                return newsletter.sendText(sock, m.chat, '*RESELLERS*\n\nNo resellers found.', m)
            }
            
            let listText = `*RESELLER LIST*\n\n`
            resellers.forEach((num, i) => {
                listText += `${i + 1}. @${num}\n`
            })
            
            await sock.sendMessage(m.chat, {
                text: listText,
                mentions: resellers.map(num => num + '@s.whatsapp.net')
            }, { quoted: m })
            
            return
        }
        
        if (action === 'add') {
            let target = null
            
            if (m.quoted) {
                target = m.quoted.sender.split('@')[0]
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                target = m.mentionedJid[0].split('@')[0]
            } else if (args[1]) {
                target = args[1].replace(/\D/g, '')
            }
            
            if (!target) {
                return newsletter.sendText(sock, m.chat,
                    '*RESELLER ADD*\n\nPlease mention or reply to the user to add as reseller.',
                    m
                )
            }
            
            if (det.isReseller(target)) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\n@${target} is already a reseller.`,
                    m
                )
            }
            
            det.db.reseller.push(target)
            det.saveDB()
            
            await newsletter.sendText(sock, m.chat,
                `*RESELLER ADDED*\n\n✓ @${target} is now a reseller and can create panels.`,
                m
            )
            
            return
        }
        
        if (action === 'remove') {
            let target = null
            
            if (m.quoted) {
                target = m.quoted.sender.split('@')[0]
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                target = m.mentionedJid[0].split('@')[0]
            } else if (args[1]) {
                target = args[1].replace(/\D/g, '')
            }
            
            if (!target) {
                return newsletter.sendText(sock, m.chat,
                    '*RESELLER REMOVE*\n\nPlease mention or reply to the user to remove from resellers.',
                    m
                )
            }
            
            const index = det.db.reseller.indexOf(target)
            if (index === -1) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\n@${target} is not a reseller.`,
                    m
                )
            }
            
            det.db.reseller.splice(index, 1)
            det.saveDB()
            
            await newsletter.sendText(sock, m.chat,
                `*RESELLER REMOVED*\n\n✓ @${target} is no longer a reseller.`,
                m
            )
            
            return
        }
        
        if (action === 'stats') {
            const totalResellers = det.db.reseller?.length || 0
            const totalPanels = 0 // You would get this from database
            
            await newsletter.sendText(sock, m.chat,
                `*RESELLER STATISTICS*\n\n` +
                `Total Resellers: ${totalResellers}\n` +
                `Total Panels Created: ${totalPanels}\n` +
                `Active Resellers: ${totalResellers}`,
                m
            )
        }
    }
}