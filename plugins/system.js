import newsletter from '../Bridge/newsletter.js'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
    command: ['system', 'ram', 'cpu', 'disk', 'ping'],
    category: 'utility',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const cmd = m.command.toLowerCase()
        
        const formatSize = (bytes) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
            if (bytes === 0) return '0 Byte'
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
        }
        
        if (cmd === 'ram' || cmd === 'system') {
            const totalMem = os.totalmem()
            const freeMem = os.freemem()
            const usedMem = totalMem - freeMem
            
            await newsletter.sendText(sock, m.chat,
                `*RAM USAGE*\n\n` +
                `Total: ${formatSize(totalMem)}\n` +
                `Used: ${formatSize(usedMem)}\n` +
                `Free: ${formatSize(freeMem)}\n` +
                `Platform: ${os.platform()} (${os.arch()})`,
                m
            )
        }
        
        if (cmd === 'cpu') {
            const cpus = os.cpus()
            const model = cpus[0].model
            const speed = cpus[0].speed
            const cores = cpus.length
            
            const uptime = os.uptime()
            const hours = Math.floor(uptime / 3600)
            const minutes = Math.floor((uptime % 3600) / 60)
            const seconds = Math.floor(uptime % 60)
            
            await newsletter.sendText(sock, m.chat,
                `*CPU INFO*\n\n` +
                `Model: ${model}\n` +
                `Speed: ${speed} MHz\n` +
                `Cores: ${cores}\n` +
                `Server Uptime: ${hours}h ${minutes}m ${seconds}s`,
                m
            )
        }
        
        if (cmd === 'disk') {
            try {
                if (process.platform === 'win32') {
                    const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption')
                    const lines = stdout.trim().split('\n').slice(1)
                    let diskInfo = '*DISK USAGE*\n\n'
                    
                    lines.forEach(line => {
                        const parts = line.trim().split(/\s+/)
                        if (parts.length >= 3) {
                            const caption = parts[0]
                            const free = parseInt(parts[1])
                            const size = parseInt(parts[2])
                            const used = size - free
                            diskInfo += `Drive ${caption}:\n`
                            diskInfo += `  Total: ${formatSize(size)}\n`
                            diskInfo += `  Used: ${formatSize(used)}\n`
                            diskInfo += `  Free: ${formatSize(free)}\n\n`
                        }
                    })
                    
                    await newsletter.sendText(sock, m.chat, diskInfo, m)
                } else {
                    const { stdout } = await execAsync('df -h /')
                    const lines = stdout.trim().split('\n')
                    const parts = lines[1].replace(/\s+/g, ' ').split(' ')
                    
                    await newsletter.sendText(sock, m.chat,
                        `*DISK USAGE*\n\n` +
                        `Total: ${parts[1]}\n` +
                        `Used: ${parts[2]}\n` +
                        `Free: ${parts[3]}\n` +
                        `Use%: ${parts[4]}`,
                        m
                    )
                }
            } catch (e) {
                await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to get disk info', m)
            }
        }
        
        if (cmd === 'ping') {
            const timestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now()
            const now = Date.now()
            const latency = now - timestamp
            
            let speed = ''
            if (latency < 100) speed = 'Fast'
            else if (latency < 500) speed = 'Good'
            else if (latency < 1000) speed = 'Okay'
            else speed = 'Slow'
            
            await newsletter.sendText(sock, m.chat,
                `*PONG!*\n\nLatency: ${latency}ms\nResponse: ${speed}`,
                m
            )
        }
    }
}