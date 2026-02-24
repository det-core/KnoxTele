import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['delpanel', 'deletepanel'],
    category: 'cpanel',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const serverId = text?.trim()
        
        if (!serverId) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *DELETE PANEL*
┣𖣠 ${m.prefix}delpanel <server_id>
┣𖣠 Example: ${m.prefix}delpanel 123
┗━━━━━━━━━`,
                m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*DELETING PANEL*\n\nServer ID: ${serverId}...`, m)
        
        try {
            const response = await axios.delete(
                `${global.domain}/api/application/servers/${serverId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${global.apikey}`,
                        'Accept': 'application/json'
                    }
                }
            )
            
            if (response.status === 204) {
                await newsletter.sendText(sock, m.chat,
                    `*PANEL DELETED*\n\nServer ID ${serverId} has been deleted successfully.`,
                    m
                )
            } else {
                throw new Error('Failed to delete panel')
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat,
                `*DELETE FAILED*\n\nError: ${error.message}`,
                m
            )
        }
    }
}