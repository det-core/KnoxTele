import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

async function createPterodactylUser(email, username, firstName, lastName) {
    const res = await axios.post(`${global.domain}/api/application/users`, {
        email, username, first_name: firstName, last_name: lastName,
        password: Math.random().toString(36).slice(2, 10) + 'Kx1!'
    }, {
        headers: {
            'Authorization': `Bearer ${global.apikey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    return res.data?.attributes
}

async function getPterodactylUserId(phone) {
    try {
        const res = await axios.get(`${global.domain}/api/application/users?filter[email]=${phone}@knox.bot`, {
            headers: {
                'Authorization': `Bearer ${global.apikey}`,
                'Accept': 'application/json'
            }
        })
        const users = res.data?.data || []
        return users.length > 0 ? users[0].attributes.id : null
    } catch {
        return null
    }
}

async function createPanelServer(name, panelData, userId) {
    const res = await axios.post(`${global.domain}/api/application/servers`, {
        name,
        user: userId,
        egg: parseInt(global.egg),
        docker_image: 'ghcr.io/pterodactyl/yolks:nodejs_18',
        startup: 'node index.js',
        environment: {
            SERVER_JARFILE: 'server.jar',
            BUILD_NUMBER: 'latest',
            USER_UPLOAD: '0',
            AUTO_UPDATE: '0'
        },
        limits: {
            memory: panelData.ram,
            swap: 0,
            disk: panelData.disk,
            io: 500,
            cpu: panelData.cpu
        },
        feature_limits: {
            databases: 1,
            allocations: 1,
            backups: 2
        },
        deploy: {
            locations: [parseInt(global.loc)],
            dedicated_ip: false,
            port_range: []
        }
    }, {
        headers: {
            'Authorization': `Bearer ${global.apikey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    return res.data?.attributes
}

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
                `┏⧉ *CREATE PANEL*\n` +
                `┣𖣠 ${m.prefix}cpanel <name>|<size>\n` +
                `┣𖣠 Example: ${m.prefix}cpanel MyBot|2gb\n` +
                `┗━━━━━━━━━\n\n` +
                `*Available Sizes:*\n` +
                Object.entries(global.panelPrices || {})
                    .map(([s, d]) => `  • ${s.toUpperCase()} — ${d.ram/1024}GB RAM — ₦${d.price.toLocaleString()}`)
                    .join('\n'),
                m
            )
        }

        const [name, size] = text.split('|').map(s => s.trim())
        const panelData = global.panelPrices?.[size?.toLowerCase()]

        if (!panelData) {
            return newsletter.sendText(sock, m.chat,
                `*KNOX INFO*\n\nInvalid size. Use: ${Object.keys(global.panelPrices || {}).join(', ')}`,
                m
            )
        }

        await m.react('⏳')
        await newsletter.sendText(sock, m.chat,
            `*⚙️ CREATING PANEL...*\n\nName: ${name}\nSize: ${size.toUpperCase()}\nRAM: ${panelData.ram/1024}GB\nCPU: ${panelData.cpu}%\nDisk: ${panelData.disk/1024}GB\n\nPlease wait...`,
            m
        )

        try {
            const phone = m.sender.split('@')[0]
            const email = `${phone}@knox.bot`

            // Get or create Pterodactyl user
            let pteroUserId = await getPterodactylUserId(phone)
            if (!pteroUserId) {
                const newUser = await createPterodactylUser(email, `knox_${phone}`, 'Knox', phone)
                pteroUserId = newUser?.id
            }

            if (!pteroUserId) throw new Error('Could not create panel user account')

            const server = await createPanelServer(name, panelData, pteroUserId)

            await m.react('✅')
            await newsletter.sendText(sock, m.chat,
                `*✅ PANEL CREATED SUCCESSFULLY*\n\n` +
                `Server: ${server.name}\n` +
                `ID: ${server.id}\n` +
                `UUID: ${server.uuid?.slice(0, 8)}...\n` +
                `RAM: ${panelData.ram/1024}GB\n` +
                `CPU: ${panelData.cpu}%\n` +
                `Disk: ${panelData.disk/1024}GB\n\n` +
                `🌐 Login: ${global.domain}\n` +
                `📧 Email: ${email}`,
                m
            )

        } catch (error) {
            await m.react('❌')
            const errMsg = error.response?.data?.errors?.[0]?.detail || error.message
            await newsletter.sendText(sock, m.chat,
                `*❌ PANEL CREATION FAILED*\n\nError: ${errMsg}\n\nCheck your panel domain/API key in config or contact owner.`,
                m
            )
        }
    }
}
