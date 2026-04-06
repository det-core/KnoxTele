import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true })

export default {
    command: ['autoreply', 'ar'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const action = args[0]?.toLowerCase()
        
        if (!action) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *AUTOREPLY SETTINGS*
┣𖣠 ${m.prefix}autoreply on
┣𖣠 ${m.prefix}autoreply off
┣𖣠 ${m.prefix}autoreply add <trigger>|<reply>
┣𖣠 ${m.prefix}autoreply remove <trigger>
┣𖣠 ${m.prefix}autoreply list
┗━━━━━━━━━

*Placeholders:*
{name} - User's name
{tag} - @mention user
{time} - Current time
{date} - Current date
{group} - Group name

Example: ${m.prefix}autoreply add hello|Hello {name}!`,
                m
            )
        }
        
        const groupData = database.getGroup(m.chat)
        if (!groupData.customReplies) groupData.customReplies = []
        
        if (action === 'on') {
            groupData.autoreply = true
            database.setGroup(m.chat, groupData)
            return newsletter.sendText(sock, m.chat, '*AUTOREPLY*\n\n✓ Autoreply has been turned ON', m)
        }
        
        if (action === 'off') {
            groupData.autoreply = false
            database.setGroup(m.chat, groupData)
            return newsletter.sendText(sock, m.chat, '*AUTOREPLY*\n\n✓ Autoreply has been turned OFF', m)
        }
        
        if (action === 'add') {
            const fullText = m.fullArgs || ''
            const pipeIndex = fullText.indexOf('|')
            
            if (pipeIndex === -1) {
                return newsletter.sendText(sock, m.chat,
                    `*KNOX INFO*\n\nUse format: trigger|reply\nExample: hello|Hello {name}!`,
                    m
                )
            }
            
            const triggerStart = fullText.indexOf('add ') + 4
            const trigger = fullText.substring(triggerStart, pipeIndex).trim()
            const reply = fullText.substring(pipeIndex + 1).trim()
            
            if (!trigger || !reply) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nTrigger and reply cannot be empty', m)
            }
            
            let imagePath = null
            let imageBuffer = null
            
            if (m.quoted && m.quoted.message?.imageMessage) {
                imageBuffer = await m.quoted.download()
                const filename = `reply_${randomBytes(4).toString('hex')}.jpg`
                imagePath = path.join(MEDIA_DIR, filename)
                fs.writeFileSync(imagePath, imageBuffer)
            } else if (m.message?.imageMessage) {
                imageBuffer = await m.download()
                const filename = `reply_${randomBytes(4).toString('hex')}.jpg`
                imagePath = path.join(MEDIA_DIR, filename)
                fs.writeFileSync(imagePath, imageBuffer)
            }
            
            const existingIndex = groupData.customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
            
            const replyData = {
                trigger: trigger.toLowerCase(),
                reply: reply,
                image: imagePath,
                createdAt: Date.now()
            }
            
            if (existingIndex !== -1) {
                if (groupData.customReplies[existingIndex].image) {
                    try { fs.unlinkSync(groupData.customReplies[existingIndex].image) } catch {}
                }
                groupData.customReplies[existingIndex] = replyData
            } else {
                groupData.customReplies.push(replyData)
            }
            
            database.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat,
                `*AUTOREPLY ADDED*\n\nTrigger: ${trigger}\nReply: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\nTotal: ${groupData.customReplies.length} replies`,
                m
            )
            return
        }
        
        if (action === 'remove' || action === 'rm' || action === 'del') {
            const trigger = args.slice(1).join(' ').toLowerCase()
            
            if (!trigger) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nPlease provide trigger to remove', m)
            }
            
            const index = groupData.customReplies.findIndex(r => r.trigger === trigger)
            
            if (index === -1) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nTrigger "${trigger}" not found`, m)
            }
            
            if (groupData.customReplies[index].image) {
                try { fs.unlinkSync(groupData.customReplies[index].image) } catch {}
            }
            
            groupData.customReplies.splice(index, 1)
            database.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat,
                `*AUTOREPLY REMOVED*\n\nTrigger "${trigger}" has been removed`,
                m
            )
            return
        }
        
        if (action === 'list') {
            if (groupData.customReplies.length === 0) {
                return newsletter.sendText(sock, m.chat, '*AUTOREPLY*\n\nNo custom replies configured', m)
            }
            
            let listText = `*CUSTOM REPLIES (${groupData.customReplies.length})*\n\n`
            
            groupData.customReplies.forEach((r, i) => {
                const hasImage = r.image ? ' [IMAGE]' : ''
                listText += `${i + 1}. ${r.trigger}${hasImage}\n   → ${r.reply.substring(0, 50)}${r.reply.length > 50 ? '...' : ''}\n\n`
            })
            
            await newsletter.sendText(sock, m.chat, listText, m)
            return
        }
        
        await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nUnknown action. Use .autoreply for help', m)
    }
}