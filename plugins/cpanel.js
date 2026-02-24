import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import database from '../Bridge/database.js'

export default {
    command: ['cpanel', 'createpanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!text || !text.includes('|')) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *CREATE PANEL*
┣𖣠 ${m.prefix}cpanel <name>|<size>
┣𖣠 Example: ${m.prefix}cpanel mypanel|2gb
┗━━━━━━━━━

*Available Sizes:*
${Object.keys(global.panelPrices || {}).map(s => `   ${s} - ${global.panelPrices[s].ram/1024}GB RAM - ₦${global.panelPrices[s].price}`).join('\n')}`,
                m
            )
        }
        
        const [name, size] = text.split('|').map(s => s.trim())
        
        if (!global.panelPrices || !global.panelPrices[size]) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nInvalid size. Available: ${Object.keys(global.panelPrices || {}).join(', ')}`,
                m
            )
        }
        
        const panelData = global.panelPrices[size]
        
        await newsletter.sendText(sock, m.chat,
            `*CREATING PANEL*\n\n` +
            `Name: ${name}\n` +
            `Size: ${size}\n` +
            `RAM: ${panelData.ram/1024}GB\n` +
            `CPU: ${panelData.cpu}%\n` +
            `Disk: ${panelData.disk/1024}GB\n` +
            `Price: ₦${panelData.price.toLocaleString()}\n\n` +
            `Processing...`,
            m
        )
        
        try {
            // Pterodactyl API logic here
            const response = await axios.post(
                `${global.domain}/api/application/servers`,
                {
                    name: name,
                    user: m.sender.split('@')[0],
                    egg: global.egg,
                    docker_image: 'quay.io/pterodactyl/core:java',
                    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                    environment: {
                        SERVER_JARFILE: 'server.jar',
                        BUILD_NUMBER: 'latest'
                    },
                    limits: {
                        memory: panelData.ram,
                        swap: 0,
                        disk: panelData.disk,
                        io: 500,
                        cpu: panelData.cpu
                    },
                    feature_limits: {
                        databases: 0,
                        allocations: 0,
                        backups: 0
                    },
                    allocation: {
                        default: 1
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${global.apikey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            if (response.data && response.data.attributes) {
                const server = response.data.attributes
                
                await newsletter.sendText(sock, m.chat,
                    `*PANEL CREATED SUCCESSFULLY*\n\n` +
                    `Server ID: ${server.id}\n` +
                    `Name: ${server.name}\n` +
                    `Node: ${server.node}\n` +
                    `SFTP: ${server.sftp_details}\n\n` +
                    `Login at: ${global.domain}`,
                    m
                )
            } else {
                throw new Error('Failed to create panel')
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat,
                `*PANEL CREATION FAILED*\n\nError: ${error.message}\n\nPlease use manual payment or contact owner.`,
                m
            )
        }
    }
}