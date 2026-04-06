import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

export default {
    command: ['settings', 'groupsettings'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const groupMetadata = await sock.groupMetadata(m.chat)
        const groupData = database.getGroup(m.chat)
        
        const status = (value) => value ? 'ON' : 'OFF'
        
        const settingsText = `┏⧉ *GROUP SETTINGS*
┣𖣠 Group: ${groupMetadata.subject}
┣𖣠 Members: ${groupMetadata.participants.length}
┗━━━━━━━━━

┏⧉ *Protection*
┣𖣠 Antilink: ${status(groupData.antilink)}
┣𖣠 Antilink All: ${status(groupData.antilinkall)}
┣𖣠 Antitoxic: ${status(groupData.antitoxic)}
┣𖣠 Antibot: ${status(groupData.antibot)}
┣𖣠 Antimedia: ${status(groupData.antimedia)}
┣𖣠 Antisticker: ${status(groupData.antisticker)}
┣𖣠 Antidocument: ${status(groupData.antidocument)}
┣𖣠 Antiremove: ${status(groupData.antiremove)}
┣𖣠 Antitagsw: ${status(groupData.antitagsw)}
┣𖣠 Antispam: ${status(groupData.antispam)}
┗━━━━━━━━━

┏⧉ *Notifications*
┣𖣠 Welcome: ${status(groupData.welcome)}
┣𖣠 Goodbye: ${status(groupData.goodbye)}
┣𖣠 Promote: ${status(groupData.notifPromote)}
┣𖣠 Demote: ${status(groupData.notifDemote)}
┣𖣠 Tag Member: ${status(groupData.notifTagMember)}
┣𖣠 Label Change: ${status(groupData.notifLabelChange)}
┣𖣠 Open Group: ${status(groupData.notifOpenGroup)}
┣𖣠 Close Group: ${status(groupData.notifCloseGroup)}
┗━━━━━━━━━

┏⧉ *Auto Features*
┣𖣠 Auto Download: ${status(groupData.autodl)}
┣𖣠 Auto Forward: ${status(groupData.autoforward)}
┣𖣠 Auto Sticker: ${status(groupData.autosticker)}
┣𖣠 Auto Media: ${status(groupData.automedia)}
┣𖣠 Auto Reply: ${status(groupData.autoreply)}
┣𖣠 Auto AI: ${status(groupData.autoai?.enabled)}
┗━━━━━━━━━

┏⧉ *Other*
┣𖣠 Bot Mode: ${groupData.botMode || 'md'}
┣𖣠 Slowmode: ${status(groupData.slowmode?.enabled)} (${groupData.slowmode?.delay || 30}s)
┣𖣠 Custom Replies: ${groupData.customReplies?.length || 0}
┣𖣠 Toxic Words: ${groupData.toxicWords?.length || 0}
┣𖣠 Antilink List: ${groupData.antilinkList?.length || 0}
┗━━━━━━━━━

Use specific commands to toggle settings.`

        await newsletter.sendText(sock, m.chat, settingsText, m)
    }
}