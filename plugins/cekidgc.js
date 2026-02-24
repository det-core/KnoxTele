import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['cekidgc', 'idgc', 'groupid'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            let groupJid = null
            let groupMeta = null
            
            const input = text?.trim()
            
            if (input && input.includes('chat.whatsapp.com/')) {
                const inviteCode = input.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
                
                if (!inviteCode) {
                    return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid group link', m)
                }
                
                try {
                    groupMeta = await sock.groupGetInviteInfo(inviteCode)
                    groupJid = groupMeta?.id
                } catch (e) {
                    return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid or expired group link', m)
                }
            } else if (input && input.endsWith('@g.us')) {
                groupJid = input
                try {
                    groupMeta = await sock.groupMetadata(groupJid)
                } catch (e) {
                    return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nCannot access that group', m)
                }
            } else if (m.isGroup) {
                groupJid = m.chat
                groupMeta = await sock.groupMetadata(groupJid)
            } else {
                return newsletter.sendText(sock, m.chat,
                    `┏⧉ *GET GROUP ID*
┣𖣠 ${m.prefix}cekidgc (in group)
┣𖣠 ${m.prefix}cekidgc <group link>
┗━━━━━━━━━`,
                    m
                )
            }
            
            if (!groupMeta || !groupJid) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nCould not get group info', m)
            }
            
            const groupName = groupMeta?.subject || 'Unknown'
            const memberCount = groupMeta?.participants?.length || 0
            
            await newsletter.sendText(sock, m.chat,
                `*GROUP ID INFO*\n\n` +
                `Name: ${groupName}\n` +
                `ID: ${groupJid}\n` +
                `Members: ${memberCount}`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}