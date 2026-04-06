import newsletter from '../Bridge/newsletter.js'
import database from '../Bridge/database.js'

// Track call violations
const callViolations = new Map()

export default {
    command: ['anticall'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option || !['on', 'off', 'status'].includes(option)) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *ANTI-CALL SETTINGS*
┣𖣠 ${m.prefix}anticall on
┣𖣠 ${m.prefix}anticall off
┣𖣠 ${m.prefix}anticall status
┗━━━━━━━━━

When enabled, the bot will:
• Reject incoming calls
• Warn users not to call
• Track violations (3 strikes = block)`,
                m
            )
        }
        
        if (option === 'status') {
            const enabled = global.anticallEnabled || false
            return newsletter.sendText(sock, m.chat,
                `*ANTI-CALL STATUS*\n\nAnti-Call is currently: ${enabled ? 'ON' : 'OFF'}`,
                m
            )
        }
        
        if (option === 'on') {
            global.anticallEnabled = true
            await newsletter.sendText(sock, m.chat,
                `*ANTI-CALL ENABLED*\n\n` +
                `✓ Bot will now reject all calls\n` +
                `✓ Users will receive warning messages\n` +
                `✓ 3 violations = automatic block`,
                m
            )
        }
        
        if (option === 'off') {
            global.anticallEnabled = false
            callViolations.clear()
            await newsletter.sendText(sock, m.chat,
                `*ANTI-CALL DISABLED*\n\n✓ Bot will now accept calls`,
                m
            )
        }
    }
}

// Call handler function - Add this to your main wa.js
export async function handleIncomingCall(sock, call) {
    if (!global.anticallEnabled) return
    
    try {
        const caller = call.from
        const callerNumber = caller.split('@')[0]
        
        // Reject the call
        await sock.rejectCall(call.id, call.from)
        
        // Get violation count
        const violations = callViolations.get(caller) || 0
        const newCount = violations + 1
        callViolations.set(caller, newCount)
        
        // Auto-block after 3 violations
        if (newCount >= 3) {
            await sock.updateBlockStatus(caller, 'block')
            
            await sock.sendMessage(caller, {
                text: `*KNOX ANTI-CALL SYSTEM*\n\n` +
                      `You have been BLOCKED for making 3 calls to the bot.\n\n` +
                      `Please DO NOT call bot numbers.\n` +
                      `Use text messages only.`
            })
            
            // Log to owner
            for (const owner of global.owner) {
                const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net'
                await sock.sendMessage(ownerJid, {
                    text: `*ANTI-CALL ALERT*\n\n` +
                          `User @${callerNumber} has been BLOCKED for 3 call violations.`,
                    mentions: [caller]
                })
            }
            
            callViolations.delete(caller)
            
        } else {
            // Send warning message
            const warningsLeft = 3 - newCount
            
            await sock.sendMessage(caller, {
                text: `*KNOX ANTI-CALL SYSTEM*\n\n` +
                      `⚠️ *WARNING ${newCount}/3*\n\n` +
                      `Please DO NOT call the bot.\n` +
                      `This is an automated system.\n\n` +
                      `You have ${warningsLeft} warning${warningsLeft > 1 ? 's' : ''} left before being blocked.\n\n` +
                      `Use text messages only.`
            })
            
            // Log to owner for first violation
            if (newCount === 1) {
                for (const owner of global.owner) {
                    const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net'
                    await sock.sendMessage(ownerJid, {
                        text: `*ANTI-CALL ALERT*\n\n` +
                              `User @${callerNumber} called the bot.\n` +
                              `Warning 1/3 issued.`,
                        mentions: [caller]
                    })
                }
            }
        }
        
    } catch (error) {
        console.log('Anti-call error:', error.message)
    }
}